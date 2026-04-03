import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  UserProfile,
  UserRole,
  RoleBasedAuthService,
} from "@/lib/roleBasedAuth";
import { isAdmin, getFirebase } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { syncFirebaseUserToSupabase } from "@/lib/userSync";

interface RoleAwareAuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    profileData: {
      name: string;
      role: UserRole;
      organization?: string;
      district?: string;
      state?: string;
      phone?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const RoleAwareAuthContext = createContext<RoleAwareAuthContextType | null>(
  null
);

export const useRoleAwareAuth = () => {
  const context = useContext(RoleAwareAuthContext);
  if (!context) {
    throw new Error(
      "useRoleAwareAuth must be used within RoleAwareAuthProvider"
    );
  }
  return context;
};

interface RoleAwareAuthProviderProps {
  children: React.ReactNode;
}

export const RoleAwareAuthProvider: React.FC<RoleAwareAuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await RoleBasedAuthService.getUserProfile(userId);
      console.log("✅ Profile loaded:", {
        role: profile?.role,
        email: profile?.email,
      });

      // If no profile found but user is authenticated, create fallback profile
      if (!profile && user?.email) {
        if (isAdmin(user.email)) {
          console.log(
            "🔑 Admin user detected, creating temporary admin profile"
          );

          // Create temporary admin profile for routing
          const adminProfile: UserProfile = {
            id: userId,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            role: UserRole.ADMIN,
            district: "National",
            state: "All States",
            organization: "JanRakshak Administration",
            isActive: true,
            permissions: RoleBasedAuthService.getRolePermissions(
              UserRole.ADMIN
            ),
            createdAt: new Date(),
            lastLogin: new Date(),
          };

          console.log("🚀 Using temporary admin profile for:", user.email);
          setUserProfile(adminProfile);
          return;
        } else {
          // Create fallback citizen profile for regular users when RLS blocks access
          console.log(
            "🔧 No profile found due to RLS/406 error, creating fallback citizen profile"
          );

          const fallbackProfile: UserProfile = {
            id: userId,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            role: UserRole.CITIZEN,
            district: "Unknown",
            state: "Unknown",
            organization: undefined,
            isActive: true,
            permissions: RoleBasedAuthService.getRolePermissions(
              UserRole.CITIZEN
            ),
            createdAt: new Date(),
            lastLogin: new Date(),
          };

          console.log("⚡ Using temporary citizen profile for:", user.email);
          setUserProfile(fallbackProfile);
          return;
        }
      }

      setUserProfile(profile);

      // Update last login
      if (profile) {
        await RoleBasedAuthService.updateLastLogin(userId);
      }
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);

      // If error and user is admin, create temporary profile
      if (user?.email) {
        if (isAdmin(user.email)) {
          console.log(
            "🔑 Admin user detected (error case), creating temporary admin profile"
          );

          const adminProfile: UserProfile = {
            id: userId,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            role: UserRole.ADMIN,
            district: "National",
            state: "All States",
            organization: "JanRakshak Administration",
            isActive: true,
            permissions: RoleBasedAuthService.getRolePermissions(
              UserRole.ADMIN
            ),
            createdAt: new Date(),
            lastLogin: new Date(),
          };

          setUserProfile(adminProfile);
          return;
        }
      }

      setUserProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log("🚀 RoleAwareAuthContext initializing...");

    const { auth } = getFirebase();
    let mounted = true;

    // Listen to Firebase auth changes (this is the primary auth system)
    const unsubscribeFirebase = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!mounted) return;

        console.log("🔄 Firebase auth state change:", {
          hasUser: !!firebaseUser,
          userEmail: firebaseUser?.email,
          uid: firebaseUser?.uid,
        });

        if (firebaseUser) {
          console.log("👤 Firebase user authenticated, syncing to Supabase...");
          setLoading(true);

          // Convert Firebase user to Supabase user format for compatibility
          const supabaseUser: User = {
            id: firebaseUser.uid,
            aud: "authenticated",
            role: "authenticated",
            email: firebaseUser.email,
            email_confirmed_at: firebaseUser.emailVerified
              ? new Date().toISOString()
              : null,
            phone: firebaseUser.phoneNumber,
            confirmed_at: firebaseUser.emailVerified
              ? new Date().toISOString()
              : null,
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {
              full_name: firebaseUser.displayName,
              avatar_url: firebaseUser.photoURL,
            },
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Set user immediately so ProtectedRoute works
          setUser(supabaseUser);

          try {
            // Ensure user is synced to Supabase
            const syncResult = await syncFirebaseUserToSupabase(firebaseUser);

            if (syncResult) {
              console.log("✅ Sync successful, fetching profile...");
              // Now fetch the profile using Firebase UID
              await fetchUserProfile(firebaseUser.uid);
            } else {
              console.warn("⚠️ Sync failed, creating fallback profile...");
              // Create fallback profile if sync fails
              const fallbackProfile: UserProfile = {
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                name:
                  firebaseUser.displayName ||
                  firebaseUser.email?.split("@")[0] ||
                  "User",
                role: UserRole.CITIZEN,
                district: "Unknown",
                state: "Unknown",
                organization: undefined,
                isActive: true,
                permissions: RoleBasedAuthService.getRolePermissions(
                  UserRole.CITIZEN
                ),
                createdAt: new Date(),
                lastLogin: new Date(),
              };
              setUserProfile(fallbackProfile);
            }
          } catch (error) {
            console.error("❌ Error during Firebase→Supabase sync:", error);

            // Create fallback profile on error
            const fallbackProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              role: isAdmin(firebaseUser.email || "")
                ? UserRole.ADMIN
                : UserRole.CITIZEN,
              district: "Unknown",
              state: "Unknown",
              organization: undefined,
              isActive: true,
              permissions: RoleBasedAuthService.getRolePermissions(
                isAdmin(firebaseUser.email || "")
                  ? UserRole.ADMIN
                  : UserRole.CITIZEN
              ),
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            setUserProfile(fallbackProfile);
          }

          setLoading(false);
        } else {
          console.log("👋 Firebase user logged out, clearing profile");
          setUser(null);
          setSession(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribeFirebase();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: {
      name: string;
      role: UserRole;
      organization?: string;
      district?: string;
      state?: string;
      phone?: string;
    }
  ) => {
    try {
      setLoading(true);

      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Failed to create user account" };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: profileData.name,
          role: profileData.role,
          organization: profileData.organization || null,
          district: profileData.district || null,
          state: profileData.state || null,
          phone: profileData.phone || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        return { success: false, error: "Failed to create user profile" };
      }

      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting sign out process...");

      // Sign out from Firebase (primary auth)
      console.log("🔄 Signing out from Firebase...");
      const { auth } = getFirebase();
      await firebaseSignOut(auth);
      console.log("✅ Firebase signout completed");

      // Sign out from Supabase (secondary auth/data layer)
      console.log("🔄 Signing out from Supabase...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Supabase sign out error:", error);
      } else {
        console.log("✅ Supabase signout completed");
      }

      // Clear local state
      console.log("🔄 Clearing local state...");
      setUser(null);
      setSession(null);
      setUserProfile(null);

      console.log("✅ Successfully signed out from both Firebase and Supabase");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const value: RoleAwareAuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <RoleAwareAuthContext.Provider value={value}>
      {children}
    </RoleAwareAuthContext.Provider>
  );
};
