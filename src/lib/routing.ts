import polyline from "@mapbox/polyline";
import type { RouteResult } from "./firebase";
import { getSheltersWithinRadius } from "./indianShelterData";
import { getSafeRouteFunction, getNearestShelterFunction } from "./firebase";

export interface LatLng {
  lat: number;
  lon: number;
}

const GRAPH_HOPPER_API = import.meta.env.VITE_GRAPHOPPER_API_URL || "https://graphhopper.com/api/1";
const GRAPH_HOPPER_KEY = import.meta.env.VITE_GRAPHOPPER_API_KEY || "";

export const decodePolyline = (encoded: string): [number, number][] => {
  return polyline.decode(encoded).map(([lat, lng]) => [lat, lng]);
};

export async function getSafeRoute(
  start: LatLng,
  destination: LatLng,
  blockedEdges: string[] = []
): Promise<RouteResult> {
  // Try Cloud Functions first
  try {
    const getSafeRoute = getSafeRouteFunction();
    const result = await getSafeRoute({
      start,
      destination,
      blockedEdges
    });
    return result.data as RouteResult;
  } catch (error) {
    console.warn("Cloud Functions not available, falling back to direct GraphHopper:", error);
  }

  // Fallback to direct GraphHopper API
  const shouldMock = !GRAPH_HOPPER_API || !GRAPH_HOPPER_KEY;
  if (shouldMock) {
    const steps = [
      "Head north",
      "Turn right",
      "Avoid flooded area",
      "Arrive at shelter",
    ];
    const simpleLine: [number, number][] = [
      [start.lat, start.lon],
      [(start.lat + destination.lat) / 2, (start.lon + destination.lon) / 2],
      [destination.lat, destination.lon],
    ];
    const encoded = polyline.encode(simpleLine);
    return {
      route: {
        polyline: encoded,
        distance_km: 4.7,
        duration_min: 11,
        steps,
      },
      warnings: ["Mocked response: configure GraphHopper to enable live routing"],
    };
  }

  const url = new URL(`${GRAPH_HOPPER_API}/route`);
  url.searchParams.set("point", `${start.lat},${start.lon}`);
  url.searchParams.append("point", `${destination.lat},${destination.lon}`);
  url.searchParams.set("profile", "car");
  url.searchParams.set("locale", "en");
  url.searchParams.set("points_encoded", "true");
  url.searchParams.set("instructions", "true");
  if (blockedEdges.length) {
    url.searchParams.set("block_area", blockedEdges.join(","));
  }
  url.searchParams.set("key", GRAPH_HOPPER_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Routing failed: ${res.status}`);
  const json = await res.json();
  const path = json.paths?.[0];
  if (!path) throw new Error("No route found");

  return {
    route: {
      polyline: path.points,
      distance_km: path.distance / 1000,
      duration_min: path.time / 60000,
      steps: (path.instructions || []).map((i: any) => i.text),
    },
    warnings: json.info?.warnings || [],
  };
}

export async function getNearestShelter(
  start: LatLng
): Promise<{ shelter: { name: string; lat: number; lon: number; capacity_available: number; shelter_id?: string } }> {
  // Try Cloud Functions first
  try {
    const getNearestShelter = getNearestShelterFunction();
    const result = await getNearestShelter({
      lat: start.lat,
      lon: start.lon,
      radiusKm: 20
    });
    return result.data as { shelter: { name: string; lat: number; lon: number; capacity_available: number; shelter_id?: string } };
  } catch (error) {
    console.warn("Cloud Functions not available, falling back to local data:", error);
  }

  // Fallback to local Indian shelter data
  const nearbyShelters = getSheltersWithinRadius(start.lat, start.lon, 20);
  
  if (nearbyShelters.length === 0) {
    // Fallback to any operational shelter
    const allShelters = getSheltersWithinRadius(start.lat, start.lon, 100);
    if (allShelters.length === 0) {
      throw new Error("No shelters available in the area");
    }
    const shelter = allShelters[0];
    return {
      shelter: {
        name: shelter.name,
        lat: shelter.lat,
        lon: shelter.lon,
        capacity_available: shelter.available,
        shelter_id: shelter.shelter_id,
      },
    };
  }

  // Sort by available capacity (descending) and pick the best one
  const bestShelter = nearbyShelters.sort((a, b) => b.available - a.available)[0];
  
  return {
    shelter: {
      name: bestShelter.name,
      lat: bestShelter.lat,
      lon: bestShelter.lon,
      capacity_available: bestShelter.available,
      shelter_id: bestShelter.shelter_id,
    },
  };
}