import React, { useState } from "react";
import {
  Search,
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  Filter,
  Layout,
  FileText,
  PlusCircle,
  Settings,
} from "lucide-react";

// Import images (adjust paths as needed)
import DashboardImage from "../Assets/dashboard.png";
import RecordsImage from "../Assets/reports.png";
import ActionsImage from "../Assets/actions.png";
import AddPageImage from "../Assets/add.png";
import UserManagementImage from "../Assets/user.png";

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const tutorials = [
    {
      id: "overview",
      title: "Getting Started",
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Welcome to E-Log Book
          </h2>
          <p className="text-gray-700 mb-4">
            Our e-log book is a comprehensive communication and tracking system
            designed to streamline your workflow, manage interactions, and
            provide insightful analytics.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-indigo-800 mb-2">
                Easy Tracking
              </h3>
              <p className="text-gray-600">
                Seamlessly record and monitor all your communications with
                detailed logging capabilities.
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-2">
                Comprehensive Analytics
              </h3>
              <p className="text-gray-600">
                Gain deep insights into your communication patterns with
                advanced reporting tools.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">
                Flexible Management
              </h3>
              <p className="text-gray-600">
                Manage users, actions, and records with intuitive and powerful
                interfaces.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <Layout className="w-6 h-6 text-blue-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            Dashboard Overview
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <p className="text-gray-700 mb-4">
                The Dashboard provides a comprehensive snapshot of your system's
                key metrics and recent activities at a glance.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Quick access to key performance indicators</li>
                <li>Recent communication summaries</li>
                <li>Visual representations of your data</li>
                <li>Customizable widgets and layout</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={DashboardImage}
                alt="Dashboard"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "records",
      title: "Records & Reports",
      icon: <FileText className="w-6 h-6 text-green-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Records & Reports Management
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <p className="text-gray-700 mb-4">
                Comprehensive record-keeping and reporting system to track and
                analyze your communications and activities.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Detailed logs of all communications</li>
                <li>Advanced filtering and search capabilities</li>
                <li>Export reports in multiple formats</li>
                <li>Historical data tracking</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={RecordsImage}
                alt="Records & Reports"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      title: "Actions",
      icon: <PlusCircle className="w-6 h-6 text-purple-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Actions Management
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <p className="text-gray-700 mb-4">
                Streamline your workflows with a powerful actions management
                system that helps you track and prioritize tasks.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Create and assign actions</li>
                <li>Track action status and progress</li>
                <li>Set priorities and deadlines</li>
                <li>Collaborate with team members</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={ActionsImage}
                alt="Actions"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "add",
      title: "Add Entries",
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Adding New Entries
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <p className="text-gray-700 mb-4">
                Easily add new entries with a user-friendly interface that
                supports multiple types of communications and logs.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Intuitive data entry forms</li>
                <li>Multiple entry types supported</li>
                <li>Quick and efficient logging process</li>
                <li>Real-time validation and feedback</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={AddPageImage}
                alt="Add Entries"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "user-management",
      title: "User Management",
      icon: <Settings className="w-6 h-6 text-red-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            User Management and Permissions
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <p className="text-gray-700 mb-4">
                Comprehensive user management system with granular access
                controls and role-based permissions.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Create and manage user accounts</li>
                <li>Define role-based access levels</li>
                <li>Control system-wide and specific permissions</li>
                <li>Monitor user activities and access</li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={UserManagementImage}
                alt="User Management"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredTutorials = tutorials.filter(
    (tutorial) =>
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.content.props.children[1].props.children
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">
            <HelpCircle className="inline-block mr-3 mb-1" />
            E-Log Book Help Center
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search tutorials and help topics"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" />
        </div>

        {/* Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tutorials.map((tutorial) => (
            <button
              key={tutorial.id}
              onClick={() => setActiveSection(tutorial.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === tutorial.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tutorial.icon}
              <span>{tutorial.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {filteredTutorials.length > 0 ? (
            filteredTutorials.find((t) => t.id === activeSection)?.content
          ) : (
            <div className="text-center text-gray-500">
              <p>No tutorials match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
