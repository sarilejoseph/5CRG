import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  HelpCircle,
  Clock,
  Layout,
  FileText,
  PlusCircle,
  Settings,
  X,
  Menu,
} from "lucide-react";

// Import images (adjust paths as needed)
import DashboardImage from "../Assets/dashboard.png";
import RecordsImage from "../Assets/reports.png";
import ActionsImage from "../Assets/actions.png";
import AddPageImage from "../Assets/add.png";
import UserManagementImage from "../Assets/user.png";

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("add");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const tutorials = [
    {
      id: "add",
      title: "Add Entry",
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Add a New Entry
          </h2>
          <p className="text-gray-700 mb-4">
            Use the <strong>Add Entry</strong> page to log communications like
            letters, notices, or reports. This guide explains how to fill out
            the form and submit entries.
          </p>
          <img
            src={AddPageImage}
            alt="Add Entry Page"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Steps to Add an Entry
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li>
              <strong>Go to Add Entry</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Log in to the 5th CRG E-Logbook.</li>
                <li>
                  Click <strong>Add Entry</strong> (plus or clock icon) in the
                  sidebar.
                </li>
                <li>The form will appear.</li>
              </ul>
            </li>
            <li>
              <strong>Select Message Type</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Choose a type (e.g., <strong>STL</strong>,{" "}
                  <strong>Letter</strong>, <strong>Conference Notice</strong>).
                </li>
                <li>The form adjusts based on your selection.</li>
                <li>
                  <em>Example</em>: Select <strong>Letter</strong> for civilian
                  letters.
                </li>
              </ul>
            </li>
            <li>
              <strong>Fill Required Fields</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  <strong>Direction</strong>: Toggle between{" "}
                  <strong>Incoming</strong> or <strong>Outgoing</strong>.
                </li>
                <li>
                  <strong>Sender/Receiver</strong>: Enter names (e.g., "Jane
                  Doe").
                </li>
                <li>
                  <strong>Date Sent</strong>: Select the date.
                </li>
                <li>
                  <strong>Channel</strong>: Pick a method (e.g.,{" "}
                  <strong>Email</strong>, <strong>Hardcopy</strong>).
                </li>
                <li>
                  Complete all fields marked with{" "}
                  <span className="text-red-500">*</span>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Add Specific Details</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  <strong>STL/Letter</strong>: Add a subject (e.g., "Meeting
                  Request").
                </li>
                <li>
                  <strong>Conference Notice</strong>: Enter agenda and location.
                </li>
                <li>
                  <strong>LOI</strong>: Specify title and purpose.
                </li>
                <li>
                  <strong>RAD</strong>: Include citation number.
                </li>
                <li>
                  <em>Example</em>: For STL, write a brief task description.
                </li>
              </ul>
            </li>
            <li>
              <strong>Attach a File (Optional)</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Choose File</strong> to upload a PDF, image, or
                  Word document.
                </li>
                <li>Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX.</li>
                <li>
                  <em>Example</em>: Upload a scanned letter as a PDF.
                </li>
              </ul>
            </li>
            <li>
              <strong>Submit the Entry</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click the <strong>Save</strong> button.
                </li>
                <li>
                  Look for a green <strong>"Saved!"</strong> message.
                </li>
                <li>The form resets for the next entry.</li>
                <li>
                  If errors appear (e.g., missing fields), a red message will
                  guide you.
                </li>
              </ul>
            </li>
            <li>
              <strong>Check Your Entry</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Visit the <strong>Records & Reports</strong> page.
                </li>
                <li>
                  Look in the <strong>Incoming</strong> or{" "}
                  <strong>Outgoing</strong> table.
                </li>
                <li>
                  <em>Example</em>: Find your STL in the Incoming table.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Quick Tips
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              Choose the correct <strong>type</strong> (e.g., LOI for inquiries)
              for accurate records.
            </li>
            <li>
              Fill all <strong>required fields</strong> (marked with{" "}
              <span className="text-red-500">*</span>).
            </li>
            <li>
              Keep <strong>attachments</strong> clear and under size limits.
            </li>
            <li>Double-check names and dates for accuracy.</li>
            <li>
              Read <strong>error messages</strong> in red to fix issues quickly.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              <strong>Form Won’t Submit</strong>: Ensure all required fields are
              filled and the file format is supported.
            </li>
            <li>
              <strong>File Upload Fails</strong>: Check file type (PDF, PNG,
              etc.) and internet connection.
            </li>
            <li>
              <strong>Entry Missing</strong>: Verify the table
              (Incoming/Outgoing) and refresh the Reports page.
            </li>
            <li>
              <strong>Need Help?</strong>: Contact your admin or check other
              help sections.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Example
          </h3>
          <p className="text-gray-700">
            To log an incoming letter:
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
              <li>
                Go to <strong>Add Entry</strong>.
              </li>
              <li>
                Select <strong>Letter</strong> as the type.
              </li>
              <li>
                Set <strong>Incoming</strong>, Sender: "Jane Doe," Receiver:
                "You."
              </li>
              <li>
                Choose today’s date and <strong>Email</strong> channel.
              </li>
              <li>Add Subject: "Project Proposal."</li>
              <li>Upload "proposal.pdf."</li>
              <li>
                Click <strong>Save</strong>.
              </li>
              <li>
                Check the <strong>Incoming</strong> table in Reports.
              </li>
            </ol>
          </p>
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
            Navigate the Dashboard
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Dashboard</strong> is your home page, showing message
            counts, activity charts, and online users. Admins can view team
            data. This guide helps you use it effectively.
          </p>
          <img
            src={DashboardImage}
            alt="Dashboard Page"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Steps to Use the Dashboard
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li>
              <strong>Open the Dashboard</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Log in to the E-Logbook.</li>
                <li>
                  Click <strong>Dashboard</strong> (dashboard icon) in the
                  sidebar.
                </li>
                <li>
                  See a welcome message (e.g., "Welcome, John!") and the current
                  date/time.
                </li>
                <li>
                  Admins see a purple <strong>Admin</strong> badge.
                </li>
              </ul>
            </li>
            <li>
              <strong>View Message Counts</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Check the <strong>Analytics</strong> section for{" "}
                  <strong>Incoming</strong> (blue) and <strong>Outgoing</strong>{" "}
                  (green) counts.
                </li>
                <li>
                  <em>Example</em>: "Incoming: 10, Outgoing: 5."
                </li>
              </ul>
            </li>
            <li>
              <strong>Choose a Timeframe</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Select <strong>Daily</strong>, <strong>Weekly</strong>, or{" "}
                  <strong>Monthly</strong>.
                </li>
                <li>Active timeframe is blue.</li>
                <li>
                  <em>Example</em>: Choose <strong>Daily</strong> for today’s
                  messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Check Top Contacts</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  See <strong>Top Senders</strong> (Incoming) and{" "}
                  <strong>Top Receivers</strong> (Outgoing).
                </li>
                <li>
                  <em>Example</em>: "Jane Doe: 5 messages."
                </li>
              </ul>
            </li>
            <li>
              <strong>Explore Activity Chart</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  View <strong>Message Activity</strong> with blue (Incoming)
                  and green (Outgoing) lines.
                </li>
                <li>Hover for details (e.g., "3 messages at 9 AM").</li>
                <li>
                  <em>Example</em>: See a spike in morning activity.
                </li>
              </ul>
            </li>
            <li>
              <strong>Review Message Tables</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  <strong>Messages Received</strong>: Lists Incoming messages
                  (Sender, Type, Date).
                </li>
                <li>
                  <strong>Messages Sent</strong>: Lists Outgoing messages
                  (Receiver, Type).
                </li>
                <li>Hover to highlight rows.</li>
              </ul>
            </li>
            <li>
              <strong>Monitor Online Users</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Right sidebar shows users with green dots for online status.
                </li>
                <li>
                  <em>Example</em>: "Mary is online."
                </li>
              </ul>
            </li>
            <li>
              <strong>Admin: View Team Data</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>View</strong> next to a user in Online Users.
                </li>
                <li>
                  See their data with a <strong>Viewing: [Name]</strong> badge.
                </li>
                <li>
                  Click <strong>Back to My Data</strong> to return.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Quick Tips
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              Use <strong>Daily</strong> for recent activity,{" "}
              <strong>Monthly</strong> for trends.
            </li>
            <li>Hover over charts for precise data.</li>
            <li>
              Admins: Monitor team activity with <strong>View</strong>.
            </li>
            <li>
              Check <strong>Online Users</strong> for real-time status.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              <strong>Loading Stuck</strong>: Refresh or check internet.
            </li>
            <li>
              <strong>No Messages</strong>: Try <strong>Monthly</strong> or add
              entries.
            </li>
            <li>
              <strong>Admin Issues</strong>: Verify admin status or contact
              support.
            </li>
            <li>
              <strong>Need Help?</strong>: See other help sections or ask your
              admin.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">Example</h3>
          <p className="text-gray-700">
            To check today’s activity:
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
              <li>
                Go to <strong>Dashboard</strong>.
              </li>
              <li>
                Select <strong>Daily</strong>.
              </li>
              <li>
                View <strong>Incoming: 3</strong>, <strong>Outgoing: 2</strong>.
              </li>
              <li>Check Top Senders and activity chart.</li>
            </ol>
          </p>
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
            Manage Records & Reports
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Records & Reports</strong> page lets you view, filter,
            and export communication records. Admins can view all users’
            records. This guide covers how to use it.
          </p>
          <img
            src={RecordsImage}
            alt="Records & Reports Page"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Steps to Use Records & Reports
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li>
              <strong>Go to Records & Reports</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Log in to the E-Logbook.</li>
                <li>
                  Click <strong>Reports</strong> (file icon) in the sidebar.
                </li>
                <li>
                  See tabs for <strong>Incoming</strong> and{" "}
                  <strong>Outgoing</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Select a Tab</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Incoming</strong> or <strong>Outgoing</strong>.
                </li>
                <li>Active tab is underlined in blue.</li>
              </ul>
            </li>
            <li>
              <strong>Filter by Time</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Choose <strong>All Time</strong>, <strong>Today</strong>,{" "}
                  <strong>This Week</strong>, or <strong>This Month</strong>.
                </li>
                <li>Table updates automatically.</li>
                <li>
                  <em>Example</em>: Select <strong>Today</strong> for recent
                  records.
                </li>
              </ul>
            </li>
            <li>
              <strong>Filter by Type</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Filter</strong> and select a type (e.g.,{" "}
                  <strong>STL</strong>).
                </li>
                <li>
                  <em>Example</em>: Filter for <strong>Letter</strong> to see
                  civilian records.
                </li>
              </ul>
            </li>
            <li>
              <strong>View Records</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  <strong>Incoming</strong>: From, Type, Subject, Dates,
                  Channel, File.
                </li>
                <li>
                  <strong>Outgoing</strong>: To, Type, Subject, Date, Channel,
                  File.
                </li>
                <li>
                  Click thumbnails or <strong>View File</strong> for
                  attachments.
                </li>
              </ul>
            </li>
            <li>
              <strong>Export Records</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Export</strong> and choose{" "}
                  <strong>Print Incoming</strong> or <strong>Outgoing</strong>.
                </li>
                <li>A print-friendly report opens.</li>
                <li>
                  <em>Example</em>: Print today’s Incoming records.
                </li>
              </ul>
            </li>
            <li>
              <strong>Admin: View Modes</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Toggle <strong>Individual</strong> or{" "}
                  <strong>All Users</strong>.
                </li>
                <li>
                  <strong>All Users</strong> adds User and Direction columns.
                </li>
              </ul>
            </li>
            <li>
              <strong>Admin: View User Records</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  In <strong>Individual</strong> mode, select a user from the
                  dropdown.
                </li>
                <li>
                  <em>Example</em>: View Bob’s records.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Quick Tips
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              Combine <strong>time</strong> and <strong>type</strong> filters
              for precision.
            </li>
            <li>
              Click <strong>View File</strong> for non-image attachments.
            </li>
            <li>Filter before exporting to print specific data.</li>
            <li>
              Admins: Use <strong>All Users</strong> for team reports.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              <strong>Loading Stuck</strong>: Refresh or check internet.
            </li>
            <li>
              <strong>No Records</strong>: Try <strong>All Time</strong> or add
              entries.
            </li>
            <li>
              <strong>File Links Fail</strong>: Check connection or refresh.
            </li>
            <li>
              <strong>Need Help?</strong>: Contact your admin or check other
              sections.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-green-700 mb-3">Example</h3>
          <p className="text-gray-700">
            To review recent letters:
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
              <li>
                Go to <strong>Records & Reports</strong>.
              </li>
              <li>
                Select <strong>Incoming</strong>.
              </li>
              <li>
                Filter by <strong>This Week</strong> and <strong>Letter</strong>
                .
              </li>
              <li>View records and export to print.</li>
            </ol>
          </p>
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
            Manage Actions
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Actions</strong> page lets you view, edit, delete, or
            download communication files. Admins can manage all users’ messages.
            This guide explains how.
          </p>
          <img
            src={ActionsImage}
            alt="Actions Page"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Steps to Use Actions
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li>
              <strong>Go to Actions</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Log in to the E-Logbook.</li>
                <li>
                  Click <strong>Actions</strong> (wrench icon) in the sidebar.
                </li>
                <li>
                  See tabs for <strong>Incoming</strong> and{" "}
                  <strong>Outgoing</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Select a Tab</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Incoming Messages</strong> or{" "}
                  <strong>Outgoing Messages</strong>.
                </li>
                <li>Active tab is blue.</li>
              </ul>
            </li>
            <li>
              <strong>View Messages</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Table shows: ID, Sender/Receiver, Description, Date, Channel,
                  File, Actions.
                </li>
                <li>Admins see Username and User ID.</li>
                <li>
                  <em>Example</em>: See a message with a PDF.
                </li>
              </ul>
            </li>
            <li>
              <strong>Search Messages</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Use the search bar to find messages by ID, name, or
                  description.
                </li>
                <li>
                  <em>Example</em>: Search "Jane" for her messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Admin: Filter by User</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Select a user or <strong>All Users</strong> from the dropdown.
                </li>
                <li>
                  <em>Example</em>: View Bob’s messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Edit a Message</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Edit</strong> in Actions.
                </li>
                <li>Update fields or upload a new file.</li>
                <li>
                  Click <strong>Save</strong> or <strong>Cancel</strong>.
                </li>
                <li>
                  <em>Example</em>: Change a message’s description.
                </li>
              </ul>
            </li>
            <li>
              <strong>Delete a Message</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Delete</strong> and confirm.
                </li>
                <li>See a success message.</li>
              </ul>
            </li>
            <li>
              <strong>Download a File</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Download</strong> for files.
                </li>
                <li>
                  <em>Example</em>: Save a PDF to your device.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Quick Tips
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              Use specific <strong>search</strong> keywords for quick results.
            </li>
            <li>
              Check changes before <strong>editing</strong>.
            </li>
            <li>
              Confirm <strong>deletions</strong> carefully.
            </li>
            <li>Admins: Use the user dropdown for team management.</li>
          </ul>
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              <strong>Loading Stuck</strong>: Refresh or check internet.
            </li>
            <li>
              <strong>No Messages</strong>: Clear filters or add entries.
            </li>
            <li>
              <strong>Actions Fail</strong>: Check permissions or contact
              support.
            </li>
            <li>
              <strong>Need Help?</strong>: See other sections or ask your admin.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Example
          </h3>
          <p className="text-gray-700">
            To manage incoming messages:
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
              <li>
                Go to <strong>Actions</strong>.
              </li>
              <li>
                Select <strong>Incoming</strong>.
              </li>
              <li>Search "Jane."</li>
              <li>Edit a message’s description and save.</li>
              <li>Download or delete a message.</li>
            </ol>
          </p>
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
            Admin: Manage Users
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>User Management</strong> page lets admins add, edit,
            view, or delete user accounts. A passcode is required. This guide is
            for admins.
          </p>
          <img
            src={UserManagementImage}
            alt="User Management Page"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Before You Start
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              Confirm you have an <strong>admin role</strong> (check Dashboard).
            </li>
            <li>
              Obtain the <strong>4-digit passcode</strong> from your
              administrator.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Steps to Manage Users
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 mb-6">
            <li>
              <strong>Go to User Management</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Log in to the E-Logbook.</li>
                <li>
                  Click <strong>User Management</strong> (users icon) in the
                  sidebar.
                </li>
                <li>A passcode prompt appears.</li>
              </ul>
            </li>
            <li>
              <strong>Enter Passcode</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Input the 4-digit passcode.</li>
                <li>
                  Click <strong>Submit</strong>.
                </li>
                <li>If incorrect, see an error (5 attempts before lockout).</li>
                <li>
                  Click <strong>Exit</strong> to return to Dashboard.
                </li>
              </ul>
            </li>
            <li>
              <strong>View Users</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Table shows: Name, Email, Role, Department, Actions.</li>
                <li>
                  Roles: <strong>admin</strong> (red), <strong>user</strong>{" "}
                  (green).
                </li>
                <li>
                  <em>Example</em>: See "Jane Doe, user."
                </li>
              </ul>
            </li>
            <li>
              <strong>Add a User</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Add New User</strong>.
                </li>
                <li>
                  Fill in Email, Password, Name, Role, and optional fields.
                </li>
                <li>
                  Click <strong>Add User</strong>.
                </li>
                <li>
                  <em>Example</em>: Add "alice@example.com" as a user.
                </li>
              </ul>
            </li>
            <li>
              <strong>View User Details</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>View</strong> (eye icon).
                </li>
                <li>
                  See read-only details and close with <strong>X</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Edit a User</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Edit</strong> (pencil icon).
                </li>
                <li>Update fields; leave Password blank to keep it.</li>
                <li>
                  Click <strong>Update User</strong>.
                </li>
                <li>
                  <em>Example</em>: Change a user’s role to admin.
                </li>
              </ul>
            </li>
            <li>
              <strong>Delete a User</strong>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>
                  Click <strong>Delete</strong> (trash icon) and confirm.
                </li>
                <li>See a success message.</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Quick Tips
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              Keep the <strong>passcode</strong> secure.
            </li>
            <li>
              Use unique <strong>emails</strong> for new users.
            </li>
            <li>
              Avoid resetting <strong>passwords</strong> unless necessary.
            </li>
            <li>
              Confirm <strong>deletions</strong> carefully.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>
              <strong>Passcode Fails</strong>: Verify passcode or contact admin.
            </li>
            <li>
              <strong>Access Denied</strong>: Confirm admin role or re-login.
            </li>
            <li>
              <strong>Add/Edit Errors</strong>: Check for unique emails and
              required fields.
            </li>
            <li>
              <strong>Need Help?</strong>: Contact your admin or check other
              sections.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-red-700 mb-3">Example</h3>
          <p className="text-gray-700">
            To add a new user:
            <ol className="list-decimal list-inside ml-4 mt-2 space-y-2">
              <li>
                Go to <strong>User Management</strong>.
              </li>
              <li>Enter the passcode.</li>
              <li>
                Click <strong>Add New User</strong>.
              </li>
              <li>Add "alice@example.com," "Alice Brown," role: user.</li>
              <li>Save and verify in the table.</li>
            </ol>
          </p>
        </div>
      ),
    },
  ];

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle tab click: set active section and open sidebar
  const handleTabClick = (id) => {
    setActiveSection(id);
    setIsSidebarOpen(true);
  };

  // Scroll to search term
  useEffect(() => {
    if (searchTerm && contentRef.current) {
      const content = contentRef.current;
      const searchLower = searchTerm.toLowerCase();
      const elements = content.querySelectorAll("h2, h3, p, li");
      let found = false;

      // Clear previous highlights
      elements.forEach((el) => {
        el.innerHTML = el.innerHTML.replace(/<mark>(.*?)<\/mark>/g, "$1");
      });

      // Find and highlight first match
      for (const element of elements) {
        const text = element.textContent.toLowerCase();
        if (text.includes(searchLower) && !found) {
          const regex = new RegExp(`(${searchTerm})`, "gi");
          element.innerHTML = element.innerHTML.replace(
            regex,
            "<mark>$1</mark>"
          );
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          found = true;
          break;
        }
      }
    }
  }, [searchTerm, activeSection]);

  // Filter tutorials based on search term
  const filteredTutorials = tutorials.filter((tutorial) => {
    const contentText = tutorial.content.props.children
      .flat(Infinity)
      .filter((child) => typeof child === "string")
      .join(" ")
      .toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      tutorial.title.toLowerCase().includes(searchLower) ||
      contentText.includes(searchLower)
    );
  });

  // Auto-select first matching tab
  useEffect(() => {
    if (
      searchTerm &&
      filteredTutorials.length > 0 &&
      !filteredTutorials.find((t) => t.id === activeSection)
    ) {
      setActiveSection(filteredTutorials[0].id);
    }
  }, [searchTerm, filteredTutorials, activeSection]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Help Topics
          </h2>
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute top-4 right-4 text-gray-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2">
          {tutorials.map((tutorial) => (
            <button
              key={tutorial.id}
              onClick={() => {
                setActiveSection(tutorial.id);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 mb-1 rounded-lg text-left ${
                activeSection === tutorial.id
                  ? "bg-indigo-100 text-indigo-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tutorial.icon}
              <span>{tutorial.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-800 flex items-center">
              <HelpCircle className="mr-3" />
              E-Logbook Help Center
            </h1>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-indigo-600"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search help topics (e.g., 'add entry', 'reports')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search help topics"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {tutorials.map((tutorial) => (
              <button
                key={tutorial.id}
                onClick={() => handleTabClick(tutorial.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === tutorial.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-selected={activeSection === tutorial.id}
              >
                {tutorial.icon}
                <span>{tutorial.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="bg-white rounded-lg shadow-md p-6 transition-opacity duration-300"
          >
            {filteredTutorials.length > 0 ? (
              filteredTutorials.find((t) => t.id === activeSection)
                ?.content || (
                <p className="text-gray-500 text-center">
                  Select a topic from the sidebar or tabs to view help content.
                </p>
              )
            ) : (
              <p className="text-gray-500 text-center">
                No results found. Try keywords like "add entry," "reports," or
                "user management."
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default HelpPage;
