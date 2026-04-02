import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthGuard } from "./components/AuthGuard";
import { ThemeProvider } from "next-themes";

// Layouts
import Layout from "./components/Layout";
import AdminGuard from "./components/AdminGuard";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Support from "./pages/Support";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccess";
import Documentation from "./pages/Documentation";
import Downloads from "./pages/Downloads";
import FlightPlanning from "./pages/FlightPlanning";
import Plugins from "./pages/Plugins";
import DiscordCommunity from "./pages/DiscordCommunity";
import DynamicPage from "./pages/DynamicPage"; // Reusable dynamic content page
import NotFound from "./pages/NotFound";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import MissionPlanningPage from "./pages/MissionPlanningPage";
import MissionHistory from "./pages/MissionHistory";
import Logbook from "./pages/Logbook";
import LiveTracking from "./pages/LiveTracking";
import MissionTracking from "./pages/MissionTracking";
import MissionReportView from "./pages/MissionReportView";
import IncidentReports from "./pages/IncidentReports";
import PilotDirectory from "./pages/PilotDirectory";
import FleetStatus from "./pages/FleetStatus";
import HelicopterBases from "./pages/HelicopterBases";
import HospitalDirectory from "./pages/HospitalDirectory";
import HospitalScenery from "./pages/HospitalScenery";
import HospitalSceneryView from "./pages/HospitalSceneryView";
import Community from "./pages/Community";
import UserProfilePage from "./pages/User";
import CockpitEFB from "./pages/CockpitEFB";
import SimulatorClientPage from "./pages/SimulatorClientPage";
import MapEmbedPage from "./pages/MapEmbedPage";
import LocalBridgeDisplay from "./pages/LocalBridgeDisplay"; // NEW IMPORT

// Admin Pages
import AdminOverview from "./pages/admin/Overview";
import AdminLiveOps from "./pages/admin/LiveOps";
import AdminUsers from "./pages/admin/Users";
import AdminProfiles from "./pages/admin/Profiles";
import AdminCrewBases from "./pages/admin/CrewBases";
import AdminAircraft from "./pages/admin/Aircraft";
import AdminMaintenance from "./pages/admin/Maintenance";
import AdminHospitals from "./pages/admin/Hospitals";
import AdminHospitalScenery from "./pages/admin/HospitalScenery";
import AdminBaseScenery from "./pages/admin/BaseScenery";
import AdminDownloads from "./pages/admin/Downloads";
import AdminContent from "./pages/admin/Content";
import AdminContentEditor from "./pages/admin/ContentEditor";
import AdminPermission from "./pages/admin/Permission";
import AdminNotams from "./pages/admin/Notams";
import AdminConfiguration from "./pages/admin/Configuration";
import AdminSafetyAudit from "./pages/admin/SafetyAudit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Strictly Public Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/support" element={<Support />} />
              <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
              
              {/* EFB View (Authenticated but no Layout) */}
              <Route element={<AuthGuard />}>
                <Route path="/cockpit/:id" element={<CockpitEFB />} />
              </Route>

              {/* Layout-wrapped Pages */}
              <Route element={<Layout />}>
                {/* Public Info */}
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/flight-planning" element={<FlightPlanning />} />
                <Route path="/plugins" element={<Plugins />} />
                <Route path="/discord" element={<DiscordCommunity />} />
                
                {/* Dynamic Content Pages (Legal, Whitepaper) */}
                <Route path="/privacy" element={<DynamicPage />} />
                <Route path="/terms" element={<DynamicPage />} />
                <Route path="/whitepaper" element={<DynamicPage />} />

                {/* Protected Ops Pages */}
                <Route element={<AuthGuard />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/logbook" element={<Logbook />} />
                  <Route path="/mission-history" element={<MissionHistory />} />
                  <Route path="/report/:id" element={<MissionReportView />} />
                  <Route path="/incident-reports" element={<IncidentReports />} />
                  <Route path="/pilot-directory" element={<PilotDirectory />} />
                  <Route path="/fleet-status" element={<FleetStatus />} />
                  <Route path="/helicopter-bases" element={<HelicopterBases />} />
                  <Route path="/hospital-directory" element={<HospitalDirectory />} />
                  <Route path="/hospital-scenery" element={<HospitalScenery />} />
                  <Route path="/hospital-scenery/:id" element={<HospitalSceneryView />} />
                  <Route path="/operational-map" element={<MapEmbedPage />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/user" element={<UserProfilePage />} />

                  <Route path="/generate" element={<MissionPlanningPage />} />
                  <Route path="/tracking/:id" element={<MissionTracking />} />
                  <Route path="/live-tracking" element={<LiveTracking />} />
                  <Route path="/simulator-client" element={<SimulatorClientPage />} />
                  <Route path="/local-bridge" element={<LocalBridgeDisplay />} /> {/* NEW ROUTE */}

                  {/* Admin Command Center */}
                  <Route element={<AdminGuard />}>
                    <Route path="/admin" element={<AdminOverview />} />
                    <Route path="/admin/overview" element={<AdminOverview />} />
                    <Route path="/admin/live-ops" element={<AdminLiveOps />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/profiles" element={<AdminProfiles />} />
                    <Route path="/admin/crew-bases" element={<AdminCrewBases />} />
                    <Route path="/admin/aircraft" element={<AdminAircraft />} />
                    <Route path="/admin/maintenance" element={<AdminMaintenance />} />
                    <Route path="/admin/hospitals" element={<AdminHospitals />} />
                    <Route path="/admin/hospital-scenery" element={<AdminHospitalScenery />} />
                    <Route path="/admin/base-scenery" element={<AdminBaseScenery />} />
                    <Route path="/admin/downloads" element={<AdminDownloads />} />
                    <Route path="/admin/content" element={<AdminContent />} />
                    <Route path="/admin/content/edit/:slug" element={<AdminContentEditor />} />
                    <Route path="/admin/permission" element={<AdminPermission />} />
                    <Route path="/admin/configuration" element={<AdminConfiguration />} />
                    <Route path="/admin/notams" element={<AdminNotams />} />
                    <Route path="/admin/safety-audit" element={<AdminSafetyAudit />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;