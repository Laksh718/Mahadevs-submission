import { Navigate, useLocation } from "react-router-dom";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import LoadingScreen from "@/components/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, userProfile } = useRoleAwareAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    hasUser: !!user,
    hasProfile: !!userProfile,
    loading,
    userEmail: user?.email,
  });

  // Show loading while auth is being determined
  if (loading) {
    return <LoadingScreen message="Loading JanRakshak..." />;
  }

  // If no authenticated user, redirect to auth
  if (!user) {
    console.log("🔐 No authenticated user, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated but profile might be loading
  // Don't redirect - let the app handle profile creation/fallback
  if (!userProfile) {
    console.log("⚠️ Authenticated user has no profile yet, showing loading...");
    return <LoadingScreen message="Setting up user profile..." />;
  }

  console.log("✅ Access granted for:", user.email, "Role:", userProfile.role);
  return <>{children}</>;
};

export default ProtectedRoute;
