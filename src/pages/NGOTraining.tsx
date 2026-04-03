import React from "react";
import NGOLayout from "@/components/NGOLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Users, Calendar, Award } from "lucide-react";

const NGOTraining = () => {
  return (
    <NGOLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NGO Training Programs
            </h1>
            <p className="text-gray-600 mt-1">
              Community education and volunteer training
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <BookOpen className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Programs
                  </p>
                  <p className="text-3xl font-bold text-purple-800">18</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Active Sessions
                  </p>
                  <p className="text-3xl font-bold text-blue-800">5</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Trainees</p>
                  <p className="text-3xl font-bold text-green-800">342</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
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
                  <p className="text-3xl font-bold text-yellow-800">156</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Training Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                NGO training management interface will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </NGOLayout>
  );
};

export default NGOTraining;
