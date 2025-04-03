import React, { useState, useEffect } from "react";
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        checkUserRole(user.uid);
      } else {
        setIsAdmin(false);
        setSelectedUser(null);
        setReceivedMessages([]);
        setSentMessages([]);
        setLoading(false);
        setError(null);
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
      if (!snapshot.exists()) {
        setError("User data not found.");
        setIsAdmin(false);
        fetchMessages(uid);
        return;
      }
      const userData = snapshot.val();
      const hasAdminAccess =
        userData?.role === "admin" || userData?.role === "manager";
      setIsAdmin(hasAdminAccess);
      if (hasAdminAccess) {
        fetchAllUsers(uid);
      } else {
        fetchMessages(uid);
      }
    } catch (err) {
      console.error("Error checking user role:", err);
      setError("Permission denied or error fetching user role.");
      setIsAdmin(false);
      fetchMessages(uid);
    }
  };

  const fetchAllUsers = (currentUserId) => {
    const usersRef = ref(database, "users");
    onValue(
      usersRef,
      (snapshot) => {
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
          setAllUsers([]);
          setError("No users found.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching all users:", err);
        setError("Permission denied fetching all users.");
        setLoading(false);
      }
    );
  };

  const fetchMessages = (userId) => {
    setLoading(true);
    setError(null);
    const receivedRef = ref(database, `users/${userId}/receivedMessages`);
    onValue(
      receivedRef,
      (snapshot) => {
        const data = snapshot.val();
        const received = data
          ? Object.entries(data).map(([key, value]) => {
              let subject = "-";
              switch (value.type) {
                case "STL":
                case "Letter":
                  subject = value.description || "-";
                  break;
                case "Conference Notice":
                  subject = value.agenda || "-";
                  break;
                case "LOI":
                  subject = value.title || "-";
                  break;
                case "RAD":
                  subject = value.cite || "-";
                  break;
                default:
                  subject = value.subject || "-";
              }
              return {
                id: key,
                ...value,
                communicationType:
                  value.communicationType || value.type || "Unknown",
                documentId: value.documentId || value.id || "-",
                dateSent: value.dateSent || value.timestamp || Date.now(),
                sender: value.sender || value.staffName || "Unknown",
                receiver: value.receiver || "-",
                subject,
                dateReceived:
                  value.dateReceived || value.timestamp || Date.now(),
                channel: value.channel || "Unknown",
                fileFormat: value.fileFormat || "Unknown",
                hasAttachment: value.hasAttachment || false,
                fileUrl: value.fileUrl,
              };
            })
          : [];
        setReceivedMessages(received);
        setFilteredReceivedMessages(received);

        const sentRef = ref(database, `users/${userId}/sentMessages`);
        onValue(
          sentRef,
          (snapshot) => {
            const data = snapshot.val();
            const sent = data
              ? Object.entries(data).map(([key, value]) => {
                  let subject = "-";
                  switch (value.type) {
                    case "STL":
                    case "Letter":
                      subject = value.description || "-";
                      break;
                    case "Conference Notice":
                      subject = value.agenda || "-";
                      break;
                    case "LOI":
                      subject = value.title || "-";
                      break;
                    case "RAD":
                      subject = value.cite || "-";
                      break;
                    default:
                      subject = value.subject || "-";
                  }
                  return {
                    id: key,
                    ...value,
                    communicationType:
                      value.communicationType || value.type || "Unknown",
                    documentId: value.documentId || value.id || "-",
                    dateSent: value.dateSent || value.timestamp || Date.now(),
                    sender: value.sender || "Self",
                    receiver: value.receiver || "-",
                    subject,
                    dateReceived: value.dateReceived || null,
                    channel: value.channel || "Unknown",
                    fileFormat: value.fileFormat || "Unknown",
                    hasAttachment: value.hasAttachment || false,
                    fileUrl: value.fileUrl,
                  };
                })
              : [];
            setSentMessages(sent);
            setFilteredSentMessages(sent);

            setUniqueTypes([
              ...new Set(
                [...received, ...sent].map((msg) => msg.communicationType)
              ),
            ]);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching sent messages:", err);
            setError("Permission denied fetching sent messages.");
            setLoading(false);
          }
        );
      },
      (err) => {
        console.error("Error fetching received messages:", err);
        setError("Permission denied fetching received messages.");
        setLoading(false);
      }
    );
  };

  const fetchAllUsersData = () => {
    setLoading(true);
    setError(null);
    const usersRef = ref(database, "users");
    onValue(
      usersRef,
      (snapshot) => {
        const usersData = snapshot.val();
        if (!usersData) {
          setAllUsersData([]);
          setLoading(false);
          return;
        }
        const combinedData = [];
        Promise.all(
          Object.entries(usersData).map(([uid, userData]) =>
            Promise.all([
              get(ref(database, `users/${uid}/receivedMessages`)).then((snap) =>
                snap.val()
                  ? Object.entries(snap.val()).map(([msgId, msgData]) => {
                      let subject = "-";
                      switch (msgData.type) {
                        case "STL":
                        case "Letter":
                          subject = msgData.description || "-";
                          break;
                        case "Conference Notice":
                          subject = msgData.agenda || "-";
                          break;
                        case "LOI":
                          subject = msgData.title || "-";
                          break;
                        case "RAD":
                          subject = msgData.cite || "-";
                          break;
                        default:
                          subject = msgData.subject || "-";
                      }
                      return {
                        id: msgId,
                        userId: uid,
                        userName: userData.name || userData.email || uid,
                        messageType: "received",
                        ...msgData,
                        communicationType:
                          msgData.communicationType ||
                          msgData.type ||
                          "Unknown",
                        documentId: msgData.documentId || msgData.id || "-",
                        dateSent:
                          msgData.dateSent || msgData.timestamp || Date.now(),
                        sender:
                          msgData.sender || msgData.staffName || "Unknown",
                        receiver: msgData.receiver || "-",
                        subject,
                        dateReceived:
                          msgData.dateReceived ||
                          msgData.timestamp ||
                          Date.now(),
                        channel: msgData.channel || "Unknown",
                        fileFormat: msgData.fileFormat || "Unknown",
                        hasAttachment: msgData.hasAttachment || false,
                        fileUrl: msgData.fileUrl,
                      };
                    })
                  : []
              ),
              get(ref(database, `users/${uid}/sentMessages`)).then((snap) =>
                snap.val()
                  ? Object.entries(snap.val()).map(([msgId, msgData]) => {
                      let subject = "-";
                      switch (msgData.type) {
                        case "STL":
                        case "Letter":
                          subject = msgData.description || "-";
                          break;
                        case "Conference Notice":
                          subject = msgData.agenda || "-";
                          break;
                        case "LOI":
                          subject = msgData.title || "-";
                          break;
                        case "RAD":
                          subject = msgData.cite || "-";
                          break;
                        default:
                          subject = msgData.subject || "-";
                      }
                      return {
                        id: msgId,
                        userId: uid,
                        userName: userData.name || userData.email || uid,
                        messageType: "sent",
                        ...msgData,
                        communicationType:
                          msgData.communicationType ||
                          msgData.type ||
                          "Unknown",
                        documentId: msgData.documentId || msgData.id || "-",
                        dateSent:
                          msgData.dateSent || msgData.timestamp || Date.now(),
                        sender: msgData.sender || "Self",
                        receiver: msgData.receiver || "-",
                        subject,
                        dateReceived: msgData.dateReceived || null,
                        channel: msgData.channel || "Unknown",
                        fileFormat: msgData.fileFormat || "Unknown",
                        hasAttachment: msgData.hasAttachment || false,
                        fileUrl: msgData.fileUrl,
                      };
                    })
                  : []
              ),
            ]).then(([received, sent]) =>
              combinedData.push(...received, ...sent)
            )
          )
        ).then(() => {
          combinedData.sort((a, b) => b.timestamp - a.timestamp);
          setUniqueTypes([
            ...new Set(combinedData.map((msg) => msg.communicationType)),
          ]);
          setAllUsersData(combinedData);
          setLoading(false);
        });
      },
      (err) => {
        console.error("Error fetching all users data:", err);
        setError("Permission denied fetching all users data.");
        setLoading(false);
      }
    );
  };

  const applyFilters = () => {
    let filteredReceived = [...receivedMessages];
    let filteredSent = [...sentMessages];

    if (timeFilter !== "all") {
      const today = new Date();
      const filters = {
        today: (d) =>
          new Date(d.timestamp).toDateString() === today.toDateString(),
        week: (d) =>
          new Date(d.timestamp) >=
          new Date(today.setDate(today.getDate() - today.getDay())),
        month: (d) =>
          new Date(d.timestamp) >=
          new Date(today.getFullYear(), today.getMonth(), 1),
      };
      filteredReceived = filteredReceived.filter(filters[timeFilter]);
      filteredSent = filteredSent.filter(filters[timeFilter]);
    }

    if (typeFilter !== "all") {
      filteredReceived = filteredReceived.filter((m) => m.type === typeFilter);
      filteredSent = filteredSent.filter((m) => m.type === typeFilter);
    }

    setFilteredReceivedMessages(filteredReceived);
    setFilteredSentMessages(filteredSent);
  };

  const filterAllUsersData = () => {
    let filtered = [...allUsersData];
    if (timeFilter !== "all") {
      const today = new Date();
      const filters = {
        today: (m) =>
          new Date(m.timestamp).toDateString() === today.toDateString(),
        week: (m) =>
          new Date(m.timestamp) >=
          new Date(today.setDate(today.getDate() - today.getDay())),
        month: (m) =>
          new Date(m.timestamp) >=
          new Date(today.getFullYear(), today.getMonth(), 1),
      };
      filtered = filtered.filter(filters[timeFilter]);
    }
    if (typeFilter !== "all")
      filtered = filtered.filter((m) => m.type === typeFilter);
    if (activeTab !== "all")
      filtered = filtered.filter((m) => m.messageType === activeTab);
    return filtered;
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

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
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
            /* Fixed image sizing in tables */
            img {
              max-width: 100px;
              max-height: 100px;
              object-fit: contain;
              display: block;
            }
            /* Ensure attachment cell has fixed width */
            td:last-child {
              width: 120px;
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
          <div class="footer">
            <p>Generated by: User ID - ${user?.uid || "Unknown"}${
      user?.email ? ` | Email - ${user?.email}` : ""
    }</p>
          </div>
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
    if (mode === "all" && isAdmin) {
      fetchAllUsersData();
    } else if (selectedUser) {
      fetchMessages(selectedUser);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">
          Records & Reports
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isAdmin && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">
                  View Mode
                </p>
                <div className="inline-flex rounded-lg">
                  <button
                    className={`px-5 py-2.5 ${
                      viewMode === "individual"
                        ? "bg-indigo-600 text-white"
                        : "bg-white"
                    } rounded-l-lg`}
                    onClick={() => toggleViewMode("individual")}
                  >
                    Individual
                  </button>
                  <button
                    className={`px-5 py-2.5 ${
                      viewMode === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-white"
                    } rounded-r-lg`}
                    onClick={() => toggleViewMode("all")}
                  >
                    All Users
                  </button>
                </div>
              </div>
              {viewMode === "individual" && allUsers.length > 0 && (
                <select
                  value={selectedUser || ""}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    fetchMessages(e.target.value);
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  {allUsers.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 pt-6">
            <nav className="flex space-x-6 border-b">
              <button
                className={`pb-4 ${
                  activeTab === "received"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("received")}
              >
                Incoming
              </button>
              <button
                className={`pb-4 ${
                  activeTab === "sent"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("sent")}
              >
                Outgoing
              </button>
            </nav>

            <div className="flex justify-between py-4 gap-4">
              <select
                className="p-2 border rounded-lg"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <div className="flex space-x-3">
                <div className="relative">
                  <button
                    className="flex px-4 py-2 border rounded-lg"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg">
                      <button
                        className={`w-full text-left p-2 ${
                          typeFilter === "all"
                            ? "text-indigo-600"
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
                          className={`w-full text-left p-2 ${
                            typeFilter === type
                              ? "text-indigo-600"
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
                  )}
                </div>
                <div className="relative">
                  <button
                    className="flex px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    onClick={() => setShowPrintDropdown(!showPrintDropdown)}
                  >
                    Export
                  </button>
                  {showPrintDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg">
                      <button
                        className="w-full text-left p-2"
                        onClick={() =>
                          handlePrint(
                            viewMode === "all"
                              ? "allUsersMessagesTable"
                              : `${activeTab}MessagesTable`
                          )
                        }
                      >
                        Print{" "}
                        {viewMode === "all"
                          ? "All Users"
                          : activeTab === "received"
                          ? "Received"
                          : "Sent"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-32">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              {viewMode === "individual" && (
                <>
                  <div
                    className={activeTab === "received" ? "block" : "hidden"}
                    id="receivedMessagesTable"
                  >
                    {filteredReceivedMessages.length === 0 ? (
                      <div className="text-center py-12">
                        No received messages
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3">From</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Date Sent</th>
                            <th className="px-4 py-3">Date Received</th>
                            <th className="px-4 py-3">Channel</th>
                            <th className="px-4 py-3">Format</th>
                            <th className="px-4 py-3">Attachment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReceivedMessages.map((message) => (
                            <tr key={message.id}>
                              <td className="px-4 py-4">
                                {message.sender ||
                                  message.staffName ||
                                  "System"}
                              </td>
                              <td className="px-4 py-4">
                                {message.communicationType || message.type}
                              </td>
                              <td className="px-4 py-4">
                                {message.documentId || message.id}
                              </td>
                              <td className="px-4 py-4">
                                {message.subject || message.description}
                              </td>
                              <td className="px-4 py-4">
                                {formatTimestamp(
                                  message.dateSent || message.timestamp
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {formatTimestamp(
                                  message.dateReceived || message.timestamp
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {message.channel || "Unknown"}
                              </td>
                              <td className="px-4 py-4">
                                {message.fileFormat || "Unknown"}
                              </td>
                              <td className="px-4 py-4">
                                {message.fileUrl ? (
                                  message.fileFormat.toLowerCase() === "png" ||
                                  message.fileFormat.toLowerCase() === "jpg" ||
                                  message.fileFormat.toLowerCase() ===
                                    "jpeg" ? (
                                    <img
                                      src={message.fileUrl}
                                      alt="Attachment"
                                      className="max-w-[100px] max-h-[100px] object-cover"
                                    />
                                  ) : (
                                    <a
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline"
                                    >
                                      View File
                                    </a>
                                  )
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div
                    className={activeTab === "sent" ? "block" : "hidden"}
                    id="sentMessagesTable"
                  >
                    {filteredSentMessages.length === 0 ? (
                      <div className="text-center py-12">No sent messages</div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3">To</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Date Sent</th>
                            <th className="px-4 py-3">Channel</th>
                            <th className="px-4 py-3">Format</th>
                            <th className="px-4 py-3">Attachment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSentMessages.map((message) => (
                            <tr key={message.id}>
                              <td className="px-4 py-4">{message.receiver}</td>
                              <td className="px-4 py-3">
                                {message.communicationType || message.type}
                              </td>
                              <td className="px-4 py-4">
                                {message.documentId || message.id}
                              </td>
                              <td className="px-4 py-4">
                                {message.subject || message.description}
                              </td>
                              <td className="px-4 py-4">
                                {formatTimestamp(
                                  message.dateSent || message.timestamp
                                )}
                              </td>
                              <td className="px-4 py-4">
                                {message.channel || "Unknown"}
                              </td>
                              <td className="px-4 py-4">
                                {message.fileFormat || "Unknown"}
                              </td>
                              <td className="px-4 py-4">
                                {message.fileUrl ? (
                                  message.fileFormat.toLowerCase() === "png" ||
                                  message.fileFormat.toLowerCase() === "jpg" ||
                                  message.fileFormat.toLowerCase() ===
                                    "jpeg" ? (
                                    <img
                                      src={message.fileUrl}
                                      alt="Attachment"
                                      className="max-w-[100px] max-h-[100px] object-cover"
                                    />
                                  ) : (
                                    <a
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline"
                                    >
                                      View File
                                    </a>
                                  )
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
              {viewMode === "all" && (
                <div id="allUsersMessagesTable">
                  {allUsersData.length === 0 ? (
                    <div className="text-center py-12">No messages</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Direction</th>
                          <th className="px-4 py-3">
                            {activeTab === "received" ? "From" : "To"}
                          </th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Subject</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Attachment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterAllUsersData().map((message) => (
                          <tr key={message.id + message.userId}>
                            <td className="px-4 py-4">{message.userName}</td>
                            <td className="px-4 py-4">{message.messageType}</td>
                            <td className="px-4 py-4">
                              {message.messageType === "received"
                                ? message.sender || "System"
                                : message.receiver}
                            </td>
                            <td className="px-4 py-4">{message.type}</td>
                            <td className="px-4 py-4">{message.subject}</td>
                            <td className="px-4 py-4">
                              {formatTimestamp(message.timestamp)}
                            </td>
                            <td className="px-4 py-4">
                              {message.fileUrl ? (
                                message.fileFormat.toLowerCase() === "png" ||
                                message.fileFormat.toLowerCase() === "jpg" ||
                                message.fileFormat.toLowerCase() === "jpeg" ? (
                                  <img
                                    src={message.fileUrl}
                                    alt="Attachment"
                                    className="max-w-[100px] max-h-[100px] object-cover"
                                  />
                                ) : (
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View File
                                  </a>
                                )
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
