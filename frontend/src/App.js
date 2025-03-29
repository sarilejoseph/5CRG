import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./Pages/Dashboard";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import Add from "./Pages/AddPage";
import Records from "./Pages/RecordsReportsPage";
import LandingPage from "./Pages/LandingPage";
import Actions from "./Pages/ActionsPage";
import AdminUserManagement from "./Pages/AdminPage";
import Profile from "./Pages/ProfilePage";
import Help from "./Pages/HelpPage";

function App() {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/registerpage", "/login"];
  const showFooterPaths = ["/aboutpage", "/contactpage"];

  // State to control main content margin
  const [mainContentMargin, setMainContentMargin] = useState(0);

  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
  const shouldShowFooter = showFooterPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideHeader && (
        <Header setMainContentMargin={setMainContentMargin} />
      )}
      <main
        className="flex-grow transition-all duration-300 ease-in-out"
        style={{ marginLeft: !shouldHideHeader ? `${mainContentMargin}px` : 0 }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/registerpage" element={<RegisterPage />} />
          <Route path="/add" element={<Add />} />
          <Route path="/reports" element={<Records />} />
          <Route path="/adminpage" element={<AdminUserManagement />} />
          <Route path="/helppage" element={<Help />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/actions" element={<Actions />} />
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;
