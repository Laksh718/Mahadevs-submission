import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { AutomatedReportSystem } from "@/components/AutomatedReportSystem";
import { UserProfile } from "@/lib/roleBasedAuth";

// Mock user profile - in real implementation, this would come from auth context
const mockUserProfile: UserProfile = {
  id: "admin-1",
  email: "admin@jalrakshak.gov.in",
  role: "ADMIN" as any,
  name: "System Administrator",
  organization: "National Disaster Management Authority",
  district: "New Delhi",
  state: "Delhi",
  permissions: [],
  isActive: true,
  createdAt: new Date(),
};

const AdminReportSystem = () => {
  return (
    <AdminLayout>
      <AutomatedReportSystem userProfile={mockUserProfile} />
    </AdminLayout>
  );
};

export default AdminReportSystem;
