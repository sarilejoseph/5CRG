import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../Assets/logo.png";

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname;
    if (path.includes("/dashboard")) setActiveItem("Dashboard");
    else if (path.includes("/add")) setActiveItem("Add Entry");
    else if (path.includes("/reports")) setActiveItem("Reports");
    else if (path.includes("/actions")) setActiveItem("Actions");
    else if (path.includes("/usermanagement")) setActiveItem("User Management");
  }, [location]);

  const navItems = [
    { name: "Add Entry", path: "/add", icon: "plus" },
    { name: "Dashboard", path: "/dashboard", icon: "grid" },
    { name: "Reports", path: "/reports", icon: "file-text" },
    { name: "Actions", path: "/actions", icon: "activity" },
    { name: "User Management", path: "/usermanagement", icon: "users" },
  ];

  // Map of icon names to JSX
  const icons = {
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    grid: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    "file-text": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    activity: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
    users: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
      {/* Logo section */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-8" />
          <span className="ml-2 text-lg font-semibold text-blue-600">
            5th CRG
          </span>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto">
        {/* GENERAL section */}
        <div className="px-4 pt-6">
          <p className="text-xs font-medium text-gray-400 tracking-wider mb-2">
            GENERAL
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    activeItem === item.name
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">{icons[item.icon]}</span>
                  <span>{item.name}</span>
                  {item.name === "Reports" && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      12
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SYSTEM section - grayed out as placeholders */}
        <div className="px-4 pt-6">
          <p className="text-xs font-medium text-gray-400 tracking-wider mb-2">
            SYSTEM
          </p>
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-gray-400"
              >
                <span className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </span>
                <span>Program List</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-gray-400"
              >
                <span className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
                <span>Institution List</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-gray-400"
              >
                <span className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span>Specialty List</span>
              </a>
            </li>
          </ul>
        </div>

        {/* USER section */}
        <div className="px-4 pt-6 pb-6">
          <p className="text-xs font-medium text-gray-400 tracking-wider mb-2">
            USER
          </p>
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-gray-400"
              >
                <span className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <span>My Profile</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-3 py-2 rounded-md text-gray-400"
              >
                <span className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </span>
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
