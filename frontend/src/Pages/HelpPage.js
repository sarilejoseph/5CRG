import React, { useState, useEffect } from "react";
import {
  Search,
  HelpCircle,
  Clock,
  Layout,
  FileText,
  PlusCircle,
  Settings,
  X,
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

  const tutorials = [
    {
      id: "add",
      title: "Add Entry",
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            How to Use the Add Entry Page
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Add Entry</strong> page allows you to log new
            communications, such as letters, notices, or reports, with details
            like sender, receiver, and attachments. This guide provides
            step-by-step instructions for adding entries efficiently.
          </p>
          <img
            src={AddPageImage}
            alt="Add Entry"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Step-by-Step Instructions
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Access the Add Entry Page</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Log in to the 5th CRG E-Logbook system.</li>
                <li>
                  From the sidebar, click <strong>Add Entry</strong> (with a
                  plus or clock icon).
                </li>
                <li>The Add Entry page opens with a form.</li>
              </ul>
            </li>
            <li>
              <strong>Choose Message Type</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Select a type from the dropdown (e.g., STL, Letter, Conference
                  Notice, LOI, RAD).
                </li>
                <li>The form updates based on your choice.</li>
                <li>Example: Choose "Letter" for civilian communications.</li>
              </ul>
            </li>
            <li>
              <strong>Fill in Common Fields</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Direction</strong>: Select "Incoming" or "Outgoing."
                </li>
                <li>
                  <strong>Sender/Receiver</strong>: Enter names (e.g., "Jane
                  Doe" for sender).
                </li>
                <li>
                  <strong>Date Sent</strong>: Pick a date and time.
                </li>
                <li>
                  <strong>Channel</strong>: Choose a delivery method (e.g.,
                  Email, Physical).
                </li>
                <li>Ensure all required fields (marked with *) are filled.</li>
              </ul>
            </li>
            <li>
              <strong>Add Type-Specific Details</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  For <strong>STL/Letter</strong>: Enter a description (e.g.,
                  "Meeting Request").
                </li>
                <li>
                  For <strong>Conference Notice</strong>: Add agenda and
                  location.
                </li>
                <li>
                  For <strong>LOI</strong>: Specify the title and purpose.
                </li>
                <li>
                  For <strong>RAD</strong>: Include citation details.
                </li>
                <li>
                  Example: For an STL, describe the task in the description
                  field.
                </li>
              </ul>
            </li>
            <li>
              <strong>Upload an Attachment (Optional)</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Choose File</strong> to select an image, PDF, or
                  Word document.
                </li>
                <li>
                  Supported formats: PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX.
                </li>
                <li>
                  The file name appears next to the button after selection.
                </li>
                <li>Example: Upload a scanned letter as a PDF.</li>
              </ul>
            </li>
            <li>
              <strong>Submit the Entry</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Add Entry</strong> (green button).
                </li>
                <li>See a green notification: "Record added successfully!"</li>
                <li>The form resets, ready for another entry.</li>
                <li>
                  If errors occur (e.g., missing fields), a red message appears
                  (e.g., "Please fill in all required fields").
                </li>
              </ul>
            </li>
            <li>
              <strong>Verify the Entry</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Go to the <strong>Records & Reports</strong> page.
                </li>
                <li>
                  Check the Incoming or Outgoing table to see your new entry.
                </li>
                <li>
                  Example: Find your STL in the Incoming table with the correct
                  sender and date.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Tips for Success
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Message Type</strong>: Choose the correct type to ensure
              proper categorization (e.g., LOI for inquiries).
            </li>
            <li>
              <strong>Required Fields</strong>: Fill all fields marked with an
              asterisk (*) to avoid errors.
            </li>
            <li>
              <strong>Attachments</strong>: Upload clear, relevant files (e.g.,
              scanned documents) and keep sizes reasonable.
            </li>
            <li>
              <strong>Accuracy</strong>: Double-check names and dates to
              maintain accurate records.
            </li>
            <li>
              <strong>Multiple Entries</strong>: Add several entries in one
              session; the form resets after each submission.
            </li>
            <li>
              <strong>Errors</strong>: Read red error messages to fix issues
              (e.g., "Invalid email format").
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-indigo-700 mb-3">
            Troubleshooting
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Form Won’t Submit</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check for missing required fields (marked with *).</li>
                <li>Ensure the file format is supported.</li>
                <li>Refresh the page and try again.</li>
              </ul>
            </li>
            <li>
              <strong>Error Message Appears</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>
                  Read the red message for details (e.g., "File too large").
                </li>
                <li>Fix the issue (e.g., choose a smaller file).</li>
                <li>Contact support if persistent.</li>
              </ul>
            </li>
            <li>
              <strong>Entry Not in Reports</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Verify the correct table (Incoming vs. Outgoing).</li>
                <li>
                  Check filters on the Reports page (e.g., set to "All Time").
                </li>
                <li>Wait a moment for the system to update.</li>
              </ul>
            </li>
            <li>
              <strong>File Upload Fails</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Confirm the file is PNG, JPG, PDF, or Word.</li>
                <li>Check your internet connection.</li>
                <li>Try a smaller file size.</li>
              </ul>
            </li>
            <li>
              <strong>Need Help?</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Visit other Help Center sections (e.g., Reports).</li>
                <li>Contact your administrator for technical issues.</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-indigo-700 mt-6 mb-3">
            Example Scenario
          </h3>
          <div className="text-gray-700">
            <strong>Log a New Letter</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Go to <strong>Add Entry</strong>.
              </li>
              <li>
                Select <strong>Letter</strong> from the dropdown.
              </li>
              <li>
                Set Direction to "Incoming," Sender to "Jane Doe," Receiver to
                "John Smith."
              </li>
              <li>Pick today’s date for Date Sent, Channel as "Email."</li>
              <li>Enter Description: "Project Proposal."</li>
              <li>Upload a PDF file named "proposal.pdf."</li>
              <li>
                Click <strong>Add Entry</strong>.
              </li>
              <li>
                Check <strong>Records & Reports</strong> to see the letter in
                the Incoming table.
              </li>
            </ol>
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
            How to Use the Dashboard Page
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Dashboard</strong> page is your central hub, providing
            an overview of your incoming and outgoing communications, analytics,
            and online users. It helps you track messages, view trends, and, for
            admins, monitor other users’ activity. This guide provides
            step-by-step instructions for navigating the Dashboard.
          </p>
          <img
            src={DashboardImage}
            alt="Dashboard"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Step-by-Step Instructions
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Access the Dashboard Page</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Log in to the 5th CRG E-Logbook system.</li>
                <li>
                  From the sidebar, click <strong>Dashboard</strong> (with a
                  dashboard icon).
                </li>
                <li>
                  The Dashboard opens, showing a welcome message with your name
                  (e.g., "Welcome back, John Doe!").
                </li>
                <li>
                  If you’re an admin, a purple <strong>Admin</strong> badge
                  appears next to your name.
                </li>
                <li>
                  The current date and time (e.g., "Sunday, April 13, 2025,
                  14:30:00") display at the top-right, updating every second.
                </li>
              </ul>
            </li>
            <li>
              <strong>Check Incoming and Outgoing Message Counts</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  In the <strong>Analytics</strong> section (top), see two
                  cards:
                </li>
                <li>
                  <strong>Incoming</strong>: Total messages received (e.g.,
                  "10").
                </li>
                <li>
                  <strong>Outgoing</strong>: Total messages sent (e.g., "5").
                </li>
                <li>
                  Counts are shown in blue (Incoming) and green (Outgoing) for
                  quick reference.
                </li>
                <li>Counts depend on the selected timeframe (see Step 3).</li>
              </ul>
            </li>
            <li>
              <strong>Select a Timeframe for Analytics</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Above Analytics, choose: <strong>Daily</strong>,{" "}
                  <strong>Weekly</strong>, or <strong>Monthly</strong>.
                </li>
                <li>
                  <strong>Daily</strong>: Shows today’s messages (hourly).
                </li>
                <li>
                  <strong>Weekly</strong>: Shows past 7 days.
                </li>
                <li>
                  <strong>Monthly</strong>: Shows past 30 days.
                </li>
                <li>Click a button; the active one turns blue.</li>
                <li>
                  Counts, tables, and charts update to match the timeframe.
                </li>
                <li>
                  Example: Select <strong>Daily</strong> for today’s activity.
                </li>
              </ul>
            </li>
            <li>
              <strong>View Top Senders and Receivers</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Below counts, see <strong>Top Senders</strong> (Incoming) and{" "}
                  <strong>Top Receivers</strong> (Outgoing).
                </li>
                <li>Shows top 3 contacts with counts (e.g., "Jane Doe 5").</li>
                <li>Counts in blue (Senders) or green (Receivers) badges.</li>
                <li>If no data, it says "No data available."</li>
                <li>Example: Top Senders: "Jane Doe 5, John Smith 3."</li>
              </ul>
            </li>
            <li>
              <strong>Explore the Message Activity Chart</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Below Top Senders/Receivers, a{" "}
                  <strong>Message Activity</strong> chart shows:
                </li>
                <li>Blue line: Incoming messages over time.</li>
                <li>Green line: Outgoing messages over time.</li>
                <li>
                  <strong>Daily</strong>: Hourly data.
                </li>
                <li>
                  <strong>Weekly/Monthly</strong>: Daily data.
                </li>
                <li>Hover to see counts (e.g., "Received: 2 on 4/13/2025").</li>
                <li>Example: See a spike at 9 AM for 3 incoming messages.</li>
              </ul>
            </li>
            <li>
              <strong>Browse Incoming Messages Table</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  The <strong>Messages Received</strong> table lists incoming
                  messages.
                </li>
                <li>
                  Columns: No, ID, Sender, Type, Description, Timestamp, Staff
                  Name.
                </li>
                <li>
                  Example: Sender "Jane Doe," Type "STL," Timestamp "4/13/2025,
                  2:30 PM."
                </li>
                <li>Hover to highlight rows in blue.</li>
                <li>If empty, it says "No received messages [timeframe]."</li>
                <li>Filtered by timeframe.</li>
              </ul>
            </li>
            <li>
              <strong>Browse Outgoing Messages Table</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  The <strong>Messages Sent</strong> table lists outgoing
                  messages.
                </li>
                <li>
                  Columns: No, ID, Receiver, Type, Description, Timestamp, Staff
                  Name.
                </li>
                <li>Example: Receiver "Bob Wilson," Type "LOI."</li>
                <li>Hover to highlight in green.</li>
                <li>If empty, it says "No sent messages [timeframe]."</li>
              </ul>
            </li>
            <li>
              <strong>View Online Users</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  On the right, the <strong>Online Users</strong> card lists all
                  users.
                </li>
                <li>
                  Details: Name, Status (green dot for online), Last Seen, Role.
                </li>
                <li>Updates in real-time.</li>
                <li>
                  Admins have a purple <strong>Admin</strong> badge.
                </li>
                <li>If empty, it says "No users available."</li>
              </ul>
            </li>
            <li>
              <strong>Admin Features: View Another User’s Data</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Admins only</strong>: In the Online Users card, click
                  a user’s name or <strong>View</strong>.
                </li>
                <li>
                  Dashboard shows that user’s data (Analytics, tables, chart).
                </li>
                <li>
                  A blue <strong>Viewing: [User Name]</strong> badge appears.
                </li>
                <li>Example: View "Jane Doe" to see her messages.</li>
                <li>
                  Click <strong>Back to My Data</strong> to return to your
                  dashboard.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Tips for Success
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Timeframe Selection</strong>: Use <strong>Daily</strong>{" "}
              for recent activity, <strong>Monthly</strong> for trends.
            </li>
            <li>
              <strong>Analytics</strong>: Check counts for a quick summary;
              hover over charts for details.
            </li>
            <li>
              <strong>Tables</strong>: Hover to highlight rows; note Type badges
              (e.g., STL).
            </li>
            <li>
              <strong>Online Users</strong>: Green dots show active users.
            </li>
            <li>
              <strong>Admin Tips</strong>: Use <strong>View</strong> to monitor
              team activity; always return to your data.
            </li>
            <li>
              <strong>Real-Time Updates</strong>: Date/time and Online Users
              update automatically.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            Troubleshooting
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Dashboard Shows "Loading"</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Wait a few seconds.</li>
                <li>Check internet connection.</li>
                <li>Refresh the page.</li>
              </ul>
            </li>
            <li>
              <strong>No Messages in Tables</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>
                  Try a broader timeframe (e.g., <strong>Monthly</strong>).
                </li>
                <li>Add records (see Add Entry guide).</li>
                <li>Admins: Check selected user’s data.</li>
              </ul>
            </li>
            <li>
              <strong>Online Users Empty</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Users may be offline.</li>
                <li>Wait for updates.</li>
              </ul>
            </li>
            <li>
              <strong>Admin Can’t View User Data</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Verify admin status (purple badge).</li>
                <li>Ensure user has messages.</li>
                <li>Contact support.</li>
              </ul>
            </li>
            <li>
              <strong>Chart Looks Empty</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>
                  Switch to <strong>Monthly</strong>.
                </li>
                <li>Add more records.</li>
              </ul>
            </li>
            <li>
              <strong>Need Help?</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check other Help Center sections.</li>
                <li>Contact your administrator.</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-3">
            Example Scenario
          </h3>
          <div className="text-gray-700">
            <strong>Check Today’s Activity (Regular User)</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Go to <strong>Dashboard</strong>.
              </li>
              <li>
                Select <strong>Daily</strong> timeframe.
              </li>
              <li>
                Note <strong>Incoming: 3</strong>, <strong>Outgoing: 2</strong>.
              </li>
              <li>See Top Senders: "Jane Doe 2."</li>
              <li>
                Review <strong>Messages Received</strong>: 3 rows.
              </li>
              <li>
                Check <strong>Online Users</strong>: "Mary Johnson" online.
              </li>
              <li>Hover over chart to see a spike at 10 AM.</li>
            </ol>
            <strong>Monitor Team (Admin)</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Confirm <strong>Admin</strong> badge.
              </li>
              <li>
                Select <strong>Weekly</strong>.
              </li>
              <li>
                In Online Users, click <strong>View</strong> for "Bob Wilson."
              </li>
              <li>
                See <strong>Viewing: Bob Wilson</strong>.
              </li>
              <li>
                Check his <strong>Incoming: 5</strong>.
              </li>
              <li>
                Click <strong>Back to My Data</strong>.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "records",
      title: "Reports",
      icon: <FileText className="w-6 h-6 text-green-600" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            How to Use the Records & Reports Page
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Records & Reports</strong> page allows you to view and
            manage all incoming and outgoing communications, filter them by time
            or type, and export reports for printing. Admins can view records
            for other users or all users combined. This guide provides
            step-by-step instructions for using the page.
          </p>
          <img
            src={RecordsImage}
            alt="Records & Reports"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Step-by-Step Instructions
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Access the Records & Reports Page</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Log in to the 5th CRG E-Logbook system.</li>
                <li>
                  From the sidebar, click <strong>Reports</strong> (with a
                  reports icon).
                </li>
                <li>
                  The page opens with tabs for Incoming and Outgoing messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Choose Incoming or Outgoing Messages</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Incoming</strong> or <strong>Outgoing</strong>
                  tab.
                </li>
                <li>The active tab has a blue underline.</li>
                <li>The table shows the selected message type.</li>
              </ul>
            </li>
            <li>
              <strong>Filter Messages by Time</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Use the time dropdown (left):</li>
                <li>
                  <strong>All Time</strong>: All messages.
                </li>
                <li>
                  <strong>Today</strong>: Today’s messages.
                </li>
                <li>
                  <strong>This Week</strong>: Current week.
                </li>
                <li>
                  <strong>This Month</strong>: Current month.
                </li>
                <li>Select an option; the table updates.</li>
                <li>
                  Example: Choose <strong>Today</strong> for recent messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Filter Messages by Type</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Filter</strong> button (right).
                </li>
                <li>
                  Choose <strong>All Types</strong> or a type (e.g., STL,
                  Letter).
                </li>
                <li>The table shows only selected type.</li>
                <li>
                  Example: Select <strong>Letter</strong> to see civilian
                  letters.
                </li>
              </ul>
            </li>
            <li>
              <strong>View Message Details</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Incoming Table</strong>: From, Type, ID, Subject, Date
                  Sent, Date Received, Channel, Format, Attachment.
                </li>
                <li>
                  <strong>Outgoing Table</strong>: To, Type, ID, Subject, Date
                  Sent, Channel, Format, Attachment.
                </li>
                <li>
                  Attachments: Images show thumbnails; others show "View File"
                  link.
                </li>
                <li>If empty, it says "No [received/sent] messages."</li>
                <li>
                  Example: See a Letter from "Jane Doe" with a PDF attachment.
                </li>
              </ul>
            </li>
            <li>
              <strong>Export (Print) Messages</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Export</strong> (right).
                </li>
                <li>
                  Select <strong>Print Incoming</strong>,{" "}
                  <strong>Print Outgoing</strong>, or{" "}
                  <strong>Print All Users</strong> (admin, All Users mode).
                </li>
                <li>A formatted report opens with logos, title, and table.</li>
                <li>Print dialog appears automatically.</li>
                <li>Example: Print filtered Incoming messages.</li>
              </ul>
            </li>
            <li>
              <strong>Admin Features: Switch View Mode</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Admins only</strong>: Toggle{" "}
                  <strong>Individual</strong> or <strong>All Users</strong>.
                </li>
                <li>
                  <strong>Individual</strong>: View one user’s messages.
                </li>
                <li>
                  <strong>All Users</strong>: See all messages with User and
                  Direction columns.
                </li>
                <li>Active button turns blue.</li>
              </ul>
            </li>
            <li>
              <strong>Admin Features: View Another User’s Messages</strong>
              <ul className="list-disc list-inside ml-6">
                <li>In Individual mode, select a user from the dropdown.</li>
                <li>Tables show that user’s messages.</li>
                <li>
                  Example: Choose "Bob Wilson" to see his Outgoing messages.
                </li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Tips for Success
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Tabs</strong>: Switch between Incoming and Outgoing to
              compare.
            </li>
            <li>
              <strong>Filters</strong>: Combine time and type filters (e.g.,{" "}
              <strong>Today</strong> + <strong>STL</strong>).
            </li>
            <li>
              <strong>Attachments</strong>: Click "View File" for non-images;
              thumbnails show images.
            </li>
            <li>
              <strong>Exporting</strong>: Filter before printing to include only
              relevant data.
            </li>
            <li>
              <strong>Admin Tips</strong>: Use All Users mode for team overview;
              Individual for specific users.
            </li>
            <li>
              <strong>Empty Tables</strong>: Try <strong>All Time</strong> or
              add records.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Troubleshooting
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Page Shows "Loading"</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Wait a few seconds.</li>
                <li>Check internet.</li>
                <li>Refresh the page.</li>
              </ul>
            </li>
            <li>
              <strong>Error Message</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Verify login status.</li>
                <li>Admins: Confirm admin role.</li>
                <li>Contact support.</li>
              </ul>
            </li>
            <li>
              <strong>No Messages</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check filters.</li>
                <li>
                  Switch to <strong>All Time</strong>.
                </li>
                <li>Admins: Verify user selection.</li>
              </ul>
            </li>
            <li>
              <strong>Attachment Links Fail</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check internet.</li>
                <li>Refresh page.</li>
                <li>Contact support.</li>
              </ul>
            </li>
            <li>
              <strong>Admin Can’t See Users</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Verify admin status.</li>
                <li>Refresh or re-login.</li>
              </ul>
            </li>
            <li>
              <strong>Need Help?</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check other sections.</li>
                <li>Contact administrator.</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-green-700 mt-6 mb-3">
            Example Scenario
          </h3>
          <div className="text-gray-700">
            <strong>View Recent Incoming (Regular User)</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Go to <strong>Records & Reports</strong>.
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
              <li>See 3 letters from "Jane Doe."</li>
              <li>
                Click <strong>View File</strong> for a PDF.
              </li>
              <li>
                Export <strong>Print Incoming</strong>.
              </li>
            </ol>
            <strong>Monitor Team (Admin)</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Click <strong>All Users</strong>.
              </li>
              <li>
                Set time to <strong>This Month</strong>.
              </li>
              <li>
                Filter by <strong>STL</strong>.
              </li>
              <li>See all STL messages.</li>
              <li>Switch to Individual, select "Bob Wilson."</li>
              <li>Print his Outgoing report.</li>
            </ol>
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
            How to Use the Actions Page
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>Actions</strong> page allows you to manage incoming and
            outgoing communications by viewing, editing, deleting, or
            downloading files. Admins can manage messages for all users. This
            guide provides step-by-step instructions for handling messages.
          </p>
          <img
            src={ActionsImage}
            alt="Actions"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Step-by-Step Instructions
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Access the Actions Page</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Log in to the 5th CRG E-Logbook system.</li>
                <li>
                  From the sidebar, click <strong>Actions</strong> (with a
                  wrench icon).
                </li>
                <li>
                  The page opens with tabs for Incoming and Outgoing Messages.
                </li>
              </ul>
            </li>
            <li>
              <strong>Check Login Status</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  If not logged in, see "Please log in to access your messages."
                </li>
                <li>Log in to proceed.</li>
              </ul>
            </li>
            <li>
              <strong>Choose Incoming or Outgoing Messages</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Incoming Messages</strong> or{" "}
                  <strong>Outgoing Messages</strong>.
                </li>
                <li>Active tab highlights in blue.</li>
                <li>Table updates to show selected messages.</li>
              </ul>
            </li>
            <li>
              <strong>View Messages in the Table</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Columns: ID, Sender/Receiver, Description, Date, Channel,
                  File, Actions.
                </li>
                <li>
                  <strong>Admin Columns</strong>: Username, User ID.
                </li>
                <li>Files: Image thumbnails or icons with filenames.</li>
                <li>If empty, it says "No messages found."</li>
                <li>Example: See a message from "Jane Doe" with a PDF.</li>
              </ul>
            </li>
            <li>
              <strong>Search for Messages</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Use the search bar (top-right).</li>
                <li>Type keywords (e.g., "Jane," "JS0001").</li>
                <li>
                  Table filters by sender, receiver, description, ID, or
                  username/ID (admins).
                </li>
                <li>Clear search to show all messages.</li>
              </ul>
            </li>
            <li>
              <strong>Admin Feature: Filter by User</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Admins only</strong>: Select a user from the dropdown
                  (top-right).
                </li>
                <li>
                  Choose a name or <strong>All Users</strong>.
                </li>
                <li>Table shows only that user’s messages.</li>
                <li>Example: Select "Bob Wilson" for his messages.</li>
              </ul>
            </li>
            <li>
              <strong>Edit a Message</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  In Actions, click <strong>Edit</strong>.
                </li>
                <li>
                  Form shows: ID, Sender/Receiver, Description, Date, Channel,
                  File, Username/User ID (admins).
                </li>
                <li>Edit fields or upload a new file (replaces old).</li>
                <li>
                  Click <strong>Save Changes</strong> or <strong>Cancel</strong>
                  .
                </li>
                <li>Success shows "Message updated successfully!"</li>
                <li>Example: Update description to "Team Notes."</li>
              </ul>
            </li>
            <li>
              <strong>Delete a Message</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Delete</strong> in Actions.
                </li>
                <li>
                  Confirm: "Are you sure you want to delete this message?"
                </li>
                <li>
                  Click <strong>OK</strong> to delete.
                </li>
                <li>Success shows "Message deleted successfully!"</li>
              </ul>
            </li>
            <li>
              <strong>Download a File</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Download</strong> in Actions (if file exists).
                </li>
                <li>File opens or downloads.</li>
                <li>If no file, it says "No file available."</li>
                <li>Example: Download "report.pdf."</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Tips for Success
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Tabs</strong>: Switch to manage Incoming or Outgoing.
            </li>
            <li>
              <strong>Search</strong>: Use specific keywords for quick results.
            </li>
            <li>
              <strong>Editing</strong>: Check changes before saving; supported
              files only.
            </li>
            <li>
              <strong>Deleting</strong>: Confirm deletions carefully.
            </li>
            <li>
              <strong>Downloading</strong>: Ensure browser allows downloads.
            </li>
            <li>
              <strong>Admin Tips</strong>: Use user dropdown to monitor team;
              edit/delete cautiously.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-purple-700 mb-3">
            Troubleshooting
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Page Shows "Loading"</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Wait a few seconds.</li>
                <li>Check internet.</li>
                <li>Refresh page.</li>
              </ul>
            </li>
            <li>
              <strong>"Please log in"</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Log in.</li>
                <li>Try re-logging.</li>
              </ul>
            </li>
            <li>
              <strong>No Messages</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Switch tabs.</li>
                <li>Clear search or user filter.</li>
                <li>Add records (see Add Entry).</li>
              </ul>
            </li>
            <li>
              <strong>Error Message</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check login or admin status.</li>
                <li>Refresh page.</li>
                <li>Contact support.</li>
              </ul>
            </li>
            <li>
              <strong>Actions Fail</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check error (e.g., "Permission denied").</li>
                <li>Verify access.</li>
              </ul>
            </li>
            <li>
              <strong>Need Help?</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check other sections.</li>
                <li>Contact administrator.</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-purple-700 mt-6 mb-3">
            Example Scenario
          </h3>
          <div className="text-gray-700">
            <strong>Manage Incoming (Regular User)</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Go to <strong>Actions</strong>.
              </li>
              <li>
                Click <strong>Incoming Messages</strong>.
              </li>
              <li>Search "Jane" for her messages.</li>
              <li>Edit "JS0001," update description, save.</li>
              <li>Download "JS0002" PDF.</li>
              <li>Delete "JS0001," confirm.</li>
            </ol>
            <strong>Monitor Team (Admin)</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Go to <strong>Actions</strong>.
              </li>
              <li>
                Select <strong>Outgoing Messages</strong>.
              </li>
              <li>Choose "Bob Wilson" from dropdown.</li>
              <li>Search "report."</li>
              <li>Edit a message’s channel to "Email."</li>
              <li>Delete an outdated message.</li>
            </ol>
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
            How to Use the User Management Page
          </h2>
          <p className="text-gray-700 mb-4">
            The <strong>User Management</strong> page allows admins to manage
            user accounts, including adding, editing, viewing, and deleting
            accounts. Access requires a passcode. This guide provides
            step-by-step instructions for admins.
          </p>
          <img
            src={UserManagementImage}
            alt="User Management"
            className="rounded-lg shadow-lg mb-6 max-w-full h-auto"
          />
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Prerequisites
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              You must have an <strong>admin role</strong>.
            </li>
            <li>
              You need the correct <strong>4-digit passcode</strong> (contact
              your administrator).
            </li>
            <li>Log in with your admin account.</li>
          </ul>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Step-by-Step Instructions
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Access the User Management Page</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Log in to the 5th CRG E-Logbook system.</li>
                <li>
                  From the sidebar, click <strong>User Management</strong> (with
                  a users icon).
                </li>
                <li>A passcode modal appears if you’re an admin.</li>
              </ul>
            </li>
            <li>
              <strong>Enter the Passcode</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Enter the 4-digit passcode in the modal.</li>
                <li>
                  Click <strong>Submit</strong>.
                </li>
                <li>Correct passcode: Page loads.</li>
                <li>Incorrect: Error shows with remaining attempts (5 max).</li>
                <li>After 5 wrong attempts, redirected to home page.</li>
                <li>
                  Click <strong>Exit</strong> to go to Dashboard.
                </li>
              </ul>
            </li>
            <li>
              <strong>View the User Accounts Table</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Table shows: Name, Email, Role, Department, Actions.</li>
                <li>Roles: "admin" (red badge), "user" (green).</li>
                <li>
                  Actions: <strong>View</strong>, <strong>Edit</strong>,{" "}
                  <strong>Delete</strong>.
                </li>
                <li>Hover to highlight rows.</li>
                <li>If empty, it says "No users found."</li>
              </ul>
            </li>
            <li>
              <strong>Add a New User</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Add New User</strong> (blue button).
                </li>
                <li>
                  Form shows: Email, Password, Full Name, Role, Department,
                  Phone Number.
                </li>
                <li>Fill required fields (Email, Password, Name, Role).</li>
                <li>
                  Click <strong>Add User</strong> or <strong>Cancel</strong>.
                </li>
                <li>Success: Green notification; table updates.</li>
                <li>Example: Add "alice@example.com," role "user."</li>
              </ul>
            </li>
            <li>
              <strong>View User Details</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>View</strong> (eye icon) in Actions.
                </li>
                <li>
                  Read-only form shows: Email, Password (hidden), Name, Role,
                  Department, Phone.
                </li>
                <li>
                  Close with <strong>X</strong>.
                </li>
                <li>Example: View Jane Doe’s role.</li>
              </ul>
            </li>
            <li>
              <strong>Edit a User</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Edit</strong> (pencil icon).
                </li>
                <li>Edit form shows same fields as Add.</li>
                <li>Modify fields; leave Password blank to keep current.</li>
                <li>
                  Click <strong>Update User</strong> or <strong>Cancel</strong>.
                </li>
                <li>Success: Green notification.</li>
                <li>Example: Change Bob’s role to "admin."</li>
              </ul>
            </li>
            <li>
              <strong>Delete a User</strong>
              <ul className="list-disc list-inside ml-6">
                <li>
                  Click <strong>Delete</strong> (trash icon).
                </li>
                <li>Confirm: "Are you sure you want to delete [user]?"</li>
                <li>
                  Click <strong>OK</strong>.
                </li>
                <li>Success: Green notification; table updates.</li>
              </ul>
            </li>
            <li>
              <strong>Handle Notifications</strong>
              <ul className="list-disc list-inside ml-6">
                <li>Green: Success (e.g., "User added successfully").</li>
                <li>Red: Error (e.g., "Email already in use").</li>
                <li>Disappear after 5 seconds.</li>
              </ul>
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Tips for Success
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Passcode</strong>: Keep it secure; contact admin if locked
              out.
            </li>
            <li>
              <strong>Adding Users</strong>: Use unique emails; set strong
              passwords.
            </li>
            <li>
              <strong>Editing</strong>: Leave password blank to avoid resets.
            </li>
            <li>
              <strong>Deleting</strong>: Confirm carefully; deletions are
              permanent.
            </li>
            <li>
              <strong>Viewing</strong>: Use View mode to check details safely.
            </li>
            <li>
              <strong>Notifications</strong>: Read errors to fix issues.
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-red-700 mb-3">
            Troubleshooting
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Passcode Modal Stuck</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check passcode.</li>
                <li>Contact admin if locked.</li>
              </ul>
            </li>
            <li>
              <strong>Access Denied</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Verify admin role.</li>
                <li>Re-login.</li>
                <li>Contact support.</li>
              </ul>
            </li>
            <li>
              <strong>Page Shows "Loading"</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Wait a few seconds.</li>
                <li>Check internet.</li>
                <li>Refresh.</li>
              </ul>
            </li>
            <li>
              <strong>No Users</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Add users.</li>
                <li>Refresh page.</li>
                <li>Contact support.</li>
              </ul>
            </li>
            <li>
              <strong>Error Adding/Editing</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check notification (e.g., "Email in use").</li>
                <li>Fill required fields.</li>
              </ul>
            </li>
            <li>
              <strong>Need Help?</strong>:
              <ul className="list-disc list-inside ml-6">
                <li>Check other sections.</li>
                <li>Contact administrator.</li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-red-700 mt-6 mb-3">
            Example Scenario
          </h3>
          <div className="text-gray-700">
            <strong>Add a User</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Go to <strong>User Management</strong>.
              </li>
              <li>Enter passcode.</li>
              <li>
                Click <strong>Add New User</strong>.
              </li>
              <li>
                Enter: Email "alice@example.com," Password "secure123," Name
                "Alice Brown," Role "user," Department "Communications."
              </li>
              <li>
                Click <strong>Add User</strong>.
              </li>
              <li>See green notification; verify Alice in table.</li>
            </ol>
            <strong>Edit/Delete</strong>:
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>Find "Bob Wilson."</li>
              <li>
                Click <strong>View</strong> to check role.
              </li>
              <li>
                Click <strong>Edit</strong>, update department, save.
              </li>
              <li>
                Click <strong>Delete</strong>, confirm.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
  ];

  // Enhanced getTextContent to handle all JSX content
  const getTextContent = (element) => {
    if (typeof element === "string") return element;
    if (typeof element === "number") return element.toString();
    if (Array.isArray(element)) return element.map(getTextContent).join(" ");
    if (element?.props?.children) return getTextContent(element.props.children);
    return "";
  };

  // Filter tutorials based on search term
  const filteredTutorials = tutorials.filter((tutorial) => {
    const contentText = getTextContent(tutorial.content).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      tutorial.title.toLowerCase().includes(searchLower) ||
      contentText.includes(searchLower)
    );
  });

  // Auto-select first matching tab when search term changes
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">
            <HelpCircle className="inline-block mr-3 mb-1" />
            5th CRG E-Logbook Help Center
          </h1>
        </div>

        {/* Search Bar with Clear Button */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search for help on adding entries, reports, or user management"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
            filteredTutorials.find((t) => t.id === activeSection)?.content || (
              <div className="text-center text-gray-500">
                <p>
                  No tutorial selected. Click a tab above to view help content.
                </p>
              </div>
            )
          ) : (
            <div className="text-center text-gray-500">
              <p>
                No tutorials match your search. Try keywords like 'add entry,'
                'reports,' or 'user management.'
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
