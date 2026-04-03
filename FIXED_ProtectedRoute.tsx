// FIXED PROTECTED ROUTE - Separates Auth from Roles
// This fixes the infinite redirect by properly handling auth vs role states

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/supabase"; // Pure auth check
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext"; // Role management
import LoadingScreen from "@/components/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional role requirement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user: authUser, loading: authLoading } = useAuth(); // Firebase auth state
  const { userProfile, loading: profileLoading } = useRoleAwareAuth(); // Role state
  const location = useLocation();

  // Step 1: Check authentication first (Firebase)
  if (authLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!authUser) {
    console.log("🔐 No authenticated user, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Step 2: User is authenticated, now check role (if required)
  if (requiredRole) {
    if (profileLoading) {
      return <LoadingScreen message="Loading user profile..." />;
    }

    if (!userProfile) {
      console.log("⚠️ Authenticated user has no profile, creating fallback");
      // Don't redirect - let RoleAwareAuthContext handle fallback profile creation
      return <LoadingScreen message="Setting up user profile..." />;
    }

    if (userProfile.role !== requiredRole) {
      console.log(
        `❌ Access denied: required ${requiredRole}, user has ${userProfile.role}`
      );
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Step 3: All checks passed
  console.log("✅ Access granted:", {
    authUser: authUser.email,
    role: userProfile?.role,
    requiredRole,
  });

  return <>{children}</>;
};

export default ProtectedRoute;
