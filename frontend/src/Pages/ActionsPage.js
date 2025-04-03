import React, { useState, useEffect } from "react";
import { ref, onValue, remove, update, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { database, auth } from "../firebase";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // Ensure you export `storage` from your firebase config

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
  const [modal, setModal] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) checkUserRole(user.uid);
      else resetState();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredMessages({
      received: messages.received.filter((m) =>
        [m.sender, m.type, m.description, m.receiver].some((v) =>
          v?.toLowerCase().includes(term)
        )
      ),
      sent: messages.sent.filter((m) =>
        [m.receiver, m.type, m.description, m.sender].some((v) =>
          v?.toLowerCase().includes(term)
        )
      ),
    });
  }, [searchTerm, messages, activeTab]);

  const checkUserRole = async (uid) => {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();
    const admin = userData?.role === "admin" || userData?.role === "manager";
    setIsAdmin(admin);
    fetchAllUsers();
    setSelectedUser(uid);
    fetchMessages(admin ? null : uid);
  };

  const resetState = () => {
    setMessages({ received: [], sent: [] });
    setFilteredMessages({ received: [], sent: [] });
    setIsAdmin(false);
    setSelectedUser(null);
    setLoading(false);
  };

  const fetchAllUsers = () => {
    onValue(ref(database, "users"), (snapshot) => {
      const data = snapshot.val();
      if (data)
        setAllUsers(
          Object.entries(data).map(([uid, d]) => ({
            uid,
            name: d.name || d.email || uid,
            email: d.email,
          }))
        );
    });
  };

  const fetchMessages = (userId) => {
    setLoading(true);
    const normalizeDescription = (msg) => {
      return msg.description || "-";
    };

    if (isAdmin && !userId) {
      onValue(ref(database, "users"), (snapshot) => {
        const usersData = snapshot.val();
        if (!usersData) return setMessages({ received: [], sent: [] });

        const allReceived = [];
        const allSent = [];
        Object.entries(usersData).forEach(([uid, userData]) => {
          const received = userData.receivedMessages || {};
          const sent = userData.sentMessages || {};

          allReceived.push(
            ...Object.entries(received).map(([id, m]) => ({
              id,
              uid,
              ...m,
              description: normalizeDescription(m),
            }))
          );
          allSent.push(
            ...Object.entries(sent).map(([id, m]) => ({
              id,
              uid,
              ...m,
              description: normalizeDescription(m),
            }))
          );
        });

        setMessages({ received: allReceived, sent: allSent });
        setLoading(false);
      });
    } else {
      onValue(ref(database, `users/${userId}/receivedMessages`), (snapshot) => {
        const data = snapshot.val();
        setMessages((prev) => ({
          ...prev,
          received: data
            ? Object.entries(data).map(([id, m]) => ({
                id,
                uid: userId,
                ...m,
                description: normalizeDescription(m),
              }))
            : [],
        }));
      });

      onValue(ref(database, `users/${userId}/sentMessages`), (snapshot) => {
        const data = snapshot.val();
        setMessages((prev) => ({
          ...prev,
          sent: data
            ? Object.entries(data).map(([id, m]) => ({
                id,
                uid: userId,
                ...m,
                description: normalizeDescription(m),
              }))
            : [],
        }));
        setLoading(false);
      });
    }
  };

  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  const handleDownload = async (filePath, filename) => {
    try {
      // Assuming m.fileUrl is the full URL; extract the path if needed
      const fileReference = storageRef(storage, filePath); // Use the file path stored in your database
      const url = await getDownloadURL(fileReference);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleAction = (action, message) => {
    const path = `users/${message.uid}/${activeTab}Messages/${message.id}`;
    if (action === "delete") {
      remove(ref(database, path))
        .then(() => {
          setModal(null);
          fetchMessages(
            isAdmin && selectedUser === "all" ? null : selectedUser
          );
        })
        .catch((error) => console.error("Delete failed:", error));
    }
    if (action === "edit") {
      update(ref(database, path), modal.data)
        .then(() => {
          setModal(null);
          fetchMessages(
            isAdmin && selectedUser === "all" ? null : selectedUser
          );
        })
        .catch((error) => console.error("Update failed:", error));
    }
  };

  const openModal = (type, message) =>
    setModal({
      type,
      message,
      data: {
        ...message,
        channel: message.channel || "",
        description: message.description || "",
        fileFormat: message.fileFormat || "",
        fileUrl: message.fileUrl || "",
        filename: message.filename || "",
        receiver: message.receiver || "",
        sender: message.sender || "",
      },
    });

  const Modal = () => {
    if (!modal) return null;
    const { type, message } = modal;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          {type === "view" && (
            <>
              <h2 className="text-xl font-bold text-indigo-800 mb-4">
                Message Details
              </h2>
              <div className="space-y-2">
                <p>
                  <strong>ID:</strong> {message.id}
                </p>
                <p>
                  <strong>Channel:</strong> {message.channel}
                </p>
                <p>
                  <strong>Sender:</strong> {message.sender}
                </p>
                <p>
                  <strong>Receiver:</strong> {message.receiver}
                </p>
                <p>
                  <strong>Type:</strong> {message.type}
                </p>
                <p>
                  <strong>Description:</strong> {message.description}
                </p>
                <p>
                  <strong>File Format:</strong> {message.fileFormat}
                </p>
                <p>
                  <strong>Time:</strong> {formatTimestamp(message.createdAt)}
                </p>
                {message.fileUrl && (
                  <div>
                    <strong>Image/File:</strong>
                    <img
                      src={message.fileUrl}
                      alt={message.filename}
                      className="mt-2 max-w-full h-auto rounded-lg"
                    />
                    <button
                      onClick={() =>
                        handleDownload(message.fileUrl, message.filename)
                      }
                      className="mt-2 bg-green-600 text-white px-4 py-1 rounded-lg flex items-center"
                    >
                      <DownloadIcon className="mr-2" /> Download
                    </button>
                  </div>
                )}
                {isAdmin && (
                  <p>
                    <strong>User ID:</strong> {message.uid}
                  </p>
                )}
              </div>
              <button
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setModal(null)}
              >
                Close
              </button>
            </>
          )}
          {type === "edit" && (
            <>
              <h2 className="text-xl font-bold text-indigo-800 mb-4">
                Edit Message
              </h2>
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded-lg"
                  value={modal.data.channel}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, channel: e.target.value },
                    })
                  }
                  placeholder="Channel"
                />
                <input
                  className="w-full p-2 border rounded-lg"
                  value={modal.data.sender}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, sender: e.target.value },
                    })
                  }
                  placeholder="Sender"
                />
                <input
                  className="w-full p-2 border rounded-lg"
                  value={modal.data.receiver}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, receiver: e.target.value },
                    })
                  }
                  placeholder="Receiver"
                />
                <input
                  className="w-full p-2 border rounded-lg"
                  value={modal.data.type}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, type: e.target.value },
                    })
                  }
                  placeholder="Type"
                />
                <textarea
                  className="w-full p-2 border rounded-lg min-h-[100px]"
                  value={modal.data.description}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, description: e.target.value },
                    })
                  }
                  placeholder="Description"
                />
                <input
                  className="w-full p-2 border rounded-lg"
                  value={modal.data.fileFormat}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, fileFormat: e.target.value },
                    })
                  }
                  placeholder="File Format"
                />
                <input
                  className="w-full p-2 border rounded-lg"
                  value={modal.data.fileUrl}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      data: { ...modal.data, fileUrl: e.target.value },
                    })
                  }
                  placeholder="File URL"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  onClick={() => handleAction("edit", message)}
                >
                  Save
                </button>
              </div>
            </>
          )}
          {type === "delete" && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delete
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  onClick={() => handleAction("delete", message)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">Actions</h1>

        {isAdmin && allUsers.length > 0 && (
          <select
            value={selectedUser || ""}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              fetchMessages(
                isAdmin && e.target.value === "all" ? null : e.target.value
              );
            }}
            className="mb-6 w-full p-2 border rounded-lg"
          >
            <option value="all">All Users</option>
            {allUsers.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        )}

        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 flex justify-between items-center border-b">
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
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 p-2 border rounded-lg"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-t-4 border-indigo-500 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
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
                    Image
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
                      colSpan={isAdmin ? "7" : "6"}
                      className="p-8 text-center text-gray-500"
                    >
                      No {activeTab} messages
                    </td>
                  </tr>
                ) : (
                  filteredMessages[activeTab].map((m) => (
                    <tr key={m.id + m.uid} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-indigo-700">
                        {m[activeTab === "received" ? "sender" : "receiver"] ||
                          "Unknown"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {m.type || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-2 truncate max-w-xs">
                        {m.description}
                      </td>
                      <td className="px-4 py-2">
                        {m.fileUrl ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={m.fileUrl}
                              alt={m.filename}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <button
                              onClick={() =>
                                handleDownload(m.fileUrl, m.filename)
                              }
                              className="text-green-600"
                            >
                              <DownloadIcon />
                            </button>
                          </div>
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {formatTimestamp(m.createdAt || m.timestamp)}
                      </td>
                      {isAdmin && <td className="px-4 py-2">{m.uid}</td>}
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => openModal("view", m)}
                          className="text-indigo-600"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          onClick={() => openModal("edit", m)}
                          className="text-blue-600"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => openModal("delete", m)}
                          className="text-red-600"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<InboxIcon />}
            label="Received"
            value={messages.received.length}
          />
          <StatCard
            icon={<SendIcon />}
            label="Sent"
            value={messages.sent.length}
          />
          <StatCard
            icon={<MessageIcon />}
            label="Total"
            value={messages.received.length + messages.sent.length}
          />
        </div>

        <Modal />
      </div>
    </div>
  );
};

// Icon Components
const EyeIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const EditIcon = () => (
  <svg
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
);
const TrashIcon = () => (
  <svg
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
);
const DownloadIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);
const InboxIcon = () => (
  <svg
    className="h-8 w-8"
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
);
const SendIcon = () => (
  <svg
    className="h-8 w-8"
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
);
const MessageIcon = () => (
  <svg
    className="h-8 w-8"
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
);

const StatCard = ({ icon, label, value }) => (
  <div className="bg-indigo-50 p-4 rounded-xl flex items-center space-x-3">
    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">{icon}</div>
    <div>
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-xl font-bold text-indigo-800">{value}</p>
    </div>
  </div>
);

export default ActionsPage;
