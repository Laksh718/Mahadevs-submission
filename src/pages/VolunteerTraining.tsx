import React from "react";
import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Play,
  CheckCircle,
} from "lucide-react";

const VolunteerTraining = () => {
  return (
    <UserLayout title="Volunteer Training">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Training Programs
            </h1>
            <p className="text-gray-600 mt-1">
              Enhance your skills and earn certifications
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Courses
          </Button>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Completed Courses
                  </p>
                  <p className="text-3xl font-bold text-green-800">12</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold text-blue-800">3</p>
                </div>
                <Play className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    Certifications
                  </p>
                  <p className="text-3xl font-bold text-yellow-800">5</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Study Hours
                  </p>
                  <p className="text-3xl font-bold text-purple-800">89</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Available Training Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Emergency First Aid",
                  duration: "4 hours",
                  level: "Beginner",
                  status: "Available",
                  description:
                    "Learn basic first aid and emergency response techniques",
                },
                {
                  title: "Disaster Management",
                  duration: "8 hours",
                  level: "Intermediate",
                  status: "In Progress",
                  description:
                    "Comprehensive disaster response and management training",
                },
                {
                  title: "Community Coordination",
                  duration: "6 hours",
                  level: "Advanced",
                  status: "Available",
                  description:
                    "Leadership and coordination skills for community response",
                },
                {
                  title: "Mental Health Support",
                  duration: "5 hours",
                  level: "Intermediate",
                  status: "Available",
                  description:
                    "Providing psychological first aid to disaster victims",
                },
              ].map((course, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        course.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{course.duration}</span>
                      <span>{course.level}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      {course.status === "Available"
                        ? "Start Course"
                        : "Continue"}
                    </Button>
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

export default VolunteerTraining;
