import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useRoleAwareAuth } from "@/contexts/RoleAwareAuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Shield,
  Users,
  Building2,
  Heart,
  MapPin,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

const RoleBasedLogin: React.FC = () => {
  const { user, userProfile, signIn, signUp, loading } = useRoleAwareAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "",
    organization: "",
    district: "",
    state: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in and profile is loaded
  // Wait for loading to complete to avoid race conditions
  if (!loading && user && userProfile) {
    console.log("🔄 Redirecting authenticated user to dashboard:", {
      userEmail: user.email,
      userRole: userProfile.role,
    });
    return <Navigate to="/dashboard-router" replace />;
  }

  // Show loading if user is present but profile is still loading
  if (!loading && user && !userProfile) {
    console.log("⏳ User authenticated, waiting for profile...", {
      userEmail: user.email,
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log("🔑 Attempting login for:", formData.email);

    try {
      const result = await signIn(formData.email, formData.password);
      if (!result.success) {
        console.log("❌ Login failed:", result.error);
        setError(result.error || "Login failed");
      } else {
        console.log("✅ Login successful, waiting for profile...");
        // Don't set loading to false immediately, let the auth state change handle redirect
        return;
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.role
    ) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        name: formData.name,
        role: formData.role as any,
        organization: formData.organization || undefined,
        district: formData.district || undefined,
        state: formData.state || undefined,
        phone: formData.phone || undefined,
      });

      if (!result.success) {
        setError(result.error || "Signup failed");
      } else {
        setError(null);
        setActiveTab("login");
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
          role: "",
          organization: "",
          district: "",
          state: "",
          phone: "",
        });
        alert("Account created successfully! Please sign in to continue.");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "SDMA":
      case "DDMA":
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case "NGO":
        return <Heart className="h-4 w-4 text-green-600" />;
      case "VOLUNTEER":
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              JalRakshak Authentication
            </CardTitle>
            <CardDescription className="text-gray-600">
              Role-based access for disaster management professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address *</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        handleSelectChange(value, "role")
                      }
                      disabled={isLoading}
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
                        <SelectItem value="SDMA">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            SDMA - State Disaster Management
                          </div>
                        </SelectItem>
                        <SelectItem value="DDMA">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            DDMA - District Disaster Management
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-organization">Organization</Label>
                      <Input
                        id="signup-organization"
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Your organization"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-district">District</Label>
                      <Input
                        id="signup-district"
                        name="district"
                        type="text"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="Your district"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-state">State</Label>
                      <Input
                        id="signup-state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Your state"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create password"
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm password"
                          required
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Role Information Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Available Roles</CardTitle>
            <CardDescription>
              Different access levels for different users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {getRoleIcon("ADMIN")}
                <div>
                  <span className="font-medium">ADMIN</span>
                  <p className="text-gray-600">
                    Full system access and management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getRoleIcon("SDMA")}
                <div>
                  <span className="font-medium">NDMA/SDMA/DDMA</span>
                  <p className="text-gray-600">
                    Government disaster management agencies
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getRoleIcon("NGO")}
                <div>
                  <span className="font-medium">NGO</span>
                  <p className="text-gray-600">
                    Non-governmental organizations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getRoleIcon("VOLUNTEER")}
                <div>
                  <span className="font-medium">VOLUNTEER</span>
                  <p className="text-gray-600">
                    Community volunteers and field workers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials - Only show for login */}
        {activeTab === "login" && (
          <Card className="shadow-lg bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                Demo Access
              </CardTitle>
              <CardDescription className="text-blue-600">
                Test credentials for different roles
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-2 text-blue-700">
                <div>
                  <strong>Admin:</strong> admin@jalrakshak.gov.in
                </div>
                <div>
                  <strong>NDMA:</strong> ndma@jalrakshak.gov.in
                </div>
                <div>
                  <strong>NGO:</strong> ngo@jalrakshak.org
                </div>
                <div>
                  <strong>Password:</strong> (Contact system administrator)
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoleBasedLogin;
