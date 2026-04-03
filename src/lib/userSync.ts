import { supabase } from "./supabase";
import { getFirebase } from "./firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: "user" | "admin" | "emergency_responder";
  disabled: boolean;
  joined_at: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sync a single Firebase user to Supabase
 */
export const syncFirebaseUserToSupabase = async (
  firebaseUser: FirebaseUser,
  chosenRole?: string
): Promise<UserProfile | null> => {
  try {
    console.log("Syncing Firebase user to Supabase:", firebaseUser.uid);

    // Determine role based on chosen role or defaults
    let userRole = "CITIZEN"; // Default
    if (
      chosenRole &&
      ["CITIZEN", "VOLUNTEER", "NGO", "DMA"].includes(chosenRole)
    ) {
      userRole = chosenRole;
    } else if (firebaseUser.email === "lb4397@srmist.edu.in") {
      userRole = "ADMIN";
    }

    // First, try to get existing user
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("firebase_uid", firebaseUser.uid)
      .single();

    let userData;

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          email: firebaseUser.email || "",
          display_name: firebaseUser.displayName || null,
          name: firebaseUser.displayName || null,
          photo_url: firebaseUser.photoURL || null,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("firebase_uid", firebaseUser.uid)
        .select()
        .single();

      if (error) {
        console.error("Error updating user in Supabase:", error);
        return null;
      }
      userData = data;
    } else {
      // Insert new user
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          display_name: firebaseUser.displayName || null,
          name: firebaseUser.displayName || null,
          photo_url: firebaseUser.photoURL || null,
          role: userRole,
          is_active: true,
          status: "active",
          volunteer_status: userRole === "VOLUNTEER" ? "active" : "inactive",
          availability: "24/7",
          rating: 0.0,
          region: "Unknown",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting user to Supabase:", error);
        return null;
      }
      userData = data;
    }

    console.log("User synced successfully:", userData);

    // Convert to expected UserProfile format
    const userProfile: UserProfile = {
      id: userData.id,
      firebase_uid: userData.firebase_uid,
      email: userData.email,
      display_name: userData.display_name,
      photo_url: userData.photo_url,
      role: userData.role as "user" | "admin" | "emergency_responder",
      disabled: userData.disabled || false,
      joined_at: userData.joined_at,
      last_login: userData.last_login,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    return userProfile;
  } catch (error) {
    console.error("Error in syncFirebaseUserToSupabase:", error);
    return null;
  }
};

/**
 * Sync all Firebase users to Supabase (Admin only - requires Firebase auth)
 */
export const syncAllFirebaseUsersToSupabase = async (): Promise<
  UserProfile[]
> => {
  try {
    console.log("Starting sync of all Firebase users to Supabase...");

    // Check if we have Firebase auth
    const { auth } = getFirebase();
    if (!auth.currentUser) {
      console.log("No Firebase user authenticated - skipping sync");
      return [];
    }

    const { db } = getFirebase();
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(
      query(usersRef, orderBy("createdAt", "desc"))
    );

    const syncedUsers: UserProfile[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const firebaseUser = {
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      } as FirebaseUser;

      const syncedUser = await syncFirebaseUserToSupabase(
        firebaseUser,
        userData.role || "user"
      );

      if (syncedUser) {
        syncedUsers.push(syncedUser);
      }
    }

    console.log(`Synced ${syncedUsers.length} users to Supabase`);
    return syncedUsers;
  } catch (error) {
    console.error("Error syncing all Firebase users:", error);
    return [];
  }
};

/**
 * Get all users from Supabase (for admin panel)
 */
export const getAllUsersFromSupabase = async (
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<UserProfile[]> => {
  try {
    console.log("Fetching users from Supabase...");

    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc("get_all_users_for_admin", {
        p_limit: limit,
        p_offset: offset,
        p_search: search || null,
      });

      if (error) {
        console.error("RPC function error:", error);
        throw error;
      }

      console.log("Users fetched via RPC:", data);
      return data || [];
    } catch (rpcError) {
      console.log("RPC function not available, trying direct query...");

      // Fallback to direct query
      let query = supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,display_name.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Direct query error:", error);
        return [];
      }

      console.log("Users fetched via direct query:", data);
      return data || [];
    }
  } catch (error) {
    console.error("Error in getAllUsersFromSupabase:", error);
    return [];
  }
};

/**
 * Update user role in Supabase
 */
