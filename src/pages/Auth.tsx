import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
import { RoleBasedAuthService } from "@/lib/roleBasedAuth";
import { setDemoAccessRole } from "@/lib/demoAccess";
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
  Sparkles,
  Zap,
  Building2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, loginWithGoogle, resetPassword, currentUser } =
    useAuth();
  const {
    user: supabaseUser,
    userProfile,
    loading: roleAwareLoading,
  } = useRoleAwareAuth();

  const [activeTab, setActiveTab] = useState(
    searchParams.get("mode") || "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  // Redirect if already authenticated - USE ROLE-BASED ROUTING
  useEffect(() => {
    if (supabaseUser && userProfile) {
      console.log(
        "User authenticated, redirecting to role-based dashboard:",
        userProfile.role
      );
      const dashboardRoute = RoleBasedAuthService.getDashboardRoute(
        userProfile.role
      );
      navigate(dashboardRoute);
    } else if (currentUser) {
      // Firebase user but no Supabase profile yet - use router to determine role
      console.log("Firebase user authenticated, using role-based router");
      navigate("/dashboard-router");
    }
  }, [currentUser, supabaseUser, userProfile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // Use role-based router instead of hardcoded /dashboard
      navigate("/dashboard-router");
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error("Please fill in all fields");
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

    setLoading(true);
    try {
      // Regular citizen signup - no role selection, defaults to CITIZEN
      await register(formData.email, formData.password, formData.displayName);
      // Use role-based router for new signups too
      navigate("/dashboard-router");
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // Use role-based router for Google login too
      navigate("/dashboard-router");
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await resetPassword(formData.email);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const handleUserDemoAccess = () => {
    setDemoAccessRole("user");
    toast.success("Demo mode enabled. Redirecting to User Portal...");
    navigate("/dashboard");
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-yellow-500";
    if (strength <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return "Weak";
    if (strength <= 2) return "Fair";
    if (strength <= 3) return "Good";
    return "Strong";
  };

  // Show loading screen during authentication
  if (loading) {
    return <LoadingScreen message="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
        
        {/* Floating Orbs - Larger and more visible */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-40 right-32 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -30, 0],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute bottom-32 left-40 w-96 h-96 bg-gradient-to-r from-teal-500/30 to-emerald-500/30 rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            x: [0, 40, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-cyan-400/50"
                animate={{
                  opacity: [0.05, 0.3, 0.05],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.02,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mb-6 text-gray-300 hover:text-cyan-400 hover:bg-white/10 transition-all duration-300 px-6 py-2 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center justify-center space-x-4 mb-6"
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
                  className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent"
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

            <motion.p
              className="text-gray-300 text-lg leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join the community protecting lives from floods
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/20 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-[0_0_8px_rgba(6,182,212,0.3)] border border-cyan-400/30 rounded-full">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                    </motion.div>
                    Secure Authentication
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <CardTitle className="text-2xl font-bold text-white">
                    {activeTab === "login" ? "Welcome Back" : "Create Account"}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    {activeTab === "login"
                      ? "Sign in to access your personalized flood monitoring dashboard"
                      : "Join thousands protecting their communities from floods"}
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Google Sign In */}
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm backdrop-blur-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Chrome className="w-4 h-4 mr-2" />
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-2 text-gray-200">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-200" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
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
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-200" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="pl-10 pr-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-200" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-200" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleForgotPassword}
                          className="px-0 text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Forgot password?
                        </Button>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Sign In
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUserDemoAccess}
                        className="w-full border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
                      >
                        Demo Access User Portal
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-white">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-200" />
                          <Input
                            id="displayName"
                            name="displayName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-200" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
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
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-200" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="pl-10 pr-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-200" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-200" />
                            )}
                          </Button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                                    passwordStrength(formData.password)
                                  )}`}
                                  style={{
                                    width: `${
                                      (passwordStrength(formData.password) /
                                        4) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {getPasswordStrengthText(
                                  passwordStrength(formData.password)
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-200" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="pl-10 text-white placeholder:text-gray-400 bg-white/10 border-white/20"
                            required
                          />
                          {formData.confirmPassword && (
                            <div className="absolute right-3 top-3">
                              {formData.password ===
                              formData.confirmPassword ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4 mr-2" />
                        )}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-xs text-gray-200">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy. Your data is encrypted and secure.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Organization Access */}
          <motion.div
            className="mt-6 text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">
                  Organization Access
                </span>
              </div>
              <p className="text-xs text-purple-300 mb-3">
                NGO, Volunteer, DMA, or Admin access? Use our role-based
                authentication
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/supabase-auth")}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                <Users className="w-3 h-3 mr-2" />
                Access Organization Portal
              </Button>
            </div>
          </motion.div>

          {/* Emergency Access */}
          <motion.div
            className="mt-6 text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-red-300">
                  Emergency Access
                </span>
              </div>
              <p className="text-xs text-red-300 mb-2">
                In case of emergency, call 108 immediately
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("tel:108", "_self")}
                className="border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                Call Emergency Services
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
