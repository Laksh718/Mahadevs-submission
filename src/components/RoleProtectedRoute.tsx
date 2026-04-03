import React from "react";
import { UserRole, UserProfile, hasRoleAccess } from "../lib/roleBasedAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
  userProfile: UserProfile | null;
  fallback?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRole,
  userProfile,
  fallback,
}) => {
  if (!hasRoleAccess(userProfile, requiredRole)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access this resource.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

interface PermissionWrapperProps {
  children: React.ReactNode;
  userProfile: UserProfile | null;
  resource: string;
  action: "create" | "read" | "update" | "delete";
  scope?: "own" | "district" | "state" | "national";
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  userProfile,
  resource,
  action,
  scope,
  fallback,
}) => {
  if (!userProfile) return null;

  const hasPermission = userProfile.permissions.some(
    (permission) =>
      permission.resource === resource &&
      permission.action === action &&
      (!scope || canAccessScope(permission.scope, scope))
  );

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
};

// Helper function for scope checking
function canAccessScope(
  userScope: "own" | "district" | "state" | "national",
  requiredScope: "own" | "district" | "state" | "national"
): boolean {
  const scopeHierarchy = ["own", "district", "state", "national"];
  const userLevel = scopeHierarchy.indexOf(userScope);
  const requiredLevel = scopeHierarchy.indexOf(requiredScope);
  return userLevel >= requiredLevel;
}