export const updateUserRoleInSupabase = async (
  firebaseUid: string,
  role: "user" | "admin" | "emergency_responder"
): Promise<boolean> => {
  try {
    console.log("Updating user role:", firebaseUid, role);

    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc("update_user_role", {
        p_firebase_uid: firebaseUid,
        p_role: role,
      });

      if (error) {
        console.error("RPC function error:", error);
        throw error;
      }

      return data;
    } catch (rpcError) {
      console.log("RPC function not available, trying direct update...");

      // Fallback to direct update
      const { error } = await supabase
        .from("user_profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("firebase_uid", firebaseUid);

      if (error) {
        console.error("Direct update error:", error);
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error("Error in updateUserRoleInSupabase:", error);
    return false;
  }
};

/**
 * Toggle user status (enable/disable) in Supabase
 */
export const toggleUserStatusInSupabase = async (
  firebaseUid: string
): Promise<boolean> => {
  try {
    console.log("Toggling user status:", firebaseUid);

    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc("toggle_user_status", {
        p_firebase_uid: firebaseUid,
      });

      if (error) {
        console.error("RPC function error:", error);
        throw error;
      }

      return data;
    } catch (rpcError) {
      console.log("RPC function not available, trying direct update...");

      // Get current status first
      const { data: userData, error: fetchError } = await supabase
        .from("user_profiles")
        .select("disabled")
        .eq("firebase_uid", firebaseUid)
        .single();

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return false;
      }

      // Toggle the status
      const { error } = await supabase
        .from("user_profiles")
        .update({
          disabled: !userData.disabled,
          updated_at: new Date().toISOString(),
        })
        .eq("firebase_uid", firebaseUid);

      if (error) {
        console.error("Direct update error:", error);
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error("Error in toggleUserStatusInSupabase:", error);
    return false;
  }
};

/**
 * Delete user from Supabase
 */
export const deleteUserFromSupabase = async (
  firebaseUid: string
): Promise<boolean> => {
  try {
    console.log("Deleting user:", firebaseUid);

    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc("delete_user_profile", {
        p_firebase_uid: firebaseUid,
      });

      if (error) {
        console.error("RPC function error:", error);
        throw error;
      }

      return data;
    } catch (rpcError) {
      console.log("RPC function not available, trying direct delete...");

      // Fallback to direct delete
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("firebase_uid", firebaseUid);

      if (error) {
        console.error("Direct delete error:", error);
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error("Error in deleteUserFromSupabase:", error);
    return false;
  }
};

/**
 * Get user statistics from Supabase
 */
export const getUserStatisticsFromSupabase = async () => {
  try {
    console.log("Fetching user statistics...");

    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc("get_user_statistics");

      if (error) {
        console.error("RPC function error:", error);
        // If it's a permission error, skip to manual calculation
        if (error.code === "P0001" || error.message?.includes("Unauthorized")) {
          throw new Error("Permission denied");
        }
        throw error;
      }

      console.log("Statistics fetched via RPC:", data);
      return (
        data?.[0] || {
          total_users: 0,
          active_users: 0,
          disabled_users: 0,
          admin_users: 0,
          emergency_responders: 0,
          recent_signups: 0,
        }
      );
    } catch (rpcError) {
      console.log(
        "RPC function not available or permission denied, calculating manually..."
      );

      // Fallback to manual calculation
      const { data: users, error } = await supabase
        .from("user_profiles")
        .select("role, disabled, created_at");

      if (error) {
        console.error("Error fetching users for stats:", error);
        return {
          total_users: 0,
          active_users: 0,
          disabled_users: 0,
          admin_users: 0,
          emergency_responders: 0,
          recent_signups: 0,
        };
      }

      const stats = {
        total_users: users.length,
        active_users: users.filter((u) => !u.disabled).length,
        disabled_users: users.filter((u) => u.disabled).length,
        admin_users: users.filter((u) => u.role === "admin").length,
        emergency_responders: users.filter(
          (u) => u.role === "emergency_responder"
        ).length,
        recent_signups: users.filter((u) => {
          const created = new Date(u.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created >= weekAgo;
        }).length,
      };

      console.log("Statistics calculated manually:", stats);
      return stats;
    }
  } catch (error) {
    console.error("Error in getUserStatisticsFromSupabase:", error);
    return {
      total_users: 0,
      active_users: 0,
      disabled_users: 0,
      admin_users: 0,
      emergency_responders: 0,
      recent_signups: 0,
    };
  }
};

/**
 * Update user's last login time in Supabase
 */
export const updateUserLastLogin = async (
  firebaseUid: string
): Promise<boolean> => {
  try {
    console.log("Updating last login for:", firebaseUid);

    const { error } = await supabase
      .from("user_profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("firebase_uid", firebaseUid);

    if (error) {
      console.error("Error updating last login:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateUserLastLogin:", error);
    return false;
  }
};
