import { useState, useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
import Logs from "./Pages/ActivityLogsPage";
import { auth } from "./firebase";

function App() {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/registerpage", "/login"];
  const showFooterPaths = ["/aboutpage", "/contactpage"];
  const [mainContentMargin, setMainContentMargin] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
  const shouldShowFooter = showFooterPaths.includes(location.pathname);

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideHeader && user && (
        <Header setMainContentMargin={setMainContentMargin} />
      )}
      <main
        className="flex-grow transition-all duration-300 ease-in-out"
        style={{
          marginLeft: !shouldHideHeader && user ? `${mainContentMargin}px` : 0,
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registerpage" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <Add />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminpage"
            element={
              <ProtectedRoute>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/helppage"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/actions"
            element={
              <ProtectedRoute>
                <Actions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;
