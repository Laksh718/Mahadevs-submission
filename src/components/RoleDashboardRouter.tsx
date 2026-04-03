import React from "react";
import { Navigate } from "react-router-dom";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { UserRole, RoleBasedAuthService } from "@/lib/roleBasedAuth";

const RoleDashboardRouter: React.FC = () => {
  const { userProfile, loading } = useRoleAwareAuth();

  console.log("🎯 RoleDashboardRouter:", {
    loading,
    hasProfile: !!userProfile,
    userRole: userProfile?.role,
  });

  if (loading) {
    console.log("⏳ RoleDashboardRouter: Still loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    console.log("❌ RoleDashboardRouter: No profile, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Route to appropriate dashboard based on role
  console.log(
    "🚀 RoleDashboardRouter: Routing user with role:",
    userProfile.role
  );

  switch (userProfile.role) {
    case UserRole.ADMIN:
      console.log("➡️ Redirecting to /admin");
      return <Navigate to="/admin" replace />;

    case UserRole.DMA:
      console.log("➡️ Redirecting to /dma-dashboard");
      return <Navigate to="/dma-dashboard" replace />;

    case UserRole.NGO:
      console.log("➡️ Redirecting to /ngo-dashboard");
      return <Navigate to="/ngo-dashboard" replace />;

    case UserRole.VOLUNTEER:
      console.log("➡️ Redirecting to /volunteer-dashboard");
      return <Navigate to="/volunteer-dashboard" replace />;

    case UserRole.CITIZEN:
      console.log("➡️ Redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;

    default:
      console.log("⚠️ Unknown role, redirecting to /admin");
      return <Navigate to="/admin" replace />;
  }
};

export default RoleDashboardRouter;
