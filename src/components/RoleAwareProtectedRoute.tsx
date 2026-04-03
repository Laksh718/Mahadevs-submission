import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  UserRole,
  RoleBasedAuthService,
  hasRoleAccess,
} from "@/lib/roleBasedAuth";

interface RoleAwareProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole | UserRole[];
  requiredPermissions?: {
    resource: string;
    action: "create" | "read" | "update" | "delete";
    scope?: "own" | "district" | "state" | "national";
  }[];
  fallbackPath?: string;
}

const RoleAwareProtectedRoute: React.FC<RoleAwareProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallbackPath,
}) => {
  const {
    user: firebaseUser,
    userProfile: firebaseUserProfile,
    loading: firebaseLoading,
  } = useRoleAwareAuth();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const location = useLocation();

  // Show loading state
  if (firebaseLoading || supabaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  console.log("🔒 RoleAwareProtectedRoute: Auth status", {
    firebaseUser: !!firebaseUser,
    supabaseUser: !!supabaseUser,
    userProfile: !!firebaseUserProfile,
    location: location.pathname,
  });

  // Determine authentication method
  const isAuthenticated = firebaseUser || supabaseUser;
  const userProfile = firebaseUserProfile;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log(
      "🔒 RoleAwareProtectedRoute: No user found, redirecting to auth"
    );
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For Supabase users without Firebase profile (NGO/VOLUNTEER/DMA),
  // allow access but check if they're accessing volunteer routes
  if (supabaseUser && !firebaseUser && !userProfile) {
    console.log(
      "🔒 RoleAwareProtectedRoute: Supabase user without Firebase profile"
    );

    // If this is a volunteer route and we have a Supabase user, allow access
    if (
      requiredRoles === UserRole.VOLUNTEER ||
      (Array.isArray(requiredRoles) &&
        requiredRoles.includes(UserRole.VOLUNTEER))
    ) {
      console.log(
        "✅ RoleAwareProtectedRoute: Allowing Supabase volunteer access"
      );
      return <>{children}</>;
    }

    // For other organization routes, also allow access
    console.log(
      "✅ RoleAwareProtectedRoute: Allowing Supabase organization access"
    );
    return <>{children}</>;
  }

  // Check role access if required
  if (requiredRoles && firebaseUserProfile) {
    console.log("🔒 RoleAwareProtectedRoute: Checking role access", {
      userRole: firebaseUserProfile.role,
      userRoleType: typeof firebaseUserProfile.role,
      requiredRoles,
      requiredRolesType: typeof requiredRoles,
      hasAccess: hasRoleAccess(firebaseUserProfile, requiredRoles),
    });

    if (!hasRoleAccess(firebaseUserProfile, requiredRoles)) {
      console.log("❌ RoleAwareProtectedRoute: Access denied, redirecting");
      const dashboardRoute = RoleBasedAuthService.getDashboardRoute(
        firebaseUserProfile.role
      );
      return <Navigate to={fallbackPath || dashboardRoute} replace />;
    } else {
      console.log("✅ RoleAwareProtectedRoute: Access granted");
    }
  }

  // Check specific permissions if required
  if (requiredPermissions && firebaseUserProfile) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      RoleBasedAuthService.hasPermission(
        firebaseUserProfile,
        permission.resource,
        permission.action,
        permission.scope
      )
    );

    if (!hasAllPermissions) {
      const dashboardRoute = RoleBasedAuthService.getDashboardRoute(
        firebaseUserProfile.role
      );
      return <Navigate to={fallbackPath || dashboardRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleAwareProtectedRoute;
