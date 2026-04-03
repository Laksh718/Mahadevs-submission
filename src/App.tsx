import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { SupabaseAuthProviderMinimal } from "@/contexts/SupabaseAuthContextMinimal";
import { AlertProvider } from "@/contexts/AlertContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SupabaseAuth from "./pages/SupabaseAuth";
import Admin from "./pages/Admin";
import AdminAlerts from "./pages/AdminAlerts";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminShelters from "./pages/AdminShelters";
import AdminRoutes from "./pages/AdminRoutes";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSystem from "./pages/AdminSystem";
import AdminFloodPrediction from "./pages/AdminFloodPrediction";
import AdminFloodAccuracy from "./pages/AdminFloodAccuracy";
import AdminRiskAssessment from "./pages/AdminRiskAssessment";
import AdminTraining from "./pages/AdminTraining";
import AdminResilienceIndex from "./pages/AdminResilienceIndex";
import AdminGISMapping from "./pages/AdminGISMapping";
import AdminReportSystem from "./pages/AdminReportSystem";
import AdminTest from "./pages/AdminTest";
import AdminDebug from "./pages/AdminDebug";
import AdminSimple from "./pages/AdminSimple";
import AdminBasic from "./pages/AdminBasic";
import AdminMinimalTest from "./pages/AdminMinimalTest";
import NDMADashboard from "./pages/NDMADashboard";
import NGODashboard from "./pages/NGODashboard";
import SimplifiedNGODashboard from "./pages/SimplifiedNGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import DMADashboard from "./pages/DMADashboard";
import DMAAnalytics from "./pages/DMAAnalytics";
import DMAAlerts from "./pages/DMAAlerts";
import DMAReports from "./pages/DMAReports";
import DMAShelters from "./pages/DMAShelters";
import DMATraining from "./pages/DMATraining";
import DMAGISMapping from "./pages/DMAGISMapping";
import DMAFloodPrediction from "./pages/DMAFloodPrediction";
import DMARiskAssessment from "./pages/DMARiskAssessment";
import DMASystem from "./pages/DMASystem";
import NGOAlerts from "./pages/NGOAlerts";
import NGOUsers from "./pages/NGOUsers";
import NGOTraining from "./pages/NGOTraining";
import NGOShelters from "./pages/NGOShelters";
import NGOReports from "./pages/NGOReports";
import NGOAnalytics from "./pages/NGOAnalytics";
import NGOGISMapping from "./pages/NGOGISMapping";
import VolunteerActivities from "./pages/VolunteerActivities";
import VolunteerTraining from "./pages/VolunteerTraining";
import VolunteerReports from "./pages/VolunteerReports";
import RoleDashboardRouter from "./components/RoleDashboardRouter";
import RoleAwareProtectedRoute from "./components/RoleAwareProtectedRoute";
import RoleBasedLogin from "./pages/RoleBasedLogin";
import { RoleAwareAuthProvider } from "./contexts/RoleAwareAuthContext";
import { UserRole } from "./lib/roleBasedAuth";
import Index from "./pages/Index";
import UserDashboard from "./pages/UserDashboard";
import Community from "./pages/Community";
import FloodPredictionPage from "./pages/FloodPredictionPage";
import ShelterFinder from "./pages/ShelterFinder";
import EmergencyContacts from "./pages/EmergencyContacts";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import ReliefAllocation from "./components/ReliefAllocation";
import FoodResources from "./components/FoodResources";
import VolunteerManagement from "./components/VolunteerManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RoleAwareAuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/admin/signup"
                element={
                  <SupabaseAuthProvider>
                    <SupabaseAuth />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/admin/signin"
                element={
                  <SupabaseAuthProvider>
                    <SupabaseAuth />
                  </SupabaseAuthProvider>
                }
              />

              {/* Redirect old admin URLs */}
              <Route
                path="/supabase-auth"
                element={<Navigate to="/admin/signin" replace />}
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <Admin />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/alerts"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AlertProvider isAdminContext={true}>
                        <AdminAlerts />
                      </AlertProvider>
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminReports />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminUsers />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/shelters"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminShelters />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/routes"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminRoutes />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/risk-assessment"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminRiskAssessment />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/flood-prediction"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminFloodPrediction />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/flood-accuracy"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminFloodAccuracy />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/training"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminTraining />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/resilience"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminResilienceIndex />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/gis-mapping"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminGISMapping />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/report-system"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminReportSystem />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminAnalytics />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route
                path="/admin/system"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminProtectedRoute>
                      <AdminSystem />
                    </AdminProtectedRoute>
                  </SupabaseAuthProviderMinimal>
                }
              />
              <Route path="/admin-test" element={<AdminTest />} />
              <Route path="/admin-debug" element={<AdminDebug />} />
              <Route path="/admin-simple" element={<AdminSimple />} />
              <Route path="/admin-basic" element={<AdminBasic />} />
              <Route
                path="/admin-minimal-test"
                element={
                  <SupabaseAuthProviderMinimal>
                    <AdminMinimalTest />
                  </SupabaseAuthProviderMinimal>
                }
              />

              {/* Role-Based Authentication & Dashboard Routes */}
              <Route path="/role-login" element={<RoleBasedLogin />} />
              <Route
                path="/dashboard-router"
                element={<RoleDashboardRouter />}
              />

              {/* DMA Routes */}
              <Route
                path="/dma/alerts"
                element={
                  <SupabaseAuthProvider>
                    <AlertProvider isAdminContext={true}>
                      <DMAAlerts />
                    </AlertProvider>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/reports"
                element={
                  <SupabaseAuthProvider>
                    <DMAReports />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/training"
                element={
                  <SupabaseAuthProvider>
                    <DMATraining />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/gis-mapping"
                element={
                  <SupabaseAuthProvider>
                    <DMAGISMapping />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/flood-prediction"
                element={
                  <SupabaseAuthProvider>
                    <DMAFloodPrediction />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/risk-assessment"
                element={
                  <SupabaseAuthProvider>
                    <DMARiskAssessment />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/shelters"
                element={
                  <SupabaseAuthProvider>
                    <DMAShelters />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/analytics"
                element={
                  <SupabaseAuthProvider>
                    <DMAAnalytics />
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/dma/system"
                element={
                  <SupabaseAuthProvider>
                    <DMASystem />
                  </SupabaseAuthProvider>
                }
              />

              {/* NGO Routes - Essential Features with Dedicated Components */}
              <Route
                path="/ngo/shelters"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute
                      requiredRoles={[UserRole.NGO, UserRole.VOLUNTEER]}
                    >
                      <NGOShelters />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/ngo/relief"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute
                      requiredRoles={[UserRole.NGO, UserRole.VOLUNTEER]}
                    >
                      <ReliefAllocation />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/ngo/food-resources"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute
                      requiredRoles={[UserRole.NGO, UserRole.VOLUNTEER]}
                    >
                      <FoodResources />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/ngo/volunteers"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute
                      requiredRoles={[UserRole.NGO, UserRole.VOLUNTEER]}
                    >
                      <VolunteerManagement />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />

              <Route
                path="/ndma-dashboard"
                element={
                  <RoleAwareProtectedRoute requiredRoles={UserRole.ADMIN}>
                    <NDMADashboard />
                  </RoleAwareProtectedRoute>
                }
              />
              <Route
                path="/ngo-dashboard"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute requiredRoles={UserRole.NGO}>
                      <SimplifiedNGODashboard />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/volunteer-dashboard"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute requiredRoles={UserRole.VOLUNTEER}>
                      <VolunteerDashboard />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />

              {/* Volunteer Routes */}
              <Route
                path="/volunteer/activities"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute requiredRoles={UserRole.VOLUNTEER}>
                      <VolunteerActivities />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/volunteer/training"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute requiredRoles={UserRole.VOLUNTEER}>
                      <VolunteerTraining />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />
              <Route
                path="/volunteer/reports"
                element={
                  <SupabaseAuthProvider>
                    <RoleAwareProtectedRoute requiredRoles={UserRole.VOLUNTEER}>
                      <VolunteerReports />
                    </RoleAwareProtectedRoute>
                  </SupabaseAuthProvider>
                }
              />

              <Route
                path="/dma-dashboard"
                element={
                  <SupabaseAuthProvider>
                    <DMADashboard />
                  </SupabaseAuthProvider>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <UserDashboard />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Community />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flood-prediction"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <FloodPredictionPage />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/old-dashboard"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Layout>
                        <Index />
                      </Layout>
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shelters"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <ShelterFinder />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emergency-contacts"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <EmergencyContacts />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predictions"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Layout>
                        <Predictions />
                      </Layout>
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Alerts />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Reports />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Profile />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AlertProvider>
                      <Analytics />
                    </AlertProvider>
                  </ProtectedRoute>
                }
              />

              {/* Redirect old routes */}
              <Route
                path="/index"
                element={<Navigate to="/dashboard" replace />}
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RoleAwareAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
