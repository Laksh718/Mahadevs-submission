import React from "react";
import NGOLayout from "@/components/NGOLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, Navigation, Target, Map, Satellite } from "lucide-react";

const NGOGISMapping = () => {
  return (
    <NGOLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO GIS Mapping</h1>
            <p className="text-gray-600 mt-1">Map relief operations and community needs</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <MapPin className="w-4 h-4 mr-2" />
            Mark Relief Point
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Community Relief Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Interactive relief operations map will be loaded here</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Map Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Relief Centers", "Distribution Points", "Volunteer Teams", "Beneficiaries", "Partner Locations"].map((layer) => (
                  <div key={layer} className="flex items-center justify-between">
                    <span className="text-sm">{layer}</span>
                    <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Add Relief Point
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Navigation className="w-4 h-4 mr-2" />
                  Plan Route
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Satellite className="w-4 h-4 mr-2" />
                  Satellite View
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Relief Centers</h3>
              <p className="text-2xl font-bold text-purple-600">24</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Navigation className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Active Routes</h3>
              <p className="text-2xl font-bold text-green-600">8</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto text-pink-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Coverage Area</h3>
              <p className="text-2xl font-bold text-pink-600">45km²</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOGISMapping;