import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebase, googleProvider } from "@/lib/firebase";
import {
  syncFirebaseUserToSupabase,
  updateUserLastLogin,
} from "@/lib/userSync";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "user" | "admin" | "emergency_responder";
  location?: {
    state: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  preferences: {
    alertTypes: string[];
    notificationMethods: string[];
    emergencyContacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
  joinedAt: Date;
  lastLogin: Date;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth, db } = getFirebase();

  const createUserProfile = async (user: User, additionalData: any = {}) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { displayName, email, photoURL } = user;
      const profile: UserProfile = {
        uid: user.uid,
        email: email!,
        displayName: displayName || "",
        photoURL: photoURL || undefined,
        role: "CITIZEN", // Firebase users are CITIZEN role (regular public)
        preferences: {
          alertTypes: ["flood_warning", "evacuation_alert", "weather_update"],
          notificationMethods: ["push", "email"],
          emergencyContacts: [],
        },
        joinedAt: new Date(),
        lastLogin: new Date(),
        ...additionalData,
      };
      try {
        await setDoc(userRef, profile);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error creating user profile:", error);
        toast.error("Failed to create user profile");
      }
    } else {
      // Update last login
      const existingProfile = snapshot.data() as UserProfile;
      const updatedProfile = {
        ...existingProfile,
        lastLogin: new Date(),
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);

      // Sync user to Supabase
      try {
        await syncFirebaseUserToSupabase(result.user);
        await updateUserLastLogin(result.user.uid);
      } catch (syncError) {
        console.error("Error syncing user to Supabase:", syncError);
        // Don't fail login if sync fails
      }

      toast.success("Welcome back!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role?: string
  ) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(result.user, { displayName });
      await createUserProfile(result.user, { displayName });

      // Sync user to Supabase with chosen role
      try {
        await syncFirebaseUserToSupabase(result.user, role);
      } catch (syncError) {
        console.error("Error syncing user to Supabase:", syncError);
        // Don't fail registration if sync fails
      }

      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);

      // Sync user to Supabase
      try {
        await syncFirebaseUserToSupabase(result.user);
        await updateUserLastLogin(result.user.uid);
      } catch (syncError) {
        console.error("Error syncing user to Supabase:", syncError);
        // Don't fail login if sync fails
      }

      toast.success("Successfully signed in with Google!");
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || "Failed to sign in with Google");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const updatedProfile = { ...userProfile, ...data };
      await setDoc(userRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "Auth state changed:",
        user ? "User logged in" : "User logged out"
      );
      setCurrentUser(user);
      if (user) {
        try {
          await createUserProfile(user);
        } catch (error) {
          console.error("Error creating user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, db]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
