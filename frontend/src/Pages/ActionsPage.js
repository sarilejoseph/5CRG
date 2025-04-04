import React, { useState, useEffect } from "react";
import { ref, onValue, remove, update, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth, storage } from "../firebase";
import { ref as storageRef, getDownloadURL } from "firebase/storage";

// Icons as separate components to reduce repetition
const Icon = ({ children, className = "" }) => (
  <svg
    className={`h-5 w-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {children}
  </svg>
);

const icons = {
  eye: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  ),
  edit: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  ),
  trash: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  ),
  inbox: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H6.586a1 1 0 00-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  ),
  send: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  ),
  message: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
    />
  ),
};

// Reusable Modal component
const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-indigo-800 mb-4">{title}</h2>
        {children}
        <div className="mt-4 flex justify-end space-x-2">{actions}</div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon, label, value }) => (
  <div className="bg-indigo-50 p-4 rounded-xl flex items-center space-x-3">
    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
      <Icon className="h-8 w-8">{icon}</Icon>
    </div>
    <div>
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-xl font-bold text-indigo-800">{value}</p>
    </div>
  </div>
);

const ActionsPage = () => {
  const [messages, setMessages] = useState({ received: [], sent: [] });
  const [filteredMessages, setFilteredMessages] = useState({
    received: [],
    sent: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("received");
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    message: null,
    data: {},
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkUserRole(currentUser.uid);
      } else {
        setIsAdmin(false);
        setSelectedUser(null);
        setMessages({ received: [], sent: [] });
        setFilteredMessages({ received: [], sent: [] });
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredMessages({
      received: messages.received.filter((m) =>
        Object.values(m).some(
          (v) => v && typeof v === "string" && v.toLowerCase().includes(term)
        )
      ),
      sent: messages.sent.filter((m) =>
        Object.values(m).some(
          (v) => v && typeof v === "string" && v.toLowerCase().includes(term)
        )
      ),
    });
  }, [searchTerm, messages]);

  const checkUserRole = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (!userData) {
        setLoading(false);
        return;
      }

      const admin = userData?.role === "admin" || userData?.role === "manager";
      setIsAdmin(admin);

      if (admin) {
        fetchAllUsers();
        setSelectedUser("all");
        fetchMessages(null);
      } else {
        setSelectedUser(uid);
        fetchMessages(uid);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setLoading(false);
    }
  };

  const fetchAllUsers = () => {
    onValue(
      ref(database, "users"),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAllUsers(
            Object.entries(data).map(([uid, d]) => ({
              uid,
              name: d.name || d.email || uid,
              email: d.email,
            }))
          );
        }
      },
      { onlyOnce: true }
    );
  };

  const fetchMessages = (userId) => {
    setLoading(true);

    const processMessages = (type, data, uid) => {
      if (!data) return [];
      return Object.entries(data).map(([id, m]) => ({
        id,
        uid,
        ...m,
        description: m.description || "-",
      }));
    };

    if (isAdmin && !userId) {
      const usersRef = ref(database, "users");
      onValue(
        usersRef,
        (snapshot) => {
          const usersData = snapshot.val();
          if (!usersData) {
            setMessages({ received: [], sent: [] });
            setLoading(false);
            return;
          }

          const allReceived = [];
          const allSent = [];

          Object.entries(usersData).forEach(([uid, userData]) => {
            if (userData.receivedMessages) {
              allReceived.push(
                ...processMessages("received", userData.receivedMessages, uid)
              );
            }
            if (userData.sentMessages) {
              allSent.push(
                ...processMessages("sent", userData.sentMessages, uid)
              );
            }
          });

          setMessages({ received: allReceived, sent: allSent });
          setLoading(false);
        },
        { onlyOnce: true }
      );
    } else {
      const userPath = `users/${userId}`;
      const receivedRef = ref(database, `${userPath}/receivedMessages`);
      const sentRef = ref(database, `${userPath}/sentMessages`);

      Promise.all([
        get(receivedRef).then((snapshot) =>
          processMessages("received", snapshot.val(), userId)
        ),
        get(sentRef).then((snapshot) =>
          processMessages("sent", snapshot.val(), userId)
        ),
      ])
        .then(([received, sent]) => {
          setMessages({ received, sent });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
          setLoading(false);
        });
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "Unknown";
    return new Date(ts).toLocaleString();
  };

  const handleFileDownload = async (fileUrl, filename) => {
    try {
      if (!fileUrl) return;

      const fileReference = storageRef(storage, fileUrl);
      const url = await getDownloadURL(fileReference);

      if (window.confirm("Would you like to download this file?")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleAction = (action) => {
    const { message, data } = modalState;
    const path = `users/${message.uid}/${activeTab}Messages/${message.id}`;

    if (action === "delete") {
      if (isAdmin || (user && user.uid === message.uid)) {
        remove(ref(database, path))
          .then(() => {
            closeModal();
          })
          .catch((error) => {
            console.error("Delete failed:", error);
            alert("Failed to delete message. Please try again.");
          });
      } else {
        alert("You don't have permission to delete this message.");
        closeModal();
      }
    }

    if (action === "edit") {
      if (!isAdmin && user && user.uid !== message.uid) {
        alert("You don't have permission to edit this message.");
        closeModal();
        return;
      }

      const { id, uid, createdAt, timestamp, ...updateData } = data;
      const changes = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (message[key] !== value) {
          changes[key] = value;
        }
      });

      if (Object.keys(changes).length > 0) {
        update(ref(database, path), changes)
          .then(() => {
            closeModal();
          })
          .catch((error) => {
            console.error("Update failed:", error);
            alert("Failed to update message. Please try again.");
          });
      } else {
        closeModal();
      }
    }
  };

  const openModal = (type, message) => {
    setModalState({
      isOpen: true,
      type,
      message,
      data: { ...message },
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, message: null, data: {} });
  };

  const handleInputChange = (key, value) => {
    setModalState((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));
  };

  const MessageRow = ({ message }) => (
    <tr key={`${message.uid}-${message.id}`} className="hover:bg-gray-50">
      <td className="px-4 py-2 text-indigo-700">
        {message[activeTab === "received" ? "sender" : "receiver"] || "Unknown"}
      </td>
      <td className="px-4 py-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {message.type || "N/A"}
        </span>
      </td>
      <td className="px-4 py-2 truncate max-w-xs">{message.description}</td>
      <td className="px-4 py-2">
        {message.fileUrl ? (
          <img
            src={message.fileUrl}
            alt={message.filename || "File"}
            className="w-16 h-16 object-cover rounded cursor-pointer"
            onClick={() =>
              handleFileDownload(message.fileUrl, message.filename)
            }
          />
        ) : (
          "No File"
        )}
      </td>
      <td className="px-4 py-2">
        {formatTimestamp(message.createdAt || message.timestamp)}
      </td>
      {isAdmin && <td className="px-4 py-2">{message.uid}</td>}
      <td className="px-4 py-2 text-right space-x-2">
        <button
          onClick={() => openModal("view", message)}
          className="text-indigo-600"
        >
          <Icon>{icons.eye}</Icon>
        </button>
        <button
          onClick={() => openModal("edit", message)}
          className="text-blue-600"
        >
          <Icon>{icons.edit}</Icon>
        </button>
        <button
          onClick={() => openModal("delete", message)}
          className="text-red-600"
        >
          <Icon>{icons.trash}</Icon>
        </button>
      </td>
    </tr>
  );

  const renderModalContent = () => {
    const { type, message, data } = modalState;

    switch (type) {
      case "view":
        return (
          <>
            <div className="space-y-2">
              {Object.entries({
                ID: message.id,
                Channel: message.channel,
                Sender: message.sender,
                Receiver: message.receiver,
                Type: message.type,
                Description: message.description,
                "File Format": message.fileFormat,
                Time: formatTimestamp(message.createdAt || message.timestamp),
                ...(isAdmin && { "User ID": message.uid }),
              }).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value || "-"}
                </p>
              ))}
              {message.fileUrl && (
                <div>
                  <strong>File:</strong>
                  <img
                    src={message.fileUrl}
                    alt={message.filename || "File"}
                    className="mt-2 max-w-full h-auto rounded-lg cursor-pointer"
                    onClick={() =>
                      handleFileDownload(message.fileUrl, message.filename)
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Click image to download
                  </p>
                </div>
              )}
            </div>
            <button
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
              onClick={closeModal}
            >
              Close
            </button>
          </>
        );

      case "edit":
        return (
          <>
            <div className="space-y-3">
              {[
                { key: "channel", placeholder: "Channel" },
                { key: "sender", placeholder: "Sender" },
                { key: "receiver", placeholder: "Receiver" },
                { key: "type", placeholder: "Type" },
                {
                  key: "description",
                  placeholder: "Description",
                  textarea: true,
                },
                { key: "fileFormat", placeholder: "File Format" },
                { key: "fileUrl", placeholder: "File URL" },
              ].map((field) =>
                field.textarea ? (
                  <textarea
                    key={field.key}
                    className="w-full p-2 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={data[field.key] || ""}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    key={field.key}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={data[field.key] || ""}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                onClick={() => handleAction("edit")}
              >
                Save
              </button>
            </div>
          </>
        );

      case "delete":
        return (
          <>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-center space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={() => handleAction("delete")}
              >
                Delete
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">
          {isAdmin ? "Admin Actions Dashboard" : "Message Actions"}
        </h1>

        {isAdmin && allUsers.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>
            <select
              value={selectedUser || "all"}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedUser(value);
                fetchMessages(value === "all" ? null : value);
              }}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Users</option>
              {allUsers.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b flex-wrap gap-2">
            <div className="space-x-2">
              <button
                className={`px-3 py-1 rounded-lg ${
                  activeTab === "received"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("received")}
              >
                Received
              </button>
              <button
                className={`px-3 py-1 rounded-lg ${
                  activeTab === "sent"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("sent")}
              >
                Sent
              </button>
            </div>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-[200px] flex-grow-0 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-t-4 border-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading messages...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                      {activeTab === "received" ? "Sender" : "Receiver"}
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                      File
                    </th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                      Time
                    </th>
                    {isAdmin && (
                      <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                        User
                      </th>
                    )}
                    <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages[activeTab].length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="p-8 text-center text-gray-500"
                      >
                        No {activeTab} messages found
                        {searchTerm && " matching your search criteria"}
                      </td>
                    </tr>
                  ) : (
                    filteredMessages[activeTab].map((message) => (
                      <MessageRow
                        key={`${message.uid}-${message.id}`}
                        message={message}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={icons.inbox}
            label="Received"
            value={messages.received.length}
          />
          <StatCard
            icon={icons.send}
            label="Sent"
            value={messages.sent.length}
          />
          <StatCard
            icon={icons.message}
            label="Total"
            value={messages.received.length + messages.sent.length}
          />
        </div>

        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={
            modalState.type === "view"
              ? "Message Details"
              : modalState.type === "edit"
              ? "Edit Message"
              : "Confirm Delete"
          }
        >
          {renderModalContent()}
        </Modal>
      </div>
    </div>
  );
};

export default ActionsPage;
