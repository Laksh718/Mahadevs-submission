import React from "react";
import { supabase } from "./supabase";

export enum UserRole {
  CITIZEN = "CITIZEN",
  VOLUNTEER = "VOLUNTEER",
  NGO = "NGO",
  DMA = "DMA",
  ADMIN = "ADMIN",
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  organization?: string;
  district?: string;
  state?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: "create" | "read" | "update" | "delete";
  scope: "own" | "district" | "state" | "national";
}

export class RoleBasedAuthService {
  // Role hierarchy and permissions mapping
  private static rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.CITIZEN]: [
      {
        id: "1",
        name: "view_alerts",
        resource: "alerts",
        action: "read",
        scope: "own",
      },
      {
        id: "2",
        name: "submit_feedback",
        resource: "feedback",
        action: "create",
        scope: "own",
      },
      {
        id: "3",
        name: "view_training_schedule",
        resource: "training",
        action: "read",
        scope: "district",
      },
      {
        id: "4",
        name: "register_for_training",
        resource: "training_registration",
        action: "create",
        scope: "own",
      },
    ],

    [UserRole.VOLUNTEER]: [
      {
        id: "5",
        name: "view_volunteer_dashboard",
        resource: "volunteer_dashboard",
        action: "read",
        scope: "district",
      },
      {
        id: "6",
        name: "update_training_attendance",
        resource: "training_attendance",
        action: "update",
        scope: "district",
      },
      {
        id: "7",
        name: "create_rescue_reports",
        resource: "rescue_reports",
        action: "create",
        scope: "district",
      },
      {
        id: "8",
        name: "view_emergency_contacts",
        resource: "emergency_contacts",
        action: "read",
        scope: "district",
      },
    ],

    [UserRole.NGO]: [
      {
        id: "9",
        name: "manage_ngo_training",
        resource: "training_programs",
        action: "create",
        scope: "district",
      },
      {
        id: "10",
        name: "view_ngo_analytics",
        resource: "ngo_analytics",
        action: "read",
        scope: "district",
      },
      {
        id: "11",
        name: "manage_volunteers",
        resource: "volunteers",
        action: "update",
        scope: "district",
      },
      {
        id: "12",
        name: "export_ngo_reports",
        resource: "reports",
        action: "read",
        scope: "district",
      },
    ],

    [UserRole.DMA]: [
      {
        id: "13",
        name: "manage_district_operations",
        resource: "district_operations",
        action: "update",
        scope: "district",
      },
      {
        id: "14",
        name: "coordinate_rescue_teams",
        resource: "rescue_coordination",
        action: "update",
        scope: "district",
      },
      {
        id: "15",
        name: "view_district_analytics",
        resource: "district_analytics",
        action: "read",
        scope: "district",
      },
      {
        id: "16",
        name: "manage_shelters",
        resource: "shelters",
        action: "update",
        scope: "district",
      },
      {
        id: "17",
        name: "manage_state_operations",
        resource: "state_operations",
        action: "update",
        scope: "state",
      },
      {
        id: "18",
        name: "coordinate_district_teams",
        resource: "district_coordination",
        action: "update",
        scope: "state",
      },
      {
        id: "19",
        name: "view_state_analytics",
        resource: "state_analytics",
        action: "read",
        scope: "state",
      },
      {
        id: "20",
        name: "manage_state_resources",
        resource: "state_resources",
        action: "update",
        scope: "state",
      },
    ],

    [UserRole.ADMIN]: [
      {
        id: "21",
        name: "manage_all_operations",
        resource: "all_operations",
        action: "update",
        scope: "national",
      },
      {
        id: "22",
        name: "view_national_analytics",
        resource: "national_analytics",
        action: "read",
        scope: "national",
      },
      {
        id: "23",
        name: "manage_system_config",
        resource: "system_config",
        action: "update",
        scope: "national",
      },
      {
        id: "24",
        name: "manage_users",
        resource: "users",
        action: "update",
        scope: "national",
      },
    ],
  };

  /**
   * Get user profile with role and permissions
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log("👤 Fetching profile for Firebase UID:", userId);

      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          firebase_uid,
          email,
          role,
          name,
          organization,
          district,
          state,
          is_active,
          created_at,
          last_login
        `
        )
        .eq("firebase_uid", userId)
        .single();

      console.log("Profile query result:", { data, error });

      if (error) {
        console.error("Profile fetch error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      if (!data) {
        console.log("No profile data found for user:", userId);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        name: data.name,
        organization: data.organization,
        district: data.district,
        state: data.state,
        isActive: data.is_active,
        permissions: this.rolePermissions[data.role as UserRole] || [],
        createdAt: new Date(data.created_at),
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        console.error("Profile fetch failed with error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        // If it's a 406 error or RLS issue, log specific guidance
        if (
          error.message.includes("406") ||
          error.message.includes("RLS") ||
          error.message.includes("not acceptable")
        ) {
          console.error(`
🚨 RLS (Row Level Security) Error Detected!
This is likely due to restrictive database policies on the user_profiles table.

Quick Fix Options:
1. Run the SQL from simple_no_rls_fix.sql in Supabase SQL Editor
2. Or disable RLS: ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
3. Or grant access: GRANT ALL ON user_profiles TO authenticated;

Current Error: ${error.message}
          `);
        }
      }

      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(
    userProfile: UserProfile,
    resource: string,
    action: "create" | "read" | "update" | "delete",
    scope?: "own" | "district" | "state" | "national"
  ): boolean {
    return userProfile.permissions.some(
      (permission) =>
        permission.resource === resource &&
        permission.action === action &&
        (!scope || this.canAccessScope(permission.scope, scope))
    );
  }

  /**
   * Check scope access hierarchy
   */
  private static canAccessScope(
    userScope: "own" | "district" | "state" | "national",
    requiredScope: "own" | "district" | "state" | "national"
  ): boolean {
    const scopeHierarchy = ["own", "district", "state", "national"];
    const userLevel = scopeHierarchy.indexOf(userScope);
    const requiredLevel = scopeHierarchy.indexOf(requiredScope);
    return userLevel >= requiredLevel;
  }

  /**
   * Get permissions for a specific role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Get dashboard route based on user role
   */
  static getDashboardRoute(role: UserRole): string {
    const dashboardRoutes = {
      [UserRole.CITIZEN]: "/dashboard",
      [UserRole.VOLUNTEER]: "/volunteer-dashboard",
      [UserRole.NGO]: "/ngo-dashboard",
      [UserRole.DMA]: "/dma-dashboard",
      [UserRole.ADMIN]: "/admin",
    };
    return dashboardRoutes[role];
  }

  /**
   * Get filtered navigation menu based on role
   */
  static getNavigation(role: UserRole) {
    const baseNavigation = {
      [UserRole.CITIZEN]: [
        { name: "Dashboard", href: "/dashboard", icon: "Home" },
        { name: "Flood Alerts", href: "/alerts", icon: "AlertTriangle" },
        {
          name: "Training Schedule",
          href: "/training-schedule",
          icon: "Calendar",
        },
        { name: "Emergency Contacts", href: "/contacts", icon: "Phone" },
        { name: "Community", href: "/community", icon: "Users" },
      ],

      [UserRole.VOLUNTEER]: [
        {
          name: "Volunteer Dashboard",
          href: "/volunteer-dashboard",
          icon: "Heart",
        },
        {
          name: "Training Management",
          href: "/volunteer-training",
          icon: "BookOpen",
        },
        { name: "Rescue Operations", href: "/rescue-ops", icon: "Shield" },
        {
          name: "Team Coordination",
          href: "/team-coordination",
          icon: "Users",
        },
        { name: "Reports", href: "/volunteer-reports", icon: "FileText" },
      ],

      [UserRole.NGO]: [
        { name: "NGO Dashboard", href: "/ngo-dashboard", icon: "Building2" },
        {
          name: "Training Programs",
          href: "/ngo-training",
          icon: "GraduationCap",
        },
        {
          name: "Volunteer Management",
          href: "/ngo-volunteers",
          icon: "UserCheck",
        },
        { name: "Impact Analytics", href: "/ngo-analytics", icon: "BarChart3" },
        { name: "Reports", href: "/ngo-reports", icon: "FileText" },
      ],

      [UserRole.DMA]: [
        {
          name: "Disaster Management",
          href: "/dma-dashboard",
          icon: "MapPin",
        },
        {
          name: "Emergency Operations",
          href: "/dma/alerts",
          icon: "AlertTriangle",
        },
        {
          name: "Resource Coordination",
          href: "/dma/resources",
          icon: "Package",
        },
        { name: "Training Programs", href: "/dma/training", icon: "BookOpen" },
        {
          name: "Risk Assessment",
          href: "/dma/risk-assessment",
          icon: "Shield",
        },
        {
          name: "Analytics & Reports",
          href: "/dma/analytics",
          icon: "TrendingUp",
        },
        { name: "GIS Mapping", href: "/dma/gis-mapping", icon: "MapPin" },
        { name: "Shelter Management", href: "/dma/shelters", icon: "Home" },
      ],

      [UserRole.ADMIN]: [
        { name: "National Dashboard", href: "/admin", icon: "Command" },
        {
          name: "Training System",
          href: "/admin-training",
          icon: "GraduationCap",
        },
        { name: "Analytics", href: "/admin-analytics", icon: "LineChart" },
        { name: "Risk Assessment", href: "/admin-risk", icon: "AlertOctagon" },
        { name: "User Management", href: "/admin-users", icon: "Settings" },
      ],
    };

    return baseNavigation[role] || [];
  }

  /**
   * Create new user profile
   */
  static async createUserProfile(
    profileData: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          id: profileData.id,
          email: profileData.email,
          role: profileData.role,
          name: profileData.name,
          organization: profileData.organization,
          district: profileData.district,
          state: profileData.state,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !data) return null;

      return {
        ...data,
        permissions: this.rolePermissions[data.role as UserRole] || [],
        createdAt: new Date(data.created_at),
        isActive: data.is_active,
      };
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
  }

  /**
   * Update user last login
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from("user_profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userId);
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  /**
   * Get role-specific data filters
   */
  static getDataFilters(userProfile: UserProfile) {
    switch (userProfile.role) {
      case UserRole.CITIZEN:
      case UserRole.VOLUNTEER:
        return { district: userProfile.district };

      case UserRole.NGO:
      case UserRole.DMA:
        return {
          district: userProfile.district,
          state: userProfile.state,
        };

      case UserRole.ADMIN:
        return {}; // No filters - can access all data

      default:
        return { district: userProfile.district };
    }
  }

  /**
   * Check if user can access specific geographic area
   */
  static canAccessArea(
    userProfile: UserProfile,
    district?: string,
    state?: string
  ): boolean {
    switch (userProfile.role) {
      case UserRole.CITIZEN:
      case UserRole.VOLUNTEER:
      case UserRole.NGO:
        return !district || userProfile.district === district;

      case UserRole.DMA:
        // DMA users can access both district and state level operations
        return (
          (!district || userProfile.district === district) &&
          (!state || userProfile.state === state)
        );

      case UserRole.ADMIN:
        return true;

      default:
        return false;
    }
  }
}

/**
 * Check if user has required role access
 */
export function hasRoleAccess(
  userProfile: UserProfile | null,
  requiredRole: UserRole | UserRole[]
): boolean {
  if (!userProfile) {
    console.log("🔒 hasRoleAccess: No user profile");
    return false;
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  const hasAccess = allowedRoles.includes(userProfile.role);

  console.log("🔒 hasRoleAccess: Role check", {
    userRole: userProfile.role,
    userRoleType: typeof userProfile.role,
    allowedRoles,
    allowedRolesTypes: allowedRoles.map((r) => typeof r),
    hasAccess,
    stringComparison: allowedRoles.map(
      (r) => `${userProfile.role} === ${r} = ${userProfile.role === r}`
    ),
  });

  return hasAccess;
}
