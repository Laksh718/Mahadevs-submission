import React from "react";
import NGOLayout from "@/components/NGOLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart, Activity, Users, Heart } from "lucide-react";

const NGOAnalytics = () => {
  return (
    <NGOLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO Field Analytics</h1>
            <p className="text-gray-600 mt-1">Data insights for community impact and operations</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Community Reach</p>
                  <p className="text-3xl font-bold text-purple-800">15,420</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Response Rate</p>
                  <p className="text-3xl font-bold text-green-800">89%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">Active Programs</p>
                  <p className="text-3xl font-bold text-pink-800">28</p>
                </div>
                <Activity className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Impact Score</p>
                  <p className="text-3xl font-bold text-blue-800">8.7/10</p>
                </div>
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Program Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Performance chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Resource Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Resource allocation chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Community Impact Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { metric: "Families Supported", value: "2,450", change: "+12%" },
                { metric: "Volunteer Hours", value: "8,920", change: "+25%" },
                { metric: "Relief Packages", value: "5,680", change: "+18%" }
              ].map((item, index) => (
                <div key={index} className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-800">{item.value}</p>
                  <p className="text-sm text-gray-600 mb-1">{item.metric}</p>
                  <p className="text-xs text-green-600 font-medium">{item.change} vs last month</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </NGOLayout>
  );
};

export default NGOAnalytics;