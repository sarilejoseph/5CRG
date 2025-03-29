import React, { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import crs from "../Assets/crs.png";
import crg from "../Assets/logo.png";

const database = getDatabase(app);
const auth = getAuth(app);

const MessageHistoryPage = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [filteredReceivedMessages, setFilteredReceivedMessages] = useState([]);
  const [filteredSentMessages, setFilteredSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("received");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [viewMode, setViewMode] = useState("individual");
  const [allUsersData, setAllUsersData] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkUserRole(user.uid);
      } else {
        setUser(null);
        setIsAdmin(false);
        setSelectedUser(null);
        setReceivedMessages([]);
        setSentMessages([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeFilter, typeFilter, receivedMessages, sentMessages, activeTab]);

  const checkUserRole = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const hasAdminAccess =
          userData.role === "admin" || userData.role === "manager";
        setIsAdmin(hasAdminAccess);

        if (hasAdminAccess) {
          fetchAllUsers(uid);
        } else {
          fetchMessages(uid);
        }
      } else {
        fetchMessages(uid);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      fetchMessages(uid);
    }
  };

  const fetchAllUsers = (currentUserId) => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.entries(data).map(([uid, userData]) => ({
          uid,
          name: userData.name || userData.email || uid,
          email: userData.email,
        }));
        setAllUsers(usersList);
        setSelectedUser(currentUserId);
        fetchMessages(currentUserId);
      } else {
        fetchMessages(currentUserId);
      }
    });
  };

  const handleUserChange = (e) => {
    const selectedUid = e.target.value;
    setSelectedUser(selectedUid);
    fetchMessages(selectedUid);
  };

  const fetchAllUsersData = () => {
    setLoading(true);

    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (!usersData) {
        setAllUsersData([]);
        setLoading(false);
        return;
      }

      const combinedData = [];
      let processedUsers = 0;
      const totalUsers = Object.keys(usersData).length;

      Object.entries(usersData).forEach(([uid, userData]) => {
        // Process received messages
        const receivedRef = ref(database, `users/${uid}/receivedMessages`);
        get(receivedRef)
          .then((receivedSnapshot) => {
            const receivedData = receivedSnapshot.val();

            if (receivedData) {
              Object.entries(receivedData).forEach(([msgId, msgData]) => {
                combinedData.push({
                  id: msgId,
                  userId: uid,
                  userName: userData.name || userData.email || uid,
                  userEmail: userData.email,
                  messageType: "received",
                  sender: msgData.sender,
                  receiver: uid,
                  type: msgData.type,
                  description: msgData.description,
                  timestamp: msgData.timestamp,
                  staffName: msgData.staffName,
                });
              });
            }

            // Process sent messages
            const sentRef = ref(database, `users/${uid}/sentMessages`);
            get(sentRef)
              .then((sentSnapshot) => {
                const sentData = sentSnapshot.val();

                if (sentData) {
                  Object.entries(sentData).forEach(([msgId, msgData]) => {
                    combinedData.push({
                      id: msgId,
                      userId: uid,
                      userName: userData.name || userData.email || uid,
                      userEmail: userData.email,
                      messageType: "sent",
                      sender: uid,
                      receiver: msgData.receiver,
                      type: msgData.type,
                      description: msgData.description,
                      timestamp: msgData.timestamp,
                      staffName: msgData.staffName,
                    });
                  });
                }

                processedUsers++;

                // When all users are processed, sort by timestamp and update state
                if (processedUsers === totalUsers) {
                  combinedData.sort((a, b) => b.timestamp - a.timestamp);

                  const types = [
                    ...new Set(combinedData.map((msg) => msg.type)),
                  ];
                  setUniqueTypes(types);

                  setAllUsersData(combinedData);
                  setLoading(false);
                }
              })
              .catch((error) => {
                console.error("Error fetching sent messages:", error);
                processedUsers++;
                if (processedUsers === totalUsers) {
                  setLoading(false);
                }
              });
          })
          .catch((error) => {
            console.error("Error fetching received messages:", error);
            processedUsers++;
            if (processedUsers === totalUsers) {
              setLoading(false);
            }
          });
      });
    });
  };

  const fetchMessages = (userId) => {
    setLoading(true);

    const receivedRef = ref(database, `users/${userId}/receivedMessages`);
    onValue(receivedRef, (snapshot) => {
      const data = snapshot.val();
      let receivedMessageArray = [];

      if (data) {
        receivedMessageArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          sender: value.sender,
          type: value.type,
          description: value.description,
          timestamp: value.timestamp,
          staffName: value.staffName,
        }));

        setReceivedMessages(receivedMessageArray);
        setFilteredReceivedMessages(receivedMessageArray);
      } else {
        setReceivedMessages([]);
        setFilteredReceivedMessages([]);
      }

      const sentRef = ref(database, `users/${userId}/sentMessages`);
      onValue(sentRef, (snapshot) => {
        const data = snapshot.val();
        let sentMessageArray = [];

        if (data) {
          sentMessageArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            receiver: value.receiver,
            type: value.type,
            description: value.description,
            timestamp: value.timestamp,
            staffName: value.staffName,
          }));

          setSentMessages(sentMessageArray);
          setFilteredSentMessages(sentMessageArray);
        } else {
          setSentMessages([]);
          setFilteredSentMessages([]);
        }

        const allMessages = [...receivedMessageArray, ...sentMessageArray];
        const types = [...new Set(allMessages.map((msg) => msg.type))];
        setUniqueTypes(types);
        setLoading(false);
      });
    });
  };

  const filterAllUsersData = () => {
    let filtered = [...allUsersData];

    if (timeFilter !== "all") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      if (timeFilter === "today") {
        filtered = filtered.filter(
          (message) =>
            new Date(message.timestamp).toDateString() === today.toDateString()
        );
      } else if (timeFilter === "week") {
        filtered = filtered.filter(
          (message) =>
            new Date(message.timestamp) >= startOfWeek &&
            new Date(message.timestamp) <= today
        );
      } else if (timeFilter === "month") {
        filtered = filtered.filter(
          (message) =>
            new Date(message.timestamp) >= startOfMonth &&
            new Date(message.timestamp) <= today
        );
      }
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((message) => message.type === typeFilter);
    }

    if (activeTab === "received") {
      filtered = filtered.filter(
        (message) => message.messageType === "received"
      );
    } else if (activeTab === "sent") {
      filtered = filtered.filter((message) => message.messageType === "sent");
    }

    return filtered;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const applyFilters = () => {
    let filteredReceived = [...receivedMessages];
    let filteredSent = [...sentMessages];

    if (timeFilter !== "all") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      if (timeFilter === "today") {
        filteredReceived = filteredReceived.filter(
          (message) =>
            new Date(message.timestamp).toDateString() === today.toDateString()
        );
        filteredSent = filteredSent.filter(
          (message) =>
            new Date(message.timestamp).toDateString() === today.toDateString()
        );
      } else if (timeFilter === "week") {
        filteredReceived = filteredReceived.filter(
          (message) =>
            new Date(message.timestamp) >= startOfWeek &&
            new Date(message.timestamp) <= today
        );
        filteredSent = filteredSent.filter(
          (message) =>
            new Date(message.timestamp) >= startOfWeek &&
            new Date(message.timestamp) <= today
        );
      } else if (timeFilter === "month") {
        filteredReceived = filteredReceived.filter(
          (message) =>
            new Date(message.timestamp) >= startOfMonth &&
            new Date(message.timestamp) <= today
        );
        filteredSent = filteredSent.filter(
          (message) =>
            new Date(message.timestamp) >= startOfMonth &&
            new Date(message.timestamp) <= today
        );
      }
    }

    if (typeFilter !== "all") {
      filteredReceived = filteredReceived.filter(
        (message) => message.type === typeFilter
      );
      filteredSent = filteredSent.filter(
        (message) => message.type === typeFilter
      );
    }

    setFilteredReceivedMessages(filteredReceived);
    setFilteredSentMessages(filteredSent);
  };

  const handlePrint = (section) => {
    const printContent = document.getElementById(section);
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Message History Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              line-height: 1.6;
              margin: 30px;
            }
            .official-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 15px;
              position: relative;
            }
            .vision-text {
              color:rgb(171, 172, 173);
              font-size: 14px;
              margin-bottom: 5px;
            }
            .main-title {
              font-size: 22px;
              font-weight: 700;
              color:rgb(0, 0, 0);
              margin: 10px 0;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 18px;
              font-weight: 600;
              color:rgb(0, 0, 0);
              margin: 5px 0;
            }
            .address-text {
              font-size: 14px;
              color: #6c757d;
              margin: 5px 0;
            }
            .contact-text {
              font-size: 12px;
              color: #6c757d;
            }
            .logo-left {
              position: absolute;
              left: 0;
              top: 20px;
              width: 60px;
              height: 60px;
            }
            .logo-right {
              position: absolute;
              right: 0;
              top: 20px;
              width: 60px;
              height: 60px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            th, td { 
              border: none;
              padding: 12px 16px;
              text-align: left;
            }
            th { 
              background-color: #3b82f6;
              color: white;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.5px;
            }
            td {
              border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .content-header { 
              margin-bottom: 20px;
            }
            h1 { 
              color: #1e40af;
              font-weight: 700;
              margin-bottom: 10px;
            }
            p {
              color: #64748b;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="official-header">
          <img src="${crs}" alt="AFP Logo" class="logo-left">
            <div class="vision-text">AFP Vision 2028: A World-Class Armed Forces, Source of National Pride</div>
            <div class="main-title">HEADQUARTERS</div>
            <div class="subtitle">5<sup>th</sup> CIVIL RELATIONS GROUP</div>
            <div class="subtitle">CIVIL RELATIONS SERVICE AFP</div>
            <div class="address-text">Naval Station Felix Apolinario, Panacan, Davao City</div>
            <div class="contact-text">crscrs@gmail.com LAN: 8888 Cel No: 0917-153-7433</div>
            <img src="${crg}" alt="Civil Relations Service Logo" class="logo-right">
          </div>
          
          <div class="content-header">
            <h1>${
              section === "receivedMessagesTable"
                ? "Received Messages History"
                : section === "sentMessagesTable"
                ? "Sent Messages History"
                : "All Users Messages History"
            }</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            ${viewMode === "all" ? "<p>Aggregated data for all users</p>" : ""}
          </div>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    setShowPrintDropdown(false);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === "all") {
      fetchAllUsersData();
    } else {
      fetchMessages(selectedUser);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Records & Reports
          </h1>
          <div className="h-1 w-24 bg-indigo-600 rounded"></div>
        </div>

        {isAdmin && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              View Settings
            </h2>

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">
                  View Mode
                </p>
                <div className="inline-flex rounded-lg shadow-sm">
                  <button
                    className={`px-5 py-2.5 text-sm font-medium rounded-l-lg border-r transition duration-150 ${
                      viewMode === "individual"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-indigo-50"
                    }`}
                    onClick={() => toggleViewMode("individual")}
                  >
                    Individual User
                  </button>
                  <button
                    className={`px-5 py-2.5 text-sm font-medium rounded-r-lg transition duration-150 ${
                      viewMode === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-indigo-50"
                    }`}
                    onClick={() => toggleViewMode("all")}
                  >
                    All Users
                  </button>
                </div>
              </div>

              {viewMode === "individual" && allUsers.length > 0 && (
                <div className="flex-grow">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Select User
                  </p>
                  <div className="relative">
                    <select
                      value={selectedUser || ""}
                      onChange={handleUserChange}
                      className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm transition-colors"
                    >
                      {allUsers.map((userData) => (
                        <option key={userData.uid} value={userData.uid}>
                          {userData.name} ({userData.email})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 pt-6">
            <div className="border-b border-gray-100">
              <nav className="-mb-px flex space-x-6">
                <button
                  className={`pb-4 font-medium text-sm transition-colors duration-200 ${
                    activeTab === "received"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-indigo-500"
                  }`}
                  onClick={() => setActiveTab("received")}
                >
                  Incoming Messages
                </button>
                <button
                  className={`pb-4 font-medium text-sm transition-colors duration-200 ${
                    activeTab === "sent"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-indigo-500"
                  }`}
                  onClick={() => setActiveTab("sent")}
                >
                  Outgoing Messages
                </button>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
              <div className="relative">
                <div className="relative">
                  <select
                    className="pl-4 pr-12 py-2.5 border border-gray-200 text-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm transition-colors"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Filter</span>
                    {typeFilter !== "all" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
                        1
                      </span>
                    )}
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-100 overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700">
                          Filter by Type
                        </h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <button
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${
                            typeFilter === "all"
                              ? "text-indigo-600 font-medium bg-indigo-50"
                              : "text-gray-700"
                          }`}
                          onClick={() => {
                            setTypeFilter("all");
                            setShowFilterDropdown(false);
                          }}
                        >
                          All Types
                        </button>
                        {uniqueTypes.map((type) => (
                          <button
                            key={type}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${
                              typeFilter === type
                                ? "text-indigo-600 font-medium bg-indigo-50"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              setTypeFilter(type);
                              setShowFilterDropdown(false);
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowPrintDropdown(!showPrintDropdown)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Export</span>
                  </button>

                  {showPrintDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-100 overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700">
                          Export Options
                        </h3>
                      </div>
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                          onClick={() =>
                            handlePrint(
                              viewMode === "all"
                                ? "allUsersMessagesTable"
                                : activeTab === "received"
                                ? "receivedMessagesTable"
                                : "sentMessagesTable"
                            )
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                          </svg>
                          Print{" "}
                          {viewMode === "all"
                            ? "All Users"
                            : activeTab === "received"
                            ? "Received"
                            : "Sent"}{" "}
                          Messages
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-200 opacity-40"></div>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              {/* Individual user view */}
              {viewMode === "individual" && (
                <>
                  <div
                    className={activeTab === "received" ? "block" : "hidden"}
                    id="receivedMessagesTable"
                    ref={printRef}
                  >
                    <div className="w-full">
                      <h2 className="sr-only">Received Messages</h2>
                      {filteredReceivedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-4 font-medium">
                            No received messages found
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Try changing your filters or time period
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  From
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  Message
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredReceivedMessages.map((message) => (
                                <tr
                                  key={message.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {message.staffName || "System"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                                      {message.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500 max-w-md">
                                    {message.description}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTimestamp(message.timestamp)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={activeTab === "sent" ? "block" : "hidden"}
                    id="sentMessagesTable"
                  >
                    <div className="w-full">
                      <h2 className="sr-only">Sent Messages</h2>
                      {filteredSentMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                            />
                          </svg>
                          <p className="mt-4 font-medium">
                            No sent messages found
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Try changing your filters or time period
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  To
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  Message
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {filteredSentMessages.map((message) => (
                                <tr
                                  key={message.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {message.receiver}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                                      {message.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-500 max-w-md">
                                    {message.description}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTimestamp(message.timestamp)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* All users view */}
              {viewMode === "all" && (
                <div id="allUsersMessagesTable">
                  <div className="w-full">
                    <h2 className="sr-only">All Users Messages</h2>
                    {allUsersData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="mt-4 font-medium">No messages found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try changing your filters or time period
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                User
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                Direction
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                {activeTab === "received" ? "From" : "To"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                Message
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {filterAllUsersData().map((message) => (
                              <tr
                                key={message.id + message.userId}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                  {message.userName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                                      message.messageType === "received"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {message.messageType === "received"
                                      ? "Received"
                                      : "Sent"}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {message.messageType === "received"
                                    ? message.staffName || "System"
                                    : message.receiver}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-purple-100 text-purple-800">
                                    {message.type}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-500 max-w-md">
                                  {message.description}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatTimestamp(message.timestamp)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageHistoryPage;
