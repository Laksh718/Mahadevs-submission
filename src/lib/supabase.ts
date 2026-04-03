import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface FloodReport {
  id?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  location: {
    lat: number;
    lng: number;
    address: string;
    state: string;
    district: string;
  };
  images: string[];
  status: "pending" | "verified" | "resolved" | "false_alarm";
  created_at?: string;
  updated_at?: string;
}

export interface LocationData {
  id?: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  current_water_level: number;
  risk_level: "safe" | "warning" | "critical";
  weather_data: {
    temperature: number;
    humidity: number;
    precipitation: number;
    wind_speed: number;
  };
  last_updated: string;
}

export interface UserLocation {
  id?: string;
  user_id: string;
  lat: number;
  lng: number;
  address: string;
  state: string;
  district: string;
  is_primary: boolean;
  created_at?: string;
}

// Helper functions
// Convert file to base64 for fallback storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadMedia = async (
  file: File,
  bucket: string = "reports-images"
): Promise<string | null> => {
  try {
    // Use reports-images bucket with folder path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Upload to reports-images bucket in reports-images folder
    const folderPath = "reports-images"; // This creates a folder inside the bucket
    const fullPath = `${folderPath}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file);

    if (!error) {
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

      return urlData.publicUrl;
    } else {
      // Try fallback buckets if reports-images fails
      const fallbackBuckets = ["image", "uploads", "files", "media", "images"];

      for (const bucketName of fallbackBuckets) {
        const { data: fallbackData, error: fallbackError } =
          await supabase.storage.from(bucketName).upload(fullPath, file);

        if (!fallbackError) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fullPath);

          return urlData.publicUrl;
        }
      }
    }

    // If all bucket uploads failed, fallback to base64
    const base64Data = await fileToBase64(file);
    return base64Data;
  } catch (error) {
    // Fallback to base64
    try {
      const base64Data = await fileToBase64(file);
      return base64Data;
    } catch (base64Error) {
      return null;
    }
  }
};

export const deleteImage = async (
  url: string,
  bucket: string = "reports-images"
): Promise<boolean> => {
  try {
    // Extract the full path from the URL
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const folderPath = "reports-images";
    const fullPath = `${folderPath}/${fileName}`;

    console.log("Deleting file:", fullPath, "from bucket:", bucket);

    const { error } = await supabase.storage.from(bucket).remove([fullPath]);

    if (error) {
      console.error("Error deleting file:", error);
      return false;
    }

    console.log("File deleted successfully:", fullPath);
    return true;
  } catch (error) {
    console.error("Exception deleting file:", error);
    return false;
  }
};

// Delete a flood report
export const deleteFloodReport = async (reportId: string): Promise<boolean> => {
  try {
    console.log("Deleting flood report:", reportId);

    const { error } = await supabase
      .from("flood_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      return false;
    }

    console.log("Report deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception deleting report:", error);
    return false;
  }
};

export const submitFloodReport = async (
  report: Omit<FloodReport, "id" | "created_at" | "updated_at">
): Promise<FloodReport | null> => {
  try {
    const { data, error } = await supabase
      .from("flood_reports")
      .insert([report])
      .select()
      .single();

    if (error) {
      console.error("Error submitting report:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error submitting report:", error);
    return null;
  }
};

export const getLocationData = async (
  state: string,
  district?: string
): Promise<LocationData[]> => {
  try {
    console.log("Fetching location data for:", { state, district });

    let query = supabase.from("location_data").select("*").eq("state", state);

    if (district) {
      query = query.eq("district", district);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching location data:", error);

      // If table doesn't exist, return sample data
      if (
        error.code === "PGRST116" ||
        error.message.includes('relation "location_data" does not exist')
      ) {
        console.log("Location data table not found, returning sample data");
        return getSampleLocationData(state, district);
      }

      return [];
    }

    console.log("Location data fetched:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching location data:", error);
    return getSampleLocationData(state, district);
  }
};

// Sample location data for when the table doesn't exist
const getSampleLocationData = (
  state: string,
  district?: string
): LocationData[] => {
  const sampleData: LocationData[] = [
    {
      id: "1",
      state: "Tamil Nadu",
      district: "Chennai",
      lat: 13.0827,
      lng: 80.2707,
      current_water_level: 2.5,
      risk_level: "warning",
      weather_data: {
        temperature: 28,
        humidity: 85,
        precipitation: 15,
        wind_speed: 12,
      },
      last_updated: new Date().toISOString(),
    },
    {
      id: "2",
      state: "Tamil Nadu",
      district: "Chennai Central",
      lat: 13.09,
      lng: 80.28,
      current_water_level: 3.2,
      risk_level: "critical",
      weather_data: {
        temperature: 26,
        humidity: 90,
        precipitation: 25,
        wind_speed: 18,
      },
      last_updated: new Date().toISOString(),
    },
    {
      id: "3",
      state: "Tamil Nadu",
      district: "Chennai North",
      lat: 13.1,
      lng: 80.29,
      current_water_level: 1.8,
      risk_level: "safe",
      weather_data: {
        temperature: 30,
        humidity: 75,
        precipitation: 8,
        wind_speed: 10,
      },
      last_updated: new Date().toISOString(),
    },
    {
      id: "4",
      state: "Tamil Nadu",
      district: "Chennai South",
      lat: 13.07,
      lng: 80.26,
      current_water_level: 2.1,
      risk_level: "warning",
      weather_data: {
        temperature: 29,
        humidity: 80,
        precipitation: 12,
        wind_speed: 14,
      },
      last_updated: new Date().toISOString(),
    },
  ];

  // Filter by state and district if provided
  let filteredData = sampleData.filter((location) => location.state === state);

  if (district) {
    filteredData = filteredData.filter(
      (location) => location.district === district
    );
  }

  return filteredData;
};

// Get user-specific reports (only reports created by the current user)
export const getUserReports = async (
  userId: string
): Promise<FloodReport[]> => {
  try {
    console.log("Fetching reports for user:", userId);

    // Try using the custom function first (if available)
    const { data: functionData, error: functionError } = await supabase.rpc(
      "get_user_reports",
      { user_uuid: userId }
    );

    if (!functionError && functionData) {
      console.log("User reports data from function:", functionData);
      return functionData;
    } else if (functionError) {
      console.warn(
        "RPC function error, falling back to direct query:",
        functionError
      );
    }

    // Fallback to direct query
    console.log("Function not available, using direct query");
    const { data, error } = await supabase
      .from("flood_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reports:", error);
      return [];
    }

    console.log("User reports data:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return [];
  }
};

// Get community reports filtered by region
export const getCommunityReports = async (
  state: string,
  district?: string
): Promise<FloodReport[]> => {
  try {
    console.log("Fetching community reports for region:", { state, district });

    let query = supabase
      .from("flood_reports")
      .select("*")
      .eq("location->>state", state)
      .order("created_at", { ascending: false });

    if (district) {
      query = query.eq("location->>district", district);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching community reports:", error);
      return [];
    }

    console.log("Community reports data:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching community reports:", error);
    return [];
  }
};

// Get nearby reports (for admin or public view - includes all users)
export const getNearbyReports = async (
  lat: number,
  lng: number,
  radiusKm: number = 50
): Promise<FloodReport[]> => {
  try {
    console.log("Fetching nearby reports for location:", {
      lat,
      lng,
      radiusKm,
    });

    // First try to get all reports ordered by creation date
    const { data, error } = await supabase
      .from("flood_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100); // Get more reports to filter from

    if (error) {
      console.error("Error fetching nearby reports:", error);
      // If there's an error, try a simpler query without ordering
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("flood_reports")
        .select("*")
        .limit(50);

      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }

      console.log("Using fallback data:", fallbackData);
      return fallbackData || [];
    }

    console.log("Raw reports data:", data);

    if (!data || data.length === 0) {
      console.log("No reports found in database");
      return [];
    }

    // Simple distance filtering (in production, use PostGIS)
    const filteredReports = data.filter((report) => {
      try {
        // Handle different possible location data structures
        let reportLat, reportLng;

        if (report.location && typeof report.location === "object") {
          reportLat = report.location.lat;
          reportLng = report.location.lng;
        } else if (report.lat && report.lng) {
          // Fallback if location is stored directly on the report
          reportLat = report.lat;
          reportLng = report.lng;
        } else {
          console.warn("Report missing location data:", report);
          return false;
        }

        if (typeof reportLat !== "number" || typeof reportLng !== "number") {
          console.warn("Invalid location data in report:", report);
          return false;
        }

        const distance = calculateDistance(lat, lng, reportLat, reportLng);
        return distance <= radiusKm;
      } catch (err) {
        console.warn("Error processing report location:", err, report);
        return false;
      }
    });

    console.log("Filtered reports:", filteredReports);

    // If no reports found within radius, return all recent reports as fallback
    if (filteredReports.length === 0 && data.length > 0) {
      console.log(
        "No reports within radius, returning all recent reports as fallback"
      );
      return data.slice(0, 20); // Return top 20 most recent reports
    }

    return filteredReports;
  } catch (error) {
    console.error("Error fetching nearby reports:", error);
    return [];
  }
};

// Get user report statistics
export const getUserReportStats = async (
  userId: string
): Promise<{
  total_reports: number;
  critical_reports: number;
  verified_reports: number;
  pending_reports: number;
  resolved_reports: number;
}> => {
  try {
    console.log("Fetching report stats for user:", userId);

    // Try using the custom function first (if available)
    const { data: functionData, error: functionError } = await supabase.rpc(
      "get_user_report_stats",
      { user_uuid: userId }
    );

    if (!functionError && functionData && functionData.length > 0) {
      console.log("User report stats from function:", functionData[0]);
      return functionData[0];
    }

    // Fallback to direct query
    console.log("Function not available, using direct query");
    const { data, error } = await supabase
      .from("flood_reports")
      .select("severity, status")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user report stats:", error);
      return {
        total_reports: 0,
        critical_reports: 0,
        verified_reports: 0,
        pending_reports: 0,
        resolved_reports: 0,
      };
    }

    const stats = {
      total_reports: data?.length || 0,
      critical_reports:
        data?.filter((r) => r.severity === "critical").length || 0,
      verified_reports:
        data?.filter((r) => r.status === "verified").length || 0,
      pending_reports: data?.filter((r) => r.status === "pending").length || 0,
      resolved_reports:
        data?.filter((r) => r.status === "resolved").length || 0,
    };

    console.log("User report stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error fetching user report stats:", error);
    return {
      total_reports: 0,
      critical_reports: 0,
      verified_reports: 0,
      pending_reports: 0,
      resolved_reports: 0,
    };
  }
};

export const getAllReports = async (): Promise<FloodReport[]> => {
  try {
    console.log("Fetching all flood reports");
    const { data, error } = await supabase
      .from("flood_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500); // Limit to a reasonable number for heatmap

    if (error) {
      console.error("Error fetching all reports:", error);
      return [];
    }
    console.log("Fetched all reports:", data.length);
    return data || [];
  } catch (error) {
    console.error("Error fetching all reports:", error);
    return [];
  }
};

// Vote and Comment interfaces
export interface Vote {
  id?: string;
  user_id: string;
  report_id: string;
  vote_type: "up" | "down";
  created_at?: string;
}

export interface Comment {
  id?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  report_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Vote functions
export const voteOnReport = async (
  userId: string,
  reportId: string,
  voteType: "up" | "down"
): Promise<boolean> => {
  try {
    console.log("Voting on report:", { userId, reportId, voteType });

    // First, check if user already voted on this report
    const { data: existingVote, error: checkError } = await supabase
      .from("report_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("report_id", reportId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing vote:", checkError);
      // If table doesn't exist, return false but don't crash
      if (
        checkError.code === "42P01" ||
        checkError.message.includes("does not exist")
      ) {
        console.warn("report_votes table doesn't exist, skipping vote");
        return false;
      }
      return false;
    }

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking the same vote type
        const { error: deleteError } = await supabase
          .from("report_votes")
          .delete()
          .eq("id", existingVote.id);

        if (deleteError) {
          console.error("Error removing vote:", deleteError);
          return false;
        }
      } else {
        // Update vote type
        const { error: updateError } = await supabase
          .from("report_votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id);

        if (updateError) {
          console.error("Error updating vote:", updateError);
          return false;
        }
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from("report_votes")
        .insert([
          { user_id: userId, report_id: reportId, vote_type: voteType },
        ]);

      if (insertError) {
        console.error("Error creating vote:", insertError);
        // If table doesn't exist, return false but don't crash
        if (
          insertError.code === "42P01" ||
          insertError.message.includes("does not exist")
        ) {
          console.warn("report_votes table doesn't exist, skipping vote");
          return false;
        }
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error voting on report:", error);
    return false;
  }
};

export const getUserVote = async (
  userId: string,
  reportId: string
): Promise<"up" | "down" | null> => {
  try {
    const { data, error } = await supabase
      .from("report_votes")
      .select("vote_type")
      .eq("user_id", userId)
      .eq("report_id", reportId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error getting user vote:", error);
      // If table doesn't exist, return null
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("report_votes table doesn't exist, returning null");
        return null;
      }
      return null;
    }

    return data?.vote_type || null;
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
};

export const getReportVoteCounts = async (
  reportId: string
): Promise<{
  upvotes: number;
  downvotes: number;
}> => {
  try {
    const { data, error } = await supabase
      .from("report_votes")
      .select("vote_type")
      .eq("report_id", reportId);

    if (error) {
      console.error("Error getting vote counts:", error);
      // If table doesn't exist, return zeros
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("report_votes table doesn't exist, returning zero counts");
        return { upvotes: 0, downvotes: 0 };
      }
      return { upvotes: 0, downvotes: 0 };
    }

    const upvotes = data?.filter((vote) => vote.vote_type === "up").length || 0;
    const downvotes =
      data?.filter((vote) => vote.vote_type === "down").length || 0;

    return { upvotes, downvotes };
  } catch (error) {
    console.error("Error getting vote counts:", error);
    return { upvotes: 0, downvotes: 0 };
  }
};

// Comment functions
export const addComment = async (
  userId: string,
  userName: string,
  userEmail: string,
  reportId: string,
  content: string
): Promise<Comment | null> => {
  try {
    console.log("Adding comment:", { userId, reportId, content });

    const { data, error } = await supabase
      .from("report_comments")
      .insert([
        {
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          report_id: reportId,
          content: content,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      // If table doesn't exist, return null
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("report_comments table doesn't exist, skipping comment");
        return null;
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
};

export const getReportComments = async (
  reportId: string
): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from("report_comments")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error getting comments:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
};

export const getReportCommentCount = async (
  reportId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("report_comments")
      .select("*", { count: "exact", head: true })
      .eq("report_id", reportId);

    if (error) {
      console.error("Error getting comment count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting comment count:", error);
    return 0;
  }
};

export const saveUserLocation = async (
  location: Omit<UserLocation, "id" | "created_at">
): Promise<UserLocation | null> => {
  try {
    const { data, error } = await supabase
      .from("user_locations")
      .insert([location])
      .select()
      .single();

    if (error) {
      console.error("Error saving user location:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error saving user location:", error);
    return null;
  }
};

// Utility function to calculate distance between two points
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
};
