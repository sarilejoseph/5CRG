import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import logo from "../Assets/logo.png";
import { database } from "../firebase";

const Header = ({ setMainContentMargin }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("User");
  const [profilePicture, setProfilePicture] = useState(null);
  const auth = getAuth();
  const userDropdownRef = useRef(null);
  const headerHeight = 64;
  const sidebarWidth = 256;
  const collapsedSidebarWidth = 64;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserName(userData.name || user.email.split("@")[0]);
            setProfilePicture(userData.profilePicture || null);
          } else {
            setUserName(user.email.split("@")[0]);
            setProfilePicture(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName(user.email.split("@")[0]);
          setProfilePicture(null);
        }
      } else {
        setCurrentUser(null);
        setUserName("User");
        setProfilePicture(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (setMainContentMargin) {
      setMainContentMargin(
        isSidebarOpen ? sidebarWidth : collapsedSidebarWidth
      );
    }
    document.body.style.paddingTop = `${headerHeight}px`;
  }, [isSidebarOpen, setMainContentMargin]);

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const closeUserDropdown = () => setIsUserDropdownOpen(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log("User signed out"))
      .catch((error) => console.error("Error signing out:", error));
    closeUserDropdown();
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        isSidebarOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".sidebar-toggle-btn")
      ) {
        closeSidebar();
      }
      if (
        isUserDropdownOpen &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        closeUserDropdown();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isSidebarOpen, isUserDropdownOpen]);

  const handleSidebarItemClick = () => {
    if (isSidebarOpen) closeSidebar();
  };

  const navigationItems = {
    mainActions: [
      { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
    ],
    reporting: [
      { label: "Reports", path: "/reports", icon: "reports" },
      { label: "Actions", path: "/actions", icon: "actions" },
    ],
    administration: [
      { label: "User Management", path: "/adminpage", icon: "users" },
      { label: "Help", path: "/helppage", icon: "help" },
    ],
  };

  const renderIcon = (iconName) => {
    const icons = {
      dashboard: (
        <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      ),
      reports: (
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      actions: (
        <>
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      ),
      users: (
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      ),
      add: <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
      home: (
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
      help: (
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      default: <path d="M9 5l7 7-7 7" />,
    };
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {icons[iconName] || icons.default}
      </svg>
    );
  };

  return (
    <div className="relative">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-800 to-blue-900 border-b border-gray-700 px-4 lg:px-6 py-3 shadow-md">
        <nav className="flex justify-between items-center mx-auto max-w-screen-xl">
          <div className="flex items-center">
            <button
              className="flex items-center focus:outline-none transition-transform hover:scale-105 sidebar-toggle-btn"
              onClick={toggleSidebar}
            >
              <div className="flex items-center px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <span className="text-xl font-semibold text-white mr-2">
                  5CRG
                </span>
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </button>
          </div>

          <div className="flex items-center">
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="flex items-center py-2 px-4 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none border border-transparent hover:border-blue-500"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full mr-2 object-cover"
                    onError={() => setProfilePicture(null)}
                  />
                ) : (
                  <svg
                    className="w-5 h-5 mr-2 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <span className="mr-1">{userName}</span>
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <Link
                    to="/profile"
                    onClick={closeUserDropdown}
                    className="block"
                  >
                    <span className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-t-lg group">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-5 h-5 rounded-full mr-3 object-cover"
                          onError={() => setProfilePicture(null)}
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                      Profile
                    </span>
                  </Link>
                  <Link to="/" onClick={handleLogout} className="block">
                    <span className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-b-lg border-t border-gray-100 group">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div
        className={`fixed left-0 z-40 transition-all duration-300 ease-in-out sidebar shadow-xl`}
        style={{
          top: `${headerHeight}px`,
          width: isSidebarOpen
            ? `${sidebarWidth}px`
            : `${collapsedSidebarWidth}px`,
          height: `calc(100vh - ${headerHeight}px)`,
          background: isSidebarOpen
            ? "linear-gradient(to bottom, #0a192f, #172a45)"
            : "#0a192f",
        }}
      >
        <div
          className={`flex items-center justify-between px-6 pt-8 pb-6 transition-all duration-300`}
          style={{
            background: isSidebarOpen
              ? "linear-gradient(to right, #0a192f, #112240)"
              : "#0a192f",
            borderBottom: isSidebarOpen ? "1px solid #233554" : "none",
          }}
        >
          {isSidebarOpen && (
            <div className="flex items-center">
              <img src={logo} alt="logo" className="h-8 w-auto" />
              <span className="text-xl font-semibold text-white ml-3">
                5th CRG
              </span>
            </div>
          )}
        </div>

        <div
          className={`${
            isSidebarOpen ? "px-4 pt-8 pb-6" : "px-0 py-4"
          } transition-all duration-300`}
        >
          <div className="mb-8">
            {isSidebarOpen && (
              <h3 className="text-xs uppercase font-bold text-blue-300 mb-4 tracking-wider">
                Main Actions
              </h3>
            )}
            <ul className="space-y-4">
              <li>
                <Link
                  to="/add"
                  onClick={handleSidebarItemClick}
                  className={`flex items-center transition-all duration-200 ${
                    isSidebarOpen
                      ? "px-4 py-3 text-white rounded-lg bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 shadow-md hover:shadow-lg group"
                      : "py-3 flex justify-center text-white hover:bg-navy-700"
                  }`}
                  title="Add Entry"
                >
                  <div
                    className={
                      isSidebarOpen ? "" : "flex justify-center w-full"
                    }
                  >
                    {renderIcon("add")}
                  </div>
                  {isSidebarOpen && (
                    <span className="ml-3 whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                      Add Entry
                    </span>
                  )}
                </Link>
              </li>
              {navigationItems.mainActions.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={handleSidebarItemClick}
                    className={`flex items-center transition-all duration-200 ${
                      isSidebarOpen
                        ? "px-4 py-3 text-white rounded-lg hover:bg-navy-800/40 group"
                        : "py-3 flex justify-center text-white hover:bg-navy-700"
                    }`}
                    title={item.label}
                  >
                    <div
                      className={
                        isSidebarOpen ? "" : "flex justify-center w-full"
                      }
                    >
                      {renderIcon(item.icon)}
                    </div>
                    {isSidebarOpen && (
                      <span className="ml-3 whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            {isSidebarOpen && (
              <h3 className="text-xs uppercase font-bold text-blue-400 mb-4 tracking-wider">
                Reporting
              </h3>
            )}
            <ul className="space-y-4">
              {navigationItems.reporting.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={handleSidebarItemClick}
                    className={`flex items-center transition-all duration-200 ${
                      isSidebarOpen
                        ? "px-4 py-3 text-white rounded-lg hover:bg-blue-800/40 group"
                        : "py-3 flex justify-center text-white hover:bg-blue-700"
                    }`}
                    title={item.label}
                  >
                    <div
                      className={
                        isSidebarOpen ? "" : "flex justify-center w-full"
                      }
                    >
                      {renderIcon(item.icon)}
                    </div>
                    {isSidebarOpen && (
                      <span className="ml-3 whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            {isSidebarOpen && (
              <h3 className="text-xs uppercase font-bold text-blue-400 mb-4 tracking-wider">
                Administration
              </h3>
            )}
            <ul className="space-y-4">
              {navigationItems.administration.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={handleSidebarItemClick}
                    className={`flex items-center transition-all duration-200 ${
                      isSidebarOpen
                        ? "px-4 py-3 text-white rounded-lg hover:bg-blue-800/40 group"
                        : "py-3 flex justify-center text-white hover:bg-blue-700"
                    }`}
                    title={item.label}
                  >
                    <div
                      className={
                        isSidebarOpen ? "" : "flex justify-center w-full"
                      }
                    >
                      {renderIcon(item.icon)}
                    </div>
                    {isSidebarOpen && (
                      <span className="ml-3 whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {isSidebarOpen && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-6 text-xs text-gray-400 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span>5th CRG Portal</span>
                <span>v1.0.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Header;
