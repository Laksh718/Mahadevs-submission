import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import NGOLayout from "@/components/NGOLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  TrendingUp,
  Users,
  Heart,
  Award,
  Download,
} from "lucide-react";

const NGOReports = () => {
  const { theme } = useTheme();
  return (
    <NGOLayout>
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-purple-600, .text-purple-800,
          .text-green-600, .text-green-800, .text-blue-600, .text-blue-800 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\/80, .bg-white\/90, .bg-white\/95 {
            background-color: hsl(0, 0%, 10%) !important;
          }
        ` : ''}
      `}</style>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NGO Impact Reports
            </h1>
            <p className="text-gray-600 mt-1">
              Track and report community impact and relief efforts
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Impact Reports
                  </p>
                  <p className="text-3xl font-bold text-purple-800">36</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Lives Impacted
                  </p>
                  <p className="text-3xl font-bold text-green-800">8,450</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">
                    Relief Operations
                  </p>
                  <p className="text-3xl font-bold text-pink-800">124</p>
                </div>
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Success Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-800">94%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Flood Relief - District A",
                    date: "Dec 10, 2024",
                    status: "Published",
                  },
                  {
                    title: "Community Training Impact",
                    date: "Dec 8, 2024",
                    status: "Draft",
                  },
                  {
                    title: "Emergency Response Q4",
                    date: "Dec 5, 2024",
                    status: "Published",
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {report.title}
                      </p>
                      <p className="text-sm text-gray-500">{report.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.status}
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Key Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Provided shelter to 1,200+ families",
                  "Distributed 5,000+ relief packages",
                  "Trained 300+ community volunteers",
                  "Established 15 relief distribution centers",
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NGOLayout>
  );
};

export default NGOReports;
