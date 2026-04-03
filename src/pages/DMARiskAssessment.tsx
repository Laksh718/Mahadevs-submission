import React from "react";
import NDMALayout from "@/components/NDMALayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

const DMARiskAssessment = () => {
  return (
    <NDMALayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              DMA Risk Assessment
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive risk analysis and vulnerability assessment
            </p>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    High Risk Areas
                  </p>
                  <p className="text-2xl font-bold text-red-800">3</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Overall Score
                  </p>
                  <p className="text-2xl font-bold text-orange-800">7.2/10</p>
                </div>
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Vulnerability Index
                  </p>
                  <p className="text-2xl font-bold text-blue-800">Medium</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Preparedness
                  </p>
                  <p className="text-2xl font-bold text-green-800">85%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "Flood Risk", level: "High", color: "red" },
                  { category: "Earthquake Risk", level: "Low", color: "green" },
                  {
                    category: "Cyclone Risk",
                    level: "Medium",
                    color: "yellow",
                  },
                  { category: "Fire Risk", level: "Low", color: "green" },
                ].map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{risk.category}</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium text-${risk.color}-800 bg-${risk.color}-100`}
                    >
                      {risk.level}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mitigation Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Early warning system deployment",
                  "Community preparedness training",
                  "Infrastructure reinforcement",
                  "Emergency response planning",
                ].map((strategy, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">{strategy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NDMALayout>
  );
};

export default DMARiskAssessment;
