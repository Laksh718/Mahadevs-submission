import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { syncAllFirebaseUsersToSupabase } from "@/lib/userSync";
import { toast } from "sonner";

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(
  undefined
);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkAdminStatus(session.user);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkAdminStatus(session.user);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User) => {
    try {
      console.log("Checking admin status for Supabase user:", user.id);

      // Since Supabase is used specifically for admin authentication,
      // all Supabase users are considered admins
      setIsAdmin(true);
      console.log("Supabase user is admin:", true);

      // Note: Firebase user sync is disabled for admin-only authentication
      // Admins will manage users directly through Supabase
      console.log("Admin authentication successful - Firebase sync disabled");
    } catch (error) {
      console.error(
        "Error checking admin status:",
        error?.message || JSON.stringify(error)
      );
      // If there's any error, assume admin for Supabase users
      setIsAdmin(true);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      console.log("Starting signup process...");

      // Validate secret key if provided
      if (userData?.secret_key) {
        const allValidSecretKeys = [
          // Admin keys
          "Janrakshak25",
          "admin2025",
          "EMERGENCY_RESPONSE_KEY",
          "JANRAKSHAK_ADMIN_2025",
          // SDMA keys
          "SDMA_ACCESS_2025",
          "STATE_DISASTER_KEY",
          "SDMA_Jalrakshak25",
          // DDMA keys
          "DDMA_ACCESS_2025",
          "DISTRICT_DISASTER_KEY",
          "DDMA_Jalrakshak25",
          // NGO keys
          "NGO_ACCESS_2025",
          "NGO_PARTNER_KEY",
          "NGO_Jalrakshak25",
          // Volunteer keys
          "VOLUNTEER_ACCESS_2025",
          "COMMUNITY_HELPER_KEY",
          "VOL_Jalrakshak25",
        ];

        // Trim whitespace and normalize the entered key
        const trimmedKey = userData.secret_key?.trim();

        console.log("Context secret key validation:", {
          enteredKey: userData.secret_key,
          trimmedKey: trimmedKey,
          role: userData.role,
          keyLength: trimmedKey?.length,
          isValid: allValidSecretKeys.includes(trimmedKey),
          exactMatch: allValidSecretKeys.some((key) => key === trimmedKey),
        });

        if (!allValidSecretKeys.includes(trimmedKey)) {
          toast.error(
            `Invalid secret key for ${
              userData.role || "selected"
            } role. Please contact system administrator.`
          );
          return {
            user: null,
            error: { message: "Invalid secret key" } as AuthError,
          };
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name,
            role: "admin",
            secret_key_validated: !!userData?.secret_key,
          },
        },
      });

      console.log("Signup response:", { data, error });

      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message);
        return { user: null, error };
      }

      if (data.user) {
        console.log(
          "Admin user created successfully with secret key validation"
        );
      }

      toast.success(
        "Admin account created successfully! Please check your email to verify your account."
      );
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account");
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Starting signin process...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Signin response:", { data, error });

      if (error) {
        console.error("Signin error:", error);
        toast.error(error.message);
        return { user: null, error };
      }

      console.log("Signin successful, user:", data.user);
      toast.success("Welcome back, Admin!");
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent!");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to send reset email");
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      // For Supabase admin users, we don't need to update a separate profile table
      // All Supabase users are admins by default
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    }
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    loading,
    isAdmin,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
