import { createBrowserRouter } from "react-router";
import { LoginScreen } from "./components/LoginScreen";
import { WeatherSetupScreen } from "./components/WeatherSetupScreen";
import { BriefingDashboard } from "./components/BriefingDashboard";
import { SafetyVideos } from "./components/SafetyVideos";
import { BriefingDashboardLayout2 } from "./components/BriefingDashboardLayout2";

export const router = createBrowserRouter([
  { path: "/", Component: LoginScreen },
  { path: "/weather-setup", Component: WeatherSetupScreen },
  { path: "/briefing", Component: BriefingDashboard },
  { path: "/briefing-v2", Component: BriefingDashboardLayout2 },
  { path: "/safety-videos", Component: SafetyVideos },
]);