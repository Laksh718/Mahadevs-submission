import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar, MapPin, Users } from "lucide-react";

const VolunteerReports = () => {
  return (
    <UserLayout title="Volunteer Reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-1">
              View and submit activity reports
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <FileText className="w-4 h-4 mr-2" />
            Submit Report
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Submitted Reports
                  </p>
                  <p className="text-3xl font-bold text-green-800">18</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    People Reached
                  </p>
                  <p className="text-3xl font-bold text-blue-800">245</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Activities
                  </p>
                  <p className="text-3xl font-bold text-purple-800">24</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Flood Relief Distribution Report",
                  location: "District Center",
                  date: "Dec 10, 2024",
                  participants: "45 families",
                  status: "Approved",
                },
                {
                  title: "Community Training Session",
                  location: "Community Hall",
                  date: "Dec 8, 2024",
                  participants: "32 participants",
                  status: "Under Review",
                },
                {
                  title: "Emergency Shelter Setup",
                  location: "School Ground",
                  date: "Dec 5, 2024",
                  participants: "15 volunteers",
                  status: "Approved",
                },
                {
                  title: "Health Camp Organization",
                  location: "Village Center",
                  date: "Dec 3, 2024",
                  participants: "67 beneficiaries",
                  status: "Approved",
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {report.participants}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        report.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : report.status === "Under Review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {report.status}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default VolunteerReports;
