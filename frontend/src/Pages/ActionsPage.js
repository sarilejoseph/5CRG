import React, { useState, useEffect } from "react";
import { ref, onValue, remove, update, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";

const ActionsPage = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [filteredReceivedMessages, setFilteredReceivedMessages] = useState([]);
  const [filteredSentMessages, setFilteredSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("received");
  const [showModal, setShowModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [modalType, setModalType] = useState("");
  const [editData, setEditData] = useState({ description: "", type: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkUserRole(user.uid);
      } else {
        setUser(null);
        setIsAdmin(false);
        setSelectedUser(null);
        resetMessages();
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchTerm, receivedMessages, sentMessages, activeTab]);

  useEffect(() => {
    if (currentMessage && modalType === "edit") {
      setEditData({
        description: currentMessage.description || "",
        type: currentMessage.type || "",
      });
    }
  }, [currentMessage, modalType]);

  // Add event listener for screen resize to handle sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on window width
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          fetchAllUsers();
          setSelectedUser(uid);
        }

        fetchMessages(uid);
      } else {
        fetchMessages(uid);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      fetchMessages(uid);
    }
  };

  const resetMessages = () => {
    setReceivedMessages([]);
    setSentMessages([]);
    setFilteredReceivedMessages([]);
    setFilteredSentMessages([]);
  };

  const fetchAllUsers = () => {
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
      }
    });
  };

  const handleUserChange = (e) => {
    const selectedUid = e.target.value;
    setSelectedUser(selectedUid);
    fetchMessages(selectedUid);
  };

  const fetchMessages = (userId) => {
    const receivedRef = ref(database, `users/${userId}/receivedMessages`);
    onValue(
      receivedRef,
      (snapshot) => {
        const data = snapshot.val();
        let receivedMessageArray = data
          ? Object.entries(data).map(([key, value]) => ({
              id: key,
              sender: value.sender,
              type: value.type,
              description: value.description,
              timestamp: value.timestamp,
              staffName: value.staffName,
            }))
          : [];

        setReceivedMessages(receivedMessageArray);
        setFilteredReceivedMessages(receivedMessageArray);

        const sentRef = ref(database, `users/${userId}/sentMessages`);
        onValue(
          sentRef,
          (snapshot) => {
            const data = snapshot.val();
            let sentMessageArray = data
              ? Object.entries(data).map(([key, value]) => ({
                  id: key,
                  receiver: value.receiver,
                  type: value.type,
                  description: value.description,
                  timestamp: value.timestamp,
                  staffName: value.staffName,
                }))
              : [];

            setSentMessages(sentMessageArray);
            setFilteredSentMessages(sentMessageArray);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching sent messages:", error);
            setLoading(false);
          }
        );
      },
      (error) => {
        console.error("Error fetching received messages:", error);
        setLoading(false);
      }
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredReceivedMessages(receivedMessages);
      setFilteredSentMessages(sentMessages);
      return;
    }

    const term = searchTerm.toLowerCase();

    const searchReceived = receivedMessages.filter(
      (message) =>
        message.sender?.toLowerCase().includes(term) ||
        message.type?.toLowerCase().includes(term) ||
        message.description?.toLowerCase().includes(term) ||
        message.staffName?.toLowerCase().includes(term)
    );

    const searchSent = sentMessages.filter(
      (message) =>
        message.receiver?.toLowerCase().includes(term) ||
        message.type?.toLowerCase().includes(term) ||
        message.description?.toLowerCase().includes(term) ||
        message.staffName?.toLowerCase().includes(term)
    );

    setFilteredReceivedMessages(searchReceived);
    setFilteredSentMessages(searchSent);
  };

  const handleDelete = (id) => {
    if (!selectedUser || !id) return;

    const path =
      activeTab === "received"
        ? `users/${selectedUser}/receivedMessages/${id}`
        : `users/${selectedUser}/sentMessages/${id}`;

    remove(ref(database, path))
      .then(() => {
        console.log("Message deleted successfully");
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  };

  const handleEdit = (id) => {
    if (!selectedUser || !id) return;

    const path =
      activeTab === "received"
        ? `users/${selectedUser}/receivedMessages/${id}`
        : `users/${selectedUser}/sentMessages/${id}`;

    update(ref(database, path), editData)
      .then(() => {
        console.log("Message updated successfully");
        setShowModal(false);
      })
      .catch((error) => {
        console.error("Error updating message:", error);
      });
  };

  const openModal = (type, message) => {
    setModalType(type);
    setCurrentMessage(message);
    setShowModal(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderModal = () => {
    if (!showModal || !currentMessage) return null;

    const message = currentMessage;

    if (modalType === "view") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-indigo-800">
                Message Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
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
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-gray-500 font-medium md:w-1/3">ID:</span>
                <span className="font-mono bg-gray-100 p-1 rounded text-gray-700 text-sm flex-1 md:ml-2">
                  {message.id}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-gray-500 font-medium md:w-1/3">
                  {activeTab === "received" ? "Sender" : "Receiver"}:
                </span>
                <span className="font-medium text-indigo-700 flex-1 md:ml-2">
                  {activeTab === "received" ? message.sender : message.receiver}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-gray-500 font-medium md:w-1/3">
                  Type:
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium w-max md:ml-2">
                  {message.type}
                </span>
              </div>
              <div className="flex flex-col md:flex-row">
                <span className="text-gray-500 font-medium md:w-1/3">
                  Description:
                </span>
                <span className="text-gray-700 flex-1 md:ml-2">
                  {message.description}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-gray-500 font-medium md:w-1/3">
                  Time:
                </span>
                <span className="text-gray-700 flex-1 md:ml-2">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-gray-500 font-medium md:w-1/3">
                  Staff:
                </span>
                <span className="text-gray-700 flex-1 md:ml-2">
                  {message.staffName}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "edit") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-indigo-800">
                Edit Message
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
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
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message Type
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={editData.type}
                  onChange={(e) =>
                    setEditData({ ...editData, type: e.target.value })
                  }
                  placeholder="Enter message type"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-h-[120px]"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Enter message description"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                onClick={() => handleEdit(message.id)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "delete") {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                onClick={() => handleDelete(message.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Actions</h1>
          <div className="h-1 w-24 bg-indigo-600 rounded"></div>

          {isAdmin && allUsers.length > 0 && (
            <div className="mb-6 mt-10 bg-white p-5 rounded-xl shadow-md">
              <label className="block text-gray-700 font-medium mb-3">
                View User:
              </label>
              <div className="relative">
                <select
                  value={selectedUser || ""}
                  onChange={handleUserChange}
                  className="block w-full p-3 pr-10 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  {allUsers.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md mb-6">
            <div className="flex justify-between items-center p-5 border-b">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "received"
                      ? "bg-indigo-100 text-indigo-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("received")}
                >
                  Received
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "sent"
                      ? "bg-indigo-100 text-indigo-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("sent")}
                >
                  Sent
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading messages...</p>
              </div>
            ) : activeTab === "received" ? (
              <div className="overflow-x-auto">
                {filteredReceivedMessages.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-4 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      No messages found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No messages match your search criteria"
                        : "Your inbox is empty"}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReceivedMessages.map((message) => (
                        <tr
                          key={message.id}
                          className="hover:bg-gray-50 border-b transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                            {message.sender || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {message.type || "Not specified"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                            {message.description || "No description"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {message.staffName || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatTimestamp(message.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => openModal("view", message)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => openModal("edit", message)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
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
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => openModal("delete", message)}
                                className="text-red-600 hover:text-red-900 transition-colors"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredSentMessages.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-4 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      No messages found
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No messages match your search criteria"
                        : "You haven't sent any messages yet"}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receiver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSentMessages.map((message) => (
                        <tr
                          key={message.id}
                          className="hover:bg-gray-50 border-b transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                            {message.receiver || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {message.type || "Not specified"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                            {message.description || "No description"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {message.staffName || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatTimestamp(message.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => openModal("view", message)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => openModal("edit", message)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
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
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => openModal("delete", message)}
                                className="text-red-600 hover:text-red-900 transition-colors"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-indigo-800 mb-4">
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Received Messages
                    </h3>
                    <p className="text-2xl font-bold text-indigo-800">
                      {receivedMessages.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Sent Messages
                    </h3>
                    <p className="text-2xl font-bold text-indigo-800">
                      {sentMessages.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      Total Messages
                    </h3>
                    <p className="text-2xl font-bold text-indigo-800">
                      {receivedMessages.length + sentMessages.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}

      {/* Overlay for when sidebar is open on mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ActionsPage;
