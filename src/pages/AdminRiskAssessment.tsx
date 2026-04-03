import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import FloodDamageAnalysis from "@/components/FloodDamageAnalysis";
import { ResilienceIndexDashboard } from "@/components/ResilienceIndexDashboard";
import { Shield, BarChart3, Camera, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminRiskAssessment = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-teal-600" />
              Risk Assessment & Intelligence
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive risk analysis with AI-powered damage assessment and
              resilience metrics
            </p>
          </div>
        </div>

        {/* Enhanced Risk Assessment Tabs */}
        <Tabs defaultValue="resilience" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="resilience"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Resilience Index</span>
            </TabsTrigger>
            <TabsTrigger value="damage" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Image Assessment</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Risk Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resilience">
            <ResilienceIndexDashboard />
          </TabsContent>

          <TabsContent value="damage">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Flood Damage Assessment</CardTitle>
                <CardDescription>
                  Upload images for automated damage analysis and assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FloodDamageAnalysis />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Risk Analytics Dashboard</CardTitle>
                <CardDescription>
                  Advanced risk analysis and predictive modeling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Advanced risk analytics dashboard coming soon...</p>
                  <p className="text-sm mt-2">
                    Will include predictive flood modeling, risk zone analysis,
                    and vulnerability assessments
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminRiskAssessment;
