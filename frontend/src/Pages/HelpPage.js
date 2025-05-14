import React, { useState } from "react";
import {
  HelpCircle,
  Clock,
  Layout,
  FileText,
  PlusCircle,
  Settings,
} from "lucide-react";

import DashboardImage from "../Assets/dashboard.png";
import RecordsImage from "../Assets/reports.png";
import ActionsImage from "../Assets/actions.png";
import AddPageImage from "../Assets/add.png";
import UserManagementImage from "../Assets/user.png";

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState("add");

  const tutorials = [
    {
      id: "add",
      title: "Add Entry",
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-indigo-800">
            How to Add an Entry
          </h2>
          <p className="text-xl text-gray-700">
            Use the <strong>Add Entry</strong> page to log messages like letters
            or notices. This guide shows you how to do it step-by-step.
          </p>
          <img
            src={AddPageImage}
            alt="Add Entry Page"
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          <h3 className="text-2xl font-semibold text-indigo-700">
            Steps to Add an Entry
          </h3>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-4">
            <li>
              <strong>Open Add Entry</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Log into the E-Logbook system.</li>
                <li>
                  Click <strong>Add Entry</strong> in the sidebar (plus or clock
                  icon).
                </li>
                <li>A form will appear.</li>
              </ul>
            </li>
            <li>
              <strong>Select Message Type</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Choose a type (e.g., Letter, Notice) from the dropdown.</li>
                <li>The form adjusts to your selection.</li>
                <li>Example: Pick "Letter" for civilian messages.</li>
              </ul>
            </li>
            <li>
              <strong>Enter Details</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  <strong>Direction</strong>: Select "Incoming" or "Outgoing."
                </li>
                <li>
                  <strong>Sender/Receiver</strong>: Type names (e.g., "Jane
                  Doe").
                </li>
                <li>
                  <strong>Date Sent</strong>: Choose a date and time.
                </li>
                <li>
                  <strong>Channel</strong>: Select a method (e.g., Email).
                </li>
                <li>Fill all required fields (marked with *).</li>
                <li>
                  Add a description (e.g., "Meeting Request" for a Letter).
                </li>
              </ul>
            </li>
            <li>
              <strong>Attach a File (Optional)</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Choose File</strong> to upload a PDF, image, or
                  Word file.
                </li>
                <li>Supported formats: PNG, JPG, PDF, DOCX.</li>
                <li>The file name shows up after uploading.</li>
              </ul>
            </li>
            <li>
              <strong>Submit Entry</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click the green <strong>Add Entry</strong> button.
                </li>
                <li>A green "Entry added!" message confirms success.</li>
                <li>
                  If there’s an error, a red message explains (e.g., "Fill
                  required fields").
                </li>
              </ul>
            </li>
            <li>
              <strong>Verify Entry</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Go to the <strong>Reports</strong> page.
                </li>
                <li>Check the Incoming or Outgoing table for your entry.</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-2xl font-semibold text-indigo-700">Quick Tips</h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>Choose the correct message type for proper sorting.</li>
            <li>Fill all required fields to avoid errors.</li>
            <li>Upload clear files in supported formats.</li>
            <li>Double-check names and dates.</li>
            <li>Read red error messages to fix issues.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-indigo-700">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>
              <strong>Can’t submit?</strong> Check for missing fields or wrong
              file types. Try refreshing.
            </li>
            <li>
              <strong>Error message?</strong> Read the red text (e.g., "File too
              large") and fix it.
            </li>
            <li>
              <strong>Entry missing?</strong> Check the correct table or wait
              for the system to update.
            </li>
            <li>
              <strong>File won’t upload?</strong> Ensure it’s a supported format
              and check your internet.
            </li>
            <li>
              <strong>Need help?</strong> Contact your admin.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-indigo-700">Example</h3>
          <p className="text-xl text-gray-700">To log a letter:</p>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-3">
            <li>
              Go to <strong>Add Entry</strong>.
            </li>
            <li>
              Select <strong>Letter</strong>.
            </li>
            <li>
              Set Direction to "Incoming," Sender to "Jane Doe," Receiver to
              "John Smith."
            </li>
            <li>Choose today’s date and "Email" as Channel.</li>
            <li>Add description: "Project Proposal."</li>
            <li>Upload "proposal.pdf."</li>
            <li>
              Click <strong>Add Entry</strong>.
            </li>
            <li>
              Check <strong>Reports</strong> to see it in the Incoming table.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <Layout className="w-6 h-6 text-blue-600" />,
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-blue-800">
            How to Use the Dashboard
          </h2>
          <p className="text-xl text-gray-700">
            The <strong>Dashboard</strong> is your home page, showing message
            counts, trends, and online users. Admins can view others’ data.
            Here’s how to use it.
          </p>
          <img
            src={DashboardImage}
            alt="Dashboard Page"
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          <h3 className="text-2xl font-semibold text-blue-700">
            Steps to Use the Dashboard
          </h3>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-4">
            <li>
              <strong>Open Dashboard</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Log into the E-Logbook system.</li>
                <li>
                  Click <strong>Dashboard</strong> in the sidebar.
                </li>
                <li>
                  See a welcome message with your name and the current time.
                </li>
                <li>
                  Admins see a purple <strong>Admin</strong> badge.
                </li>
              </ul>
            </li>
            <li>
              <strong>Check Message Counts</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  View <strong>Incoming</strong> (blue) and{" "}
                  <strong>Outgoing</strong> (green) totals.
                </li>
                <li>Example: "Incoming: 10, Outgoing: 5."</li>
              </ul>
            </li>
            <li>
              <strong>Pick a Timeframe</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Choose <strong>Daily</strong>, <strong>Weekly</strong>, or{" "}
                  <strong>Monthly</strong>.
                </li>
                <li>Data updates to show messages for that period.</li>
                <li>
                  Example: Select <strong>Daily</strong> for today’s activity.
                </li>
              </ul>
            </li>
            <li>
              <strong>View Top Contacts</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  See top 3 <strong>Senders</strong> (Incoming) and{" "}
                  <strong>Receivers</strong> (Outgoing).
                </li>
                <li>Example: "Jane Doe: 5 messages."</li>
              </ul>
            </li>
            <li>
              <strong>Check Activity Chart</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  View a chart with Incoming (blue) and Outgoing (green)
                  messages over time.
                </li>
                <li>Hover to see details (e.g., "2 messages at 9 AM").</li>
              </ul>
            </li>
            <li>
              <strong>Browse Messages</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  <strong>Incoming</strong> table shows sender, type, and date.
                </li>
                <li>
                  <strong>Outgoing</strong> table shows receiver, type, and
                  date.
                </li>
                <li>Hover to highlight rows.</li>
              </ul>
            </li>
            <li>
              <strong>View Online Users</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  See user names, status (green dot for online), and roles.
                </li>
                <li>Updates in real-time.</li>
              </ul>
            </li>
            <li>
              <strong>Admin: View User Data</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>View</strong> next to a user in Online Users.
                </li>
                <li>See their messages and analytics.</li>
                <li>
                  Click <strong>Back to My Data</strong> to return.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-2xl font-semibold text-blue-700">Quick Tips</h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>
              Use <strong>Daily</strong> for recent activity,{" "}
              <strong>Monthly</strong> for trends.
            </li>
            <li>Hover over charts for detailed counts.</li>
            <li>Green dots show active users.</li>
            <li>
              Admins: Use <strong>View</strong> to check team activity.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-blue-700">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>
              <strong>Loading screen?</strong> Wait, check internet, or refresh.
            </li>
            <li>
              <strong>No messages?</strong> Try <strong>Monthly</strong> or add
              entries.
            </li>
            <li>
              <strong>No online users?</strong> Wait for updates; users may be
              offline.
            </li>
            <li>
              <strong>Admin can’t view data?</strong> Confirm admin status or
              contact support.
            </li>
            <li>
              <strong>Need help?</strong> Contact your admin.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-blue-700">Example</h3>
          <p className="text-xl text-gray-700">To check activity:</p>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-3">
            <li>
              Go to <strong>Dashboard</strong>.
            </li>
            <li>
              Select <strong>Daily</strong>.
            </li>
            <li>
              Check <strong>Incoming: 3</strong>, <strong>Outgoing: 2</strong>.
            </li>
            <li>See Top Sender: "Jane Doe."</li>
            <li>View messages in tables.</li>
            <li>
              Admins: Click <strong>View</strong> for a user’s data.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: "records",
      title: "Reports",
      icon: <FileText className="w-6 h-6 text-green-600" />,
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-green-800">
            How to Use Reports
          </h2>
          <p className="text-xl text-gray-700">
            The <strong>Reports</strong> page lets you view, filter, and print
            messages. Admins can see everyone’s messages. Here’s how to use it.
          </p>
          <img
            src={RecordsImage}
            alt="Reports Page"
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          <h3 className="text-2xl font-semibold text-green-700">
            Steps to Use Reports
          </h3>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-4">
            <li>
              <strong>Open Reports</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Log into the E-Logbook system.</li>
                <li>
                  Click <strong>Reports</strong> in the sidebar.
                </li>
                <li>See tabs for Incoming and Outgoing messages.</li>
              </ul>
            </li>
            <li>
              <strong>Choose Message Type</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Incoming</strong> or <strong>Outgoing</strong>{" "}
                  tab.
                </li>
                <li>The active tab is underlined in blue.</li>
              </ul>
            </li>
            <li>
              <strong>Filter by Time</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Use the dropdown to pick <strong>All Time</strong>,{" "}
                  <strong>Today</strong>, <strong>This Week</strong>, or{" "}
                  <strong>This Month</strong>.
                </li>
                <li>The table updates.</li>
                <li>
                  Example: Choose <strong>Today</strong> for recent messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Filter by Type</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Filter</strong> and select a type (e.g.,
                  Letter).
                </li>
                <li>The table shows only that type.</li>
              </ul>
            </li>
            <li>
              <strong>View Details</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Incoming: Shows sender, type, date, and attachments.</li>
                <li>Outgoing: Shows receiver, type, date, and attachments.</li>
                <li>
                  Click <strong>View File</strong> for attachments.
                </li>
              </ul>
            </li>
            <li>
              <strong>Print Reports</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Export</strong> and choose{" "}
                  <strong>Print Incoming</strong> or <strong>Outgoing</strong>.
                </li>
                <li>A print-ready report opens.</li>
              </ul>
            </li>
            <li>
              <strong>Admin: View Others’ Data</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Toggle <strong>Individual</strong> or{" "}
                  <strong>All Users</strong>.
                </li>
                <li>Select a user to see their messages.</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-2xl font-semibold text-green-700">Quick Tips</h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>Switch tabs to compare Incoming and Outgoing.</li>
            <li>Use filters to narrow down messages.</li>
            <li>Filter before printing to get specific data.</li>
            <li>
              Admins: Use <strong>All Users</strong> for a team overview.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-green-700">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>
              <strong>Loading?</strong> Wait, check internet, or refresh.
            </li>
            <li>
              <strong>No messages?</strong> Try <strong>All Time</strong> or add
              entries.
            </li>
            <li>
              <strong>Can’t see attachments?</strong> Check internet or refresh.
            </li>
            <li>
              <strong>Admin issues?</strong> Confirm admin role or contact
              support.
            </li>
            <li>
              <strong>Need help?</strong> Contact your admin.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-green-700">Example</h3>
          <p className="text-xl text-gray-700">To view recent letters:</p>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-3">
            <li>
              Go to <strong>Reports</strong>.
            </li>
            <li>
              Click <strong>Incoming</strong>.
            </li>
            <li>
              Set time to <strong>This Week</strong>.
            </li>
            <li>
              Filter by <strong>Letter</strong>.
            </li>
            <li>View letters and attachments.</li>
            <li>Print the report.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "actions",
      title: "Actions",
      icon: <PlusCircle className="w-6 h-6 text-purple-600" />,
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-purple-800">
            How to Use Actions
          </h2>
          <p className="text-xl text-gray-700">
            The <strong>Actions</strong> page lets you edit, delete, or download
            message files. Admins can manage everyone’s messages. Here’s how.
          </p>
          <img
            src={ActionsImage}
            alt="Actions Page"
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          <h3 className="text-2xl font-semibold text-purple-700">
            Steps to Use Actions
          </h3>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-4">
            <li>
              <strong>Open Actions</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Log into the E-Logbook system.</li>
                <li>
                  Click <strong>Actions</strong> in the sidebar.
                </li>
                <li>See tabs for Incoming and Outgoing messages.</li>
              </ul>
            </li>
            <li>
              <strong>Choose Messages</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Incoming</strong> or <strong>Outgoing</strong>.
                </li>
                <li>The table updates.</li>
              </ul>
            </li>
            <li>
              <strong>View Messages</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Table shows sender/receiver, description, date, and files.
                </li>
                <li>Admins see user details.</li>
              </ul>
            </li>
            <li>
              <strong>Admin: Filter by User</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Select a user or <strong>All Users</strong> from the dropdown.
                </li>
                <li>Table shows their messages.</li>
              </ul>
            </li>
            <li>
              <strong>Edit a Message</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Edit</strong> in the Actions column.
                </li>
                <li>Update fields or upload a new file.</li>
                <li>
                  Click <strong>Save</strong> or <strong>Cancel</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Delete a Message</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Delete</strong> and confirm.
                </li>
                <li>Message is removed.</li>
              </ul>
            </li>
            <li>
              <strong>Download a File</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Download</strong> to save the file.
                </li>
                <li>If no file, it says "No file."</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-2xl font-semibold text-purple-700">Quick Tips</h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>Switch tabs to manage different messages.</li>
            <li>Double-check edits before saving.</li>
            <li>Admins: Be cautious when editing or deleting.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-purple-700">
            Common Issues
          </h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>
              <strong>Loading?</strong> Wait, check internet, or refresh.
            </li>
            <li>
              <strong>No messages?</strong> Add entries or check filters.
            </li>
            <li>
              <strong>Can’t edit/delete?</strong> Check permissions or refresh.
            </li>
            <li>
              <strong>Need help?</strong> Contact your admin.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-purple-700">Example</h3>
          <p className="text-xl text-gray-700">To manage messages:</p>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-3">
            <li>
              Go to <strong>Actions</strong>.
            </li>
            <li>
              Click <strong>Incoming</strong>.
            </li>
            <li>Edit a message’s description.</li>
            <li>Download a file.</li>
            <li>Delete an old message.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "user-management",
      title: "User Management",
      icon: <Settings className="w-6 h-6 text-red-600" />,
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl font-bold text-red-800">
            How to Manage Users
          </h2>
          <p className="text-xl text-gray-700">
            The <strong>User Management</strong> page lets admins add, edit,
            view, or delete user accounts. You’ll need a passcode. Here’s how.
          </p>
          <img
            src={UserManagementImage}
            alt="User Management Page"
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          <h3 className="text-2xl font-semibold text-red-700">
            Before You Start
          </h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>You need admin access.</li>
            <li>Get the 4-digit passcode from your administrator.</li>
            <li>Log in as an admin.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-red-700">
            Steps to Manage Users
          </h3>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-4">
            <li>
              <strong>Open User Management</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Log into the E-Logbook system.</li>
                <li>
                  Click <strong>User Management</strong> in the sidebar.
                </li>
                <li>A passcode prompt appears.</li>
              </ul>
            </li>
            <li>
              <strong>Enter Passcode</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Type the 4-digit passcode.</li>
                <li>
                  Click <strong>Submit</strong>.
                </li>
                <li>
                  If correct, the page loads; if wrong, try again (5 attempts).
                </li>
              </ul>
            </li>
            <li>
              <strong>View Users</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>Table shows name, email, role, and department.</li>
                <li>Roles: admin (red), user (green).</li>
              </ul>
            </li>
            <li>
              <strong>Add a User</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Add New User</strong>.
                </li>
                <li>Fill in email, password, name, and role.</li>
                <li>
                  Click <strong>Add User</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>View User Details</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>View</strong> (eye icon).
                </li>
                <li>See user details (password hidden).</li>
                <li>
                  Close with <strong>X</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Edit a User</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Edit</strong> (pencil icon).
                </li>
                <li>Update fields; leave password blank to keep it.</li>
                <li>
                  Click <strong>Update User</strong>.
                </li>
              </ul>
            </li>
            <li>
              <strong>Delete a User</strong>
              <ul className="list-disc list-inside ml-8 mt-2 space-y-2">
                <li>
                  Click <strong>Delete</strong> (trash icon).
                </li>
                <li>Confirm deletion.</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-2xl font-semibold text-red-700">Quick Tips</h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>Keep the passcode secure.</li>
            <li>Use unique emails for new users.</li>
            <li>Confirm deletions carefully.</li>
            <li>Read error messages to fix issues.</li>
          </ul>
          <h3 className="text-2xl font-semibold text-red-700">Common Issues</h3>
          <ul className="list-disc list-inside text-xl text-gray-700 space-y-3">
            <li>
              <strong>Passcode not working?</strong> Verify code or contact
              admin.
            </li>
            <li>
              <strong>Access denied?</strong> Confirm admin role or re-login.
            </li>
            <li>
              <strong>Loading?</strong> Wait, check internet, or refresh.
            </li>
            <li>
              <strong>Can’t add user?</strong> Check for duplicate email.
            </li>
            <li>
              <strong>Need help?</strong> Contact your admin.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold text-red-700">Example</h3>
          <p className="text-xl text-gray-700">To add a user:</p>
          <ol className="list-decimal list-inside text-xl text-gray-700 space-y-3">
            <li>
              Go to <strong>User Management</strong>.
            </li>
            <li>Enter passcode.</li>
            <li>
              Click <strong>Add New User</strong>.
            </li>
            <li>Add email "alice@example.com," password, name, and role.</li>
            <li>
              Click <strong>Add User</strong>.
            </li>
            <li>Check table for new user.</li>
          </ol>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-800 flex items-center">
            <HelpCircle className="w-8 h-8 mr-3" />
            Help Center
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {tutorials.map((tutorial) => (
            <button
              key={tutorial.id}
              onClick={() => setActiveSection(tutorial.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-lg transition-all ${
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

        <div className="bg-white rounded-lg shadow-md p-8">
          {tutorials.find((t) => t.id === activeSection)?.content || (
            <div className="text-center text-xl text-gray-500 py-8">
              <p>Click a topic above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
