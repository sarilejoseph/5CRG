import React, { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue, get, set, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { FaEye, FaEdit, FaTrash, FaDownload } from "react-icons/fa";

const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

const ActionPage = () => {
  const [allMessages, setAllMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [messageDirection, setMessageDirection] = useState("all"); // New state for toggle
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [editMessage, setEditMessage] = useState(null);
  const [viewMessage, setViewMessage] = useState(null);
  const [error, setError] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) checkUserRole(user.uid);
      else {
        setIsAdmin(false);
        setAllMessages([]);
        setLoading(false);
        setError("Please log in to view data.");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeFilter, userFilter, messageDirection, allMessages]);

  const checkUserRole = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        setError("User data not found.");
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const userData = snapshot.val();
      setIsAdmin(userData?.role === "admin");
      fetchAllMessages();
    } catch (err) {
      console.error("Error checking user role:", err);
      setError("Error fetching user role.");
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchAllMessages = () => {
    setLoading(true);
    setError(null);
    const usersRef = ref(database, "users");
    onValue(
      usersRef,
      (snapshot) => {
        const usersData = snapshot.val();
        if (!usersData) {
          setAllMessages([]);
          setLoading(false);
          return;
        }
        const combinedData = [];
        Object.entries(usersData).forEach(([uid, userData]) => {
          const received = userData.receivedMessages || {};
          const sent = userData.sentMessages || {};
          Object.entries(received).forEach(([msgId, msgData]) => {
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
            combinedData.push({
              id: msgId,
              userId: uid,
              userName: userData.name || userData.email || uid,
              messageType: "received",
              ...msgData,
              communicationType:
                msgData.communicationType || msgData.type || "Unknown",
              documentId: msgData.documentId || msgData.id || "-",
              dateSent: msgData.dateSent || msgData.timestamp || Date.now(),
              sender: msgData.sender || msgData.staffName || "Unknown",
              receiver: msgData.receiver || "-",
              subject,
              dateReceived:
                msgData.dateReceived || msgData.timestamp || Date.now(),
              channel: msgData.channel || "Unknown",
              fileFormat: msgData.fileFormat || "Unknown",
              hasAttachment: msgData.hasAttachment || false,
              fileUrl: msgData.fileUrl,
            });
          });
          Object.entries(sent).forEach(([msgId, msgData]) => {
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
            combinedData.push({
              id: msgId,
              userId: uid,
              userName: userData.name || userData.email || uid,
              messageType: "sent",
              ...msgData,
              communicationType:
                msgData.communicationType || msgData.type || "Unknown",
              documentId: msgData.documentId || msgData.id || "-",
              dateSent: msgData.dateSent || msgData.timestamp || Date.now(),
              sender: msgData.sender || "Self",
              receiver: msgData.receiver || "-",
              subject,
              dateReceived: msgData.dateReceived || null,
              channel: msgData.channel || "Unknown",
              fileFormat: msgData.fileFormat || "Unknown",
              hasAttachment: msgData.hasAttachment || false,
              fileUrl: msgData.fileUrl,
            });
          });
        });
        combinedData.sort((a, b) => b.dateSent - a.dateSent);
        setAllMessages(combinedData);
        setFilteredMessages(combinedData);
        setUniqueUsers([...new Set(combinedData.map((msg) => msg.userName))]);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setError("Permission denied fetching data.");
        setLoading(false);
      }
    );
  };

  const applyFilters = () => {
    let filtered = [...allMessages];
    if (timeFilter !== "all") {
      const today = new Date();
      const filters = {
        today: (m) =>
          new Date(m.dateSent).toDateString() === today.toDateString(),
        week: (m) =>
          new Date(m.dateSent) >=
          new Date(today.setDate(today.getDate() - today.getDay())),
        month: (m) =>
          new Date(m.dateSent) >=
          new Date(today.getFullYear(), today.getMonth(), 1),
      };
      filtered = filtered.filter(filters[timeFilter]);
    }
    if (userFilter !== "all") {
      filtered = filtered.filter((m) => m.userName === userFilter);
    }
    if (messageDirection !== "all") {
      filtered = filtered.filter((m) => m.messageType === messageDirection);
    }
    setFilteredMessages(filtered);
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();
  const formatDateForInput = (timestamp) =>
    new Date(timestamp).toISOString().split("T")[0];

  const handleUpdate = async (message) => {
    if (!editMessage || !isAdmin) return;
    try {
      const path = `users/${message.userId}/${
        message.messageType === "received" ? "receivedMessages" : "sentMessages"
      }/${message.id}`;
      const messageRef = ref(database, path);
      let updatedData = { ...editMessage };

      if (newFile) {
        try {
          // Create a user-specific storage path with proper permissions
          const fileExtension = newFile.name.split(".").pop().toLowerCase();
          const fileName = `${Date.now()}_${message.id}.${fileExtension}`;
          const filePath = `messageFiles/${message.userId}/${fileName}`;
          const storageReference = storageRef(storage, filePath);

          await uploadBytes(storageReference, newFile);
          const downloadURL = await getDownloadURL(storageReference);

          updatedData.fileUrl = downloadURL;
          updatedData.fileFormat =
            fileExtension.toUpperCase() === "DOCX"
              ? "MS Word"
              : fileExtension.toUpperCase() === "DOC"
              ? "MS Word"
              : fileExtension.toUpperCase() === "JPG"
              ? "JPEG"
              : fileExtension.toUpperCase();
          updatedData.hasAttachment = true;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          setError(`File upload failed: ${uploadError.message}`);
          return; // Exit early if file upload fails
        }
      }

      await set(messageRef, updatedData);
      setEditMessage(null);
      setNewFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      setError(null); // Clear any previous errors
      fetchAllMessages();
    } catch (err) {
      console.error("Error updating message:", err);
      setError(`Failed to update message: ${err.message}`);
    }
  };

  const handleDelete = async (message) => {
    if (!isAdmin) return;

    try {
      // Confirm deletion
      if (!window.confirm("Are you sure you want to delete this message?")) {
        return;
      }

      // Create reference to the message
      const path = `users/${message.userId}/${
        message.messageType === "received" ? "receivedMessages" : "sentMessages"
      }/${message.id}`;
      const messageRef = ref(database, path);

      // Delete the message
      await remove(messageRef);

      // Show success notification
      setError(null); // Clear any error messages
      alert("Message deleted successfully");
      fetchAllMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
      setError(`Failed to delete message: ${err.message}`);
    }
  };

  const handleDownload = (message) => {
    if (message.fileUrl) {
      window.open(message.fileUrl, "_blank");
    }
  };

  const renderContentField = () => {
    switch (editMessage.type) {
      case "STL":
      case "Letter":
        return (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editMessage.description || ""}
              onChange={(e) =>
                setEditMessage({ ...editMessage, description: e.target.value })
              }
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Max 100 characters"
              maxLength={100}
              required
            />
          </div>
        );
      case "Conference Notice":
        return (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Agenda <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editMessage.agenda || ""}
              onChange={(e) =>
                setEditMessage({ ...editMessage, agenda: e.target.value })
              }
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Max 100 characters"
              maxLength={100}
              required
            />
          </div>
        );
      case "LOI":
        return (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editMessage.title || ""}
              onChange={(e) =>
                setEditMessage({ ...editMessage, title: e.target.value })
              }
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Max 100 characters"
              maxLength={100}
              required
            />
          </div>
        );
      case "RAD":
        return (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Cite Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editMessage.cite || ""}
              onChange={(e) =>
                setEditMessage({ ...editMessage, cite: e.target.value })
              }
              className="w-full p-2 border rounded-md bg-gray-200"
              placeholder="Max 50 characters"
              maxLength={50}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  const channelOptions = [
    "Email",
    "Viber",
    "Hardcopy",
    "Cignal",
    "Telegram",
    "SMS",
    "Zimbra",
  ];
  const fileFormatOptions = ["PDF", "JPEG", "MS Word", "PNG"];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">
          Message Actions
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-between gap-4">
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

          <div className="flex items-center space-x-2">
            <span
              className={
                messageDirection === "sent" ? "text-blue-600" : "text-gray-500"
              }
            >
              Outgoing
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={messageDirection === "received"}
                onChange={() =>
                  setMessageDirection(
                    messageDirection === "received" ? "sent" : "received"
                  )
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:left-0.5 after:top-0.5"></div>
            </label>
            <span
              className={
                messageDirection === "received"
                  ? "text-blue-600"
                  : "text-gray-500"
              }
            >
              Incoming
            </span>
          </div>

          <div className="relative">
            <button
              className="flex px-4 py-2 border rounded-lg"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              Filter by User
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
                <button
                  className={`w-full text-left p-2 ${
                    userFilter === "all" ? "text-indigo-600" : "text-gray-700"
                  }`}
                  onClick={() => {
                    setUserFilter("all");
                    setShowFilterDropdown(false);
                  }}
                >
                  All Users
                </button>
                {uniqueUsers.map((userName) => (
                  <button
                    key={userName}
                    className={`w-full text-left p-2 ${
                      userFilter === userName
                        ? "text-indigo-600"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setUserFilter(userName);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {userName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12">No messages available</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Direction</th>
                    <th className="px-4 py-3">From/To</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Date Sent</th>
                    <th className="px-4 py-3">Attachment</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message) => (
                    <tr key={`${message.userId}-${message.id}`}>
                      <td className="px-4 py-4">{message.userName}</td>
                      <td className="px-4 py-4">{message.communicationType}</td>
                      <td className="px-4 py-4">{message.messageType}</td>
                      <td className="px-4 py-4">
                        {message.messageType === "received"
                          ? message.sender
                          : message.receiver}
                      </td>
                      <td className="px-4 py-4">{message.subject}</td>
                      <td className="px-4 py-4">
                        {formatTimestamp(message.dateSent)}
                      </td>
                      <td className="px-4 py-4">
                        {message.fileUrl ? (
                          ["JPEG", "PNG"].includes(message.fileFormat) ? (
                            <img
                              src={message.fileUrl}
                              alt="Attachment"
                              className="w-16 h-16 object-cover"
                            />
                          ) : (
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              View
                            </a>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => setViewMessage(message)}
                          className="text-blue-600"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setEditMessage(message)}
                              className="text-yellow-600"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(message)}
                              className="text-red-600"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDownload(message)}
                          className="text-green-600"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* View Modal */}
        {viewMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-900">
                  Message Details
                </h2>
                <button
                  onClick={() => setViewMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Type:</div>
                      <div className="text-sm font-medium">
                        {viewMessage.communicationType}
                      </div>

                      <div className="text-sm text-gray-500">Direction:</div>
                      <div className="text-sm font-medium capitalize">
                        {viewMessage.messageType}
                      </div>

                      <div className="text-sm text-gray-500">Document ID:</div>
                      <div className="text-sm font-medium">
                        {viewMessage.documentId || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Communication Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">
                        {viewMessage.messageType === "received"
                          ? "From:"
                          : "To:"}
                      </div>
                      <div className="text-sm font-medium">
                        {viewMessage.messageType === "received"
                          ? viewMessage.sender
                          : viewMessage.receiver}
                      </div>

                      <div className="text-sm text-gray-500">Subject:</div>
                      <div className="text-sm font-medium">
                        {viewMessage.subject}
                      </div>

                      <div className="text-sm text-gray-500">Channel:</div>
                      <div className="text-sm font-medium">
                        {viewMessage.channel}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Timeline
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Date Sent:</div>
                      <div className="text-sm font-medium">
                        {formatTimestamp(viewMessage.dateSent)}
                      </div>

                      <div className="text-sm text-gray-500">
                        Date Received:
                      </div>
                      <div className="text-sm font-medium">
                        {viewMessage.dateReceived
                          ? formatTimestamp(viewMessage.dateReceived)
                          : "-"}
                      </div>

                      <div className="text-sm text-gray-500">Received by:</div>
                      <div className="text-sm font-medium">
                        {viewMessage.staffName || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      User Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">User:</div>
                      <div className="text-sm font-medium">
                        {viewMessage.userName}
                      </div>

                      <div className="text-sm text-gray-500">User ID:</div>
                      <div className="text-sm font-medium truncate">
                        {viewMessage.userId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachment Section */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Attachment</h3>
                {viewMessage.fileUrl ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm text-gray-500">
                          File Format:{" "}
                        </span>
                        <span className="text-sm font-medium">
                          {viewMessage.fileFormat}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(viewMessage)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md flex items-center text-sm"
                      >
                        <FaDownload className="mr-1" /> Download
                      </button>
                    </div>

                    {["JPEG", "PNG"].includes(viewMessage.fileFormat) ? (
                      <div className="border rounded-lg overflow-hidden mt-2">
                        <img
                          src={viewMessage.fileUrl}
                          alt="Attachment"
                          className="w-full object-contain max-h-64"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 text-center mt-2">
                        <a
                          href={viewMessage.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center justify-center"
                        >
                          <svg
                            className="w-8 h-8 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No attachment available
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewMessage(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editMessage && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-5xl w-full">
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                Edit Record
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(editMessage);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Type of Communication
                    </label>
                    <select
                      value={editMessage.type}
                      onChange={(e) =>
                        setEditMessage({ ...editMessage, type: e.target.value })
                      }
                      className="w-full p-2 border rounded-md bg-gray-200"
                    >
                      <option value="STL">STL (Subject to letter)</option>
                      <option value="Conference Notice">
                        Conference Notice
                      </option>
                      <option value="LOI">LOI (Letter of Instructions)</option>
                      <option value="RAD">RAD message</option>
                      <option value="Letter">Letter (Civilian)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      ID
                    </label>
                    <input
                      type="text"
                      value={editMessage.id}
                      readOnly
                      className="w-full p-2 bg-gray-100 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Dated <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(editMessage.dateSent)}
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          dateSent: new Date(e.target.value).getTime(),
                        })
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Sender/Originator <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editMessage.sender}
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          sender: e.target.value,
                        })
                      }
                      className={`w-full p-2 border rounded-md ${
                        editMessage.messageType === "sent"
                          ? "bg-gray-100"
                          : "bg-white"
                      }`}
                      readOnly={editMessage.messageType === "sent"}
                      maxLength={25}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Receiver <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editMessage.receiver}
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          receiver: e.target.value,
                        })
                      }
                      className={`w-full p-2 border rounded-md ${
                        editMessage.messageType === "received"
                          ? "bg-gray-100"
                          : "bg-white"
                      }`}
                      readOnly={editMessage.messageType === "received"}
                      required
                    />
                  </div>
                </div>
                {renderContentField()}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Date Received
                    </label>
                    <input
                      type="date"
                      value={
                        editMessage.dateReceived
                          ? formatDateForInput(editMessage.dateReceived)
                          : ""
                      }
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          dateReceived: e.target.value
                            ? new Date(e.target.value).getTime()
                            : null,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Received by
                    </label>
                    <input
                      type="text"
                      value={editMessage.staffName || ""}
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          staffName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Channel
                    </label>
                    <select
                      value={editMessage.channel}
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          channel: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md bg-gray-200"
                    >
                      {channelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      File Format
                    </label>
                    <select
                      value={editMessage.fileFormat}
                      onChange={(e) =>
                        setEditMessage({
                          ...editMessage,
                          fileFormat: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md bg-gray-200"
                    >
                      {fileFormatOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Attachment
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setNewFile(e.target.files[0])}
                      className="w-full p-2 border rounded-md"
                      accept={
                        editMessage.fileFormat === "PDF"
                          ? ".pdf"
                          : editMessage.fileFormat === "JPEG"
                          ? ".jpg,.jpeg"
                          : editMessage.fileFormat === "MS Word"
                          ? ".doc,.docx"
                          : editMessage.fileFormat === "PNG"
                          ? ".png"
                          : ""
                      }
                    />
                    {editMessage.fileUrl && (
                      <a
                        href={editMessage.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        Current File
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditMessage(null);
                      setNewFile(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPage;
