import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/Dashboard/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import UiTerminal from "./pages/Dashboard/UiTerminal";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicAuthRoute from "./components/PublicAuthRoute";
import BackupsAndRestore from "./pages/Dashboard/BackupsAndRestore";
import UpgradePlan from "./pages/Dashboard/UpgradePlan";
import ControlPanelPage from "./pages/Dashboard/ControlPanel";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<LandingPage />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ControlPanelPage />} />
          <Route path="profile" element={<UserProfiles />} />
          <Route path="blank" element={<Blank />} />
          <Route path="upgrade-plan" element={<UpgradePlan />} />
          <Route path="manage-backups" element={<BackupsAndRestore />} />
          <Route path="terminal" element={<UiTerminal />} />
        </Route>

        {/* AUTH ROUTES (Wrapped in PublicAuthRoute) */}
        <Route 
          path="/signin" 
          element={
            <PublicAuthRoute>
              <SignIn />
            </PublicAuthRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicAuthRoute>
              <SignUp />
            </PublicAuthRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicAuthRoute>
              <ForgotPassword />
            </PublicAuthRoute>
          } 
        />

        {/* 404 CATCH ALL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}