import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Chrome,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Crown,
  Sparkles,
  Zap,
  Users,
  Building2,
  Heart,
  MapPin,
  Copy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const SupabaseAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signIn, resetPassword, user, loading, isAdmin } =
    useSupabaseAuth();
  const { refreshProfile } = useRoleAwareAuth();

  // Determine active tab based on URL path
  const isSignupPage = location.pathname === "/admin/signup";
  const [activeTab, setActiveTab] = useState(
    isSignupPage ? "signup" : "signin"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    secretKey: "",
    role: "",
    organization: "",
    district: "",
    state: "",
    phone: "",
  });

  // Redirect if already authenticated with Supabase
  useEffect(() => {
    console.log(
      "SupabaseAuth useEffect - user:",
      user?.email,
      "loading:",
      loading,
      "pathname:",
      location.pathname
    );
    if (user && !loading) {
      // Check user role and redirect accordingly
      redirectBasedOnRole();
    }
  }, [user, loading, navigate, location.pathname]);

  const copyToClipboard = async (text: string, roleType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${roleType} key copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy key");
    }
  };

  const redirectBasedOnRole = async () => {
    console.log("DEBUG: redirectBasedOnRole function called");
    if (!user) {
      console.log("DEBUG: No user found, exiting redirectBasedOnRole");
      return;
    }
    console.log("DEBUG: User exists, proceeding with profile fetch");

    try {
      console.log("Fetching user profile for:", user.id, user.email);

      // First, check if user_profiles table exists and is accessible
      let profile = null;
      let error = null;

      try {
        const { data, error: fetchError } = await supabase
          .from("user_profiles")
          .select("role, name, email")
          .eq("id", user.id)
          .single();

        profile = data;
        error = fetchError;
      } catch (apiError) {
        console.error("API Error during profile fetch:", apiError);
        error = apiError;
      }

      console.log("Profile fetch result:", { profile, error });
      console.log("DEBUG: User ID being searched:", user.id);
      console.log("DEBUG: Profile data found:", profile);
      console.log("DEBUG: Profile role detected:", profile?.role);
      console.log("DEBUG: Profile name:", profile?.name);
      console.log("DEBUG: Error details:", error);

      if (error || !profile) {
        console.error("Error fetching user profile:", {
          error,
          userId: user.id,
          userEmail: user.email,
          errorCode: error?.code,
          errorMessage: error?.message,
          errorDetails: error?.details,
        });

        // Handle specific error cases
        if (
          error?.message?.includes("406") ||
          error?.message?.includes("Not Acceptable")
        ) {
          console.error("🚨 406 Error detected - likely RLS issue!");
          console.log(`
📋 Quick Fix Instructions:
1. Open Supabase SQL Editor
2. Run: ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
3. Run: GRANT ALL ON user_profiles TO authenticated;
4. Or use the console command: diagnoseRLS()
          `);

          if (isAdmin) {
            console.log(
              "✅ Admin user detected, redirecting to admin dashboard"
            );
            toast.success("Welcome Admin! (Database setup may need attention)");
            navigate("/admin");
            return;
          }

          toast.error(
            "Database configuration issue detected. Please contact administrator."
          );
          navigate("/dashboard");
          return;
        } else if (
          error?.code === "PGRST116" ||
          error?.message?.includes("No rows found")
        ) {
          console.log("No profile found for user:", user.email);
          console.log(
            "IMPORTANT: Not creating fallback profile to prevent duplicates"
          );

          // Check if this is an admin user first
          if (isAdmin) {
            console.log(
              "✅ Admin user detected, redirecting to admin dashboard"
            );
            toast.success(`Welcome Admin! Redirecting to Admin Dashboard.`);
            navigate("/admin");
            return;
          }

          // Just show error and redirect to default dashboard
          toast.error(
            "❌ No profile found! Please contact administrator. Redirecting to user dashboard."
          );
          navigate("/dashboard");
          return;
        } else if (error?.code === "42P01") {
          if (isAdmin) {
            console.log(
              "✅ Admin user detected, redirecting to admin dashboard"
            );
            toast.success("Welcome Admin! Redirecting to Admin Dashboard.");
            navigate("/admin");
            return;
          }
          toast.error(
            "❌ Database setup incomplete. Redirecting to user dashboard."
          );
          navigate("/dashboard");
          return;
        } else {
          if (isAdmin) {
            console.log(
              "✅ Admin user detected, redirecting to admin dashboard"
            );
            toast.success("Welcome Admin! Redirecting to Admin Dashboard.");
            navigate("/admin");
            return;
          }
          toast.error(
            `❌ Profile error: ${
              error?.message || "Database connection issue"
            }. Redirecting to user dashboard.`
          );
          navigate("/dashboard");
          return;
        }
      }

      const userName = profile.name || user.email?.split("@")[0] || "User";

      console.log("DEBUG: About to process role redirect");
      console.log("DEBUG: Raw profile role:", profile.role);
      console.log("DEBUG: User name extracted:", userName);

      // Normalize role for comparison (handle both uppercase and lowercase)
      const normalizedRole = profile.role.toUpperCase();
      console.log("DEBUG: Normalized role for redirect:", normalizedRole);

      // Show role detection and redirect info
      const roleMessages = {
        ADMIN: `Welcome ${userName}! Detected ADMIN role - Redirecting to Admin Dashboard`,
        DMA: `Welcome ${userName}! Detected DMA role - Redirecting to DMA Dashboard`,
        NGO: `Welcome ${userName}! Detected NGO role - Redirecting to NGO Dashboard`,
        VOLUNTEER: `Welcome ${userName}! Detected VOLUNTEER role - Redirecting to Volunteer Dashboard`,
        USER: `Welcome ${userName}! Detected USER role - Redirecting to User Dashboard`,
      };

      const message =
        roleMessages[normalizedRole] ||
        `Welcome ${userName}! Redirecting to user dashboard`;

      console.log("DEBUG: About to show toast message:", message);
      toast.success(message);
      console.log("DEBUG: Toast message sent");

      // Redirect based on normalized role
      console.log("DEBUG: Starting role-based redirect switch");
      switch (normalizedRole) {
        case "ADMIN":
          console.log("DEBUG: Redirecting to /admin");
          navigate("/admin");
          break;
        case "DMA":
          console.log("DEBUG: Redirecting to /dma-dashboard for DMA role");
          navigate("/dma-dashboard");
          break;
        case "NGO":
          console.log("DEBUG: Redirecting to /ngo-dashboard");
          navigate("/ngo-dashboard");
          break;
        case "VOLUNTEER":
          console.log(
            "DEBUG: Redirecting to /volunteer-dashboard for VOLUNTEER role"
          );
          navigate("/volunteer-dashboard");
          break;
        case "USER":
          console.log("DEBUG: Redirecting to /dashboard for USER role");
          navigate("/dashboard");
          break;
        default:
          console.log(
            "DEBUG: Unknown role detected:",
            normalizedRole,
            "- Redirecting to user dashboard"
          );
          toast.warning(
            "Unknown role detected. Redirecting to user dashboard."
          );
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error in redirectBasedOnRole:", error);
      toast.error("Error detecting role. Redirecting to user dashboard.");
      navigate("/dashboard");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return Shield;
      case "DMA":
        return MapPin;
      case "NGO":
        return Heart;
      case "VOLUNTEER":
        return Users;
      default:
        return Building2;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting sign-in for:", formData.email);
      const { user, error } = await signIn(formData.email, formData.password);
      console.log("Sign-in result - user:", user?.email, "error:", error);
      if (!error && user) {
        console.log("Sign-in successful, checking user role for redirect");
        // The redirect will be handled by the useEffect hook
        // which calls redirectBasedOnRole()
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.password ||
      !formData.fullName ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Validate secret key for all roles
    if (!formData.secretKey) {
      toast.error("Secret key is required for all roles");
      return;
    }

    // Define role-specific secret keys
    const roleSecretKeys: { [key: string]: string[] } = {
      ADMIN: [
        "Janrakshak25",
        "admin2025",
        "EMERGENCY_RESPONSE_KEY",
        "JANRAKSHAK_ADMIN_2025",
      ],
      DMA: ["DMA_ACCESS_2025", "DISASTER_MGMT_KEY", "DMA_Jalrakshak25"],
      NGO: ["NGO_ACCESS_2025", "NGO_PARTNER_KEY", "NGO_Jalrakshak25"],
      VOLUNTEER: [
        "VOLUNTEER_ACCESS_2025",
        "COMMUNITY_HELPER_KEY",
        "VOL_Jalrakshak25",
      ],
    };

    const validKeysForRole = roleSecretKeys[formData.role] || [];
    const trimmedKey = formData.secretKey?.trim();

    if (!validKeysForRole.includes(trimmedKey)) {
      toast.error(
        `Invalid secret key for ${formData.role} role. Please contact system administrator.`
      );
      return;
    }

    setIsLoading(true);
    try {
      // First create the auth user
      const { user, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        secret_key: formData.secretKey,
        role: formData.role,
      });

      if (!error && user) {
        // Create user profile with role information
        console.log("Creating user profile for:", {
          userId: user.id,
          email: user.email,
          role: formData.role,
          name: formData.fullName,
        });

        const profileData = {
          id: user.id, // Maps to auth.users(id) - REQUIRED for user mapping
          email: user.email,
          name: formData.fullName, // Use name as per actual schema
          role: formData.role.toUpperCase(), // Convert role to uppercase to match constraint
          organization: formData.organization || null,
          district: formData.district || null,
          state: formData.state || null,
          phone: formData.phone || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log(
          "Profile data to insert:",
          JSON.stringify(profileData, null, 2)
        );

        // Test database connection first
        const { data: testQuery, error: testError } = await supabase
          .from("user_profiles")
          .select("count")
          .limit(1);

        if (testError) {
          console.error("Database connection test failed:", testError);
          toast.error(`Database connection issue: ${testError.message}`);
          return;
        }

        console.log(
          "Database connection test passed, proceeding with insert..."
        );

        const { data: profileResult, error: profileError } = await supabase
          .from("user_profiles")
          .insert(profileData)
          .select();

        console.log("Profile insert result:", { profileResult, profileError });

        if (profileError) {
          console.error("Profile creation error details:", {
            error: profileError,
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            profileData,
            supabaseUrl:
              import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + "...",
            timestamp: new Date().toISOString(),
          });

          // Provide specific error guidance
          let errorMessage = `Profile creation failed: ${profileError.message}`;
          if (profileError.code === "42P01") {
            errorMessage +=
              " - Table does not exist. Please run the database setup script.";
          } else if (profileError.code === "23505") {
            errorMessage += " - User profile already exists.";
          } else if (profileError.code === "42703") {
            errorMessage +=
              " - Missing database columns. Please run the database migration.";
          }

          toast.error(errorMessage);
          toast.success(
            "✅ Authentication account created! Please verify your email. Profile can be created later."
          );
        } else {
          console.log("✅ Profile created successfully:", profileResult);
          toast.success(
            "✅ Account and profile created successfully! Redirecting to your dashboard..."
          );

          // Redirect to role-based dashboard after successful signup
          setTimeout(() => {
            redirectBasedOnRole();
          }, 1500);
        }

        // Verify profile was created (additional check)
        if (!profileError) {
          setTimeout(async () => {
            const { data: verifyProfile, error: verifyError } = await supabase
              .from("user_profiles")
              .select("id, email, role")
              .eq("id", user.id)
              .single();

            if (verifyProfile) {
              console.log("✅ Profile verification successful:", verifyProfile);
            } else {
              console.error("❌ Profile verification failed:", verifyError);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(formData.email);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Enterprise-grade security with Supabase Auth",
      color: "text-cyan-400 bg-blue-100",
    },
    {
      icon: CheckCircle,
      title: "Email Verification",
      description: "Secure account verification via email",
      color: "text-green-600 bg-green-100",
    },
    {
      icon: AlertTriangle,
      title: "Password Recovery",
      description: "Easy password reset functionality",
      color: "text-orange-600 bg-orange-100",
    },
  ];

  // Show loading screen during authentication
  if (loading || isLoading) {
    return <LoadingScreen message="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute bottom-32 left-40 w-96 h-96 bg-gradient-to-r from-teal-500/30 to-emerald-500/30 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-cyan-400/50"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.01,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Features */}
          <motion.div
            className="space-y-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center lg:text-left">
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-4 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    duration: 0.6,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg opacity-30"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center relative">
                    <img
                      src="/favicon.svg"
                      alt="JanRakshak Logo"
                      className="w-10 h-10"
                    />
                  </div>
                </motion.div>
                <div className="flex flex-col">
                  <motion.h1
                    className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    JanRakshak
                  </motion.h1>
                  <span className="text-sm text-cyan-400 font-semibold -mt-1">
                    Flood Protection System
                  </span>
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-4">
                Secure Access to Your Account
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Sign in to access your personalized flood monitoring dashboard,
                emergency alerts, and community features.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Role-Specific Secret Keys Display */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Demo Access Keys
                  </h3>
                </div>

                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <strong>For Demo Only:</strong> In real deployment, these
                    keys would not be visible and would be securely managed by
                    administrators.
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">ADMIN</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard("Janrakshak25", "ADMIN")}
                        className="h-6 px-2 text-red-600 hover:bg-red-50"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-xs font-mono text-red-700 bg-red-50 px-2 py-1 rounded block">
                      Janrakshak25
                    </code>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-blue-800">DMA</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard("DMA_ACCESS_2025", "DMA")
                        }
                        className="h-6 px-2 text-cyan-400 hover:bg-blue-50"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded block">
                      DMA_ACCESS_2025
                    </code>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">NGO</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard("NGO_ACCESS_2025", "NGO")
                        }
                        className="h-6 px-2 text-green-600 hover:bg-green-50"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1 rounded block">
                      NGO_ACCESS_2025
                    </code>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-800">
                          VOLUNTEER
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard("VOLUNTEER_ACCESS_2025", "VOLUNTEER")
                        }
                        className="h-6 px-2 text-purple-600 hover:bg-purple-50"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded block">
                      VOLUNTEER_ACCESS_2025
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="w-full max-w-md shadow-2xl border-0 bg-white/5 backdrop-blur-xl">
                <CardHeader className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-6 h-6 text-teal-600 animate-pulse" />
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      JalRakshak Access
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Sign in to your account or create a new account with your
                    role
                  </CardDescription>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-teal-700">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Role-based access for disaster management professionals
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* Sign In Tab */}
                    <TabsContent value="signin" className="space-y-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-10 pr-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              autoComplete="current-password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-gray-300"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-blue-50 border border-cyan-400/50 rounded-lg">
                          <p className="text-xs text-blue-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <strong>Auto Role Detection:</strong> Your dashboard
                            will be automatically selected based on your
                            registered role.
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>

                      <div className="text-center">
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("reset")}
                          className="text-sm text-cyan-400 hover:text-blue-700"
                        >
                          Forgot your password?
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Sign Up Tab */}
                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="fullName"
                              name="fullName"
                              type="text"
                              placeholder="Enter your full name"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="signup-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) =>
                              handleSelectChange(value, "role")
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-600" />
                                  ADMIN - Full System Access
                                </div>
                              </SelectItem>
                              <SelectItem value="DMA">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-cyan-400" />
                                  DMA - Disaster Management Authority
                                </div>
                              </SelectItem>
                              <SelectItem value="NGO">
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-green-600" />
                                  NGO - Non-Governmental Organization
                                </div>
                              </SelectItem>
                              <SelectItem value="VOLUNTEER">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-purple-600" />
                                  VOLUNTEER - Community Helper
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Optional Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="organization">Organization</Label>
                            <Input
                              id="organization"
                              name="organization"
                              type="text"
                              placeholder="Your organization"
                              value={formData.organization}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="Your phone number"
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Input
                              id="district"
                              name="district"
                              type="text"
                              placeholder="Your district"
                              value={formData.district}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              name="state"
                              type="text"
                              placeholder="Your state"
                              value={formData.state}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="signup-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-10 pr-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              autoComplete="new-password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-gray-300"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              autoComplete="new-password"
                              required
                            />
                          </div>
                        </div>

                        {/* Role Secret Key - Required for all roles */}
                        <div className="space-y-2">
                          <Label htmlFor="secretKey">
                            {formData.role
                              ? `${formData.role} Secret Key *`
                              : "Role Secret Key *"}
                          </Label>
                          <div className="relative">
                            <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="secretKey"
                              name="secretKey"
                              type="password"
                              placeholder={
                                formData.role
                                  ? `Enter ${formData.role} secret key`
                                  : "Select role first"
                              }
                              value={formData.secretKey}
                              onChange={handleInputChange}
                              className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              required
                              disabled={!formData.role}
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            {formData.role
                              ? `Contact system administrator for the ${formData.role} secret key`
                              : "Select your role to see secret key requirements"}
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    {/* Reset Password Tab */}
                    <TabsContent value="reset" className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Reset Password
                        </h3>
                        <p className="text-gray-300">
                          Enter your email address and we'll send you a link to
                          reset your password.
                        </p>
                      </div>

                      <form
                        onSubmit={handleResetPassword}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                              id="reset-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending Reset Link...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </form>

                      <div className="text-center">
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("signin")}
                          className="text-sm text-cyan-400 hover:text-blue-700"
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseAuthPage;
