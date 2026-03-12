// src/App.tsx
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
import BackupsAndRestore from "./pages/Dashboard/BackupsAndRestore.tsx";
import UpgradePlan from "./pages/Dashboard/UpgradePlan.tsx";
import ControlPanelPage from "./pages/Dashboard/ControlPanel.tsx";


export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>

        <Route
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

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ForgotPassword />} />


        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
