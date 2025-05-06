import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  update,
  push,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOCQzMqCzsGxcNGIBfvclGlksL20faVgU",
  authDomain: "farmmartapp-951fb.firebaseapp.com",
  projectId: "farmmartapp-951fb",
  storageBucket: "farmmartapp-951fb.appspot.com",
  messagingSenderId: "1023068644817",
  appId: "1:1023068644817:web:25916435cc0bad9fc82cf0",
  measurementId: "G-VQXBLB4R9D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

function ActionsPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");
  const [messages, setMessages] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [selectedUsername, setSelectedUsername] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const roleRef = ref(database, `users/${currentUser.uid}/role`);
        onValue(
          roleRef,
          (snapshot) => {
            const role = snapshot.val();
            setIsAdmin(role === "admin");
          },
          { onlyOnce: true }
        );
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUsernames();
    fetchMessages(activeTab);
  }, [user, isAdmin, activeTab]);

  const fetchUsernames = () => {
    const usersRef = ref(database, `users`);
    onValue(
      usersRef,
      (snapshot) => {
        const usersData = snapshot.val();
        if (usersData) {
          const usernameMap = {};
          Object.entries(usersData).forEach(([userId, userData]) => {
            usernameMap[userId] = userData.name || "Unknown";
          });
          setUsernames(usernameMap);
        }
      },
      { onlyOnce: true }
    );
  };

  const fetchMessages = (tab) => {
    if (!user) return;

    setMessages([]);
    setErrorMessage("");

    if (isAdmin) {
      const usersRef = ref(database, `users`);
      onValue(
        usersRef,
        (snapshot) => {
          try {
            const usersData = snapshot.val();
            if (!usersData) {
              setMessages([]);
              return;
            }

            const allMessages = [];
            Object.entries(usersData).forEach(([userId, userData]) => {
              const messagesPath =
                tab === "received" ? "receivedMessages" : "sentMessages";
              const userMessages = userData[messagesPath] || {};
              Object.entries(userMessages).forEach(([key, value]) => {
                allMessages.push({
                  key,
                  userId,
                  username: userData.name || "Unknown",
                  ...value,
                });
              });
            });

            const sortedMessages = allMessages.sort((a, b) => {
              const timestampA = a.timestamp || a.createdAt || 0;
              const timestampB = b.timestamp || b.createdAt || 0;
              return timestampB - timestampA;
            });

            setMessages(sortedMessages);
          } catch (error) {
            console.error("Error fetching admin messages:", error);
            setErrorMessage("Failed to load messages. Please try again later.");
          }
        },
        (error) => {
          console.error("Database read error:", error);
          setErrorMessage("Failed to access messages. Check your permissions.");
        }
      );
    } else {
      const messagesPath =
        tab === "received" ? "receivedMessages" : "sentMessages";
      const messagesRef = ref(database, `users/${user.uid}/${messagesPath}`);

      onValue(
        messagesRef,
        (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const messagesArray = Object.entries(data)
                .map(([key, value]) => ({
                  key,
                  userId: user.uid,
                  username: usernames[user.uid] || "Unknown",
                  ...value,
                }))
                .sort((a, b) => {
                  const timestampA = a.timestamp || a.createdAt || 0;
                  const timestampB = b.timestamp || b.createdAt || 0;
                  return timestampB - timestampA;
                });
              setMessages(messagesArray);
            } else {
              setMessages([]);
            }
          } catch (error) {
            console.error("Error fetching messages:", error);
            setErrorMessage("Failed to load messages. Please try again later.");
          }
        },
        (error) => {
          console.error("Database read error:", error);
          setErrorMessage("Failed to access messages. Check your permissions.");
        }
      );
    }
  };

  const logActivity = (action, description) => {
    if (!user) return;

    const logRef = ref(database, `users/${user.uid}/activityLogs`);
    const logData = {
      action,
      description,
      timestamp: new Date().toISOString(),
      username: usernames[user.uid] || "Unknown",
      userId: user.uid,
    };

    push(logRef, logData).catch((error) => {
      console.error("Error logging activity:", error);
      setErrorMessage("Failed to log activity. Please try again.");
    });
  };

  const handleDelete = (message) => {
    if (
      !user ||
      !window.confirm("Are you sure you want to delete this message?")
    )
      return;
    setErrorMessage("");

    const messagesPath =
      activeTab === "received" ? "receivedMessages" : "sentMessages";
    const messageRef = ref(
      database,
      `users/${message.userId}/${messagesPath}/${message.key}`
    );

    remove(messageRef)
      .then(() => {
        logActivity("Delete", `Deleted message with ID: ${message.id}`);
        alert("Message deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
        setErrorMessage("Failed to delete message. Check your permissions.");
      });
  };

  const handleDownload = async (message) => {
    if (!message.fileUrl) {
      alert("No file available for download");
      return;
    }
    logActivity("View", `Viewed file for message with ID: ${message.id}`);
    try {
      window.open(message.fileUrl, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      setErrorMessage("Failed to download file. Please try again.");
    }
  };

  const handleEdit = (message) => {
    logActivity("View", `Viewed message with ID: ${message.id}`);
    setEditingMessage({ ...message });
    setFile(null);
    setErrorMessage("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!user || !editingMessage) return;

    const messagesPath =
      activeTab === "received" ? "receivedMessages" : "sentMessages";
    const messageRef = ref(
      database,
      `users/${editingMessage.userId}/${messagesPath}/${editingMessage.key}`
    );

    let updates = {
      id: editingMessage.id,
      [activeTab === "received" ? "sender" : "receiver"]:
        editingMessage[activeTab === "received" ? "sender" : "receiver"],
      description: editingMessage.description,
      timestamp:
        editingMessage.timestamp ||
        editingMessage.createdAt ||
        new Date().toISOString(),
      channel: editingMessage.channel || "N/A",
      type: editingMessage.type || "default",
      dateSent: editingMessage.dateSent || new Date().toISOString(),
    };

    if (file) {
      try {
        if (editingMessage.fileUrl) {
          const oldFileRef = storageRef(
            storage,
            `messageFiles/${editingMessage.userId}/${editingMessage.filename}`
          );
          await deleteObject(oldFileRef).catch((err) =>
            console.warn("Failed to delete old file:", err)
          );
        }

        const fileName = `${Date.now()}_${file.name}`;
        const fileRef = storageRef(
          storage,
          `messageFiles/${editingMessage.userId}/${fileName}`
        );
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);

        updates.fileUrl = fileUrl;
        updates.filename = fileName;
        updates.fileFormat = file.type.split("/")[1];
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage("Failed to upload file. Please try again.");
        return;
      }
    } else {
      if (editingMessage.fileUrl) {
        updates.fileUrl = editingMessage.fileUrl;
        updates.filename = editingMessage.filename;
        updates.fileFormat = editingMessage.fileFormat;
      }
    }

    update(messageRef, updates)
      .then(() => {
        logActivity("Edit", `Edited message with ID: ${editingMessage.id}`);
        alert("Message updated successfully!");
        setEditingMessage(null);
        setFile(null);
      })
      .catch((error) => {
        console.error("Error updating message:", error);
        setErrorMessage(
          "Permission denied: You may not have rights to update this message."
        );
      });
  };

  const filteredMessages = messages.filter((message) => {
    const searchableContent = `${message.sender || ""} ${
      message.receiver || ""
    } ${message.description || ""} ${message.id || ""} ${
      message.userId || ""
    } ${message.username || ""}`.toLowerCase();
    const matchesSearch = searchableContent.includes(searchTerm.toLowerCase());
    const matchesUsername = selectedUsername
      ? message.username === selectedUsername
      : true;
    return matchesSearch && matchesUsername;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please log in to access your messages
          </h1>
          <p>You need to be logged in to view your messages dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mt-10 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">Actions</h1>

        <main className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
              <nav className="flex flex-wrap">
                <button
                  onClick={() => setActiveTab("received")}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "received"
                      ? "bg-blue-100 text-blue-600 rounded-md"
                      : "text-gray-500 hover:text-gray-700"
                  } mr-2 mb-2`}
                >
                  Incoming Messages
                </button>
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "sent"
                      ? "bg-blue-100 text-blue-600 rounded-md"
                      : "text-gray-500 hover:text-gray-700"
                  } mb-2`}
                >
                  Outgoing Messages
                </button>
              </nav>
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg
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
                {isAdmin && (
                  <div className="w-64">
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={selectedUsername}
                      onChange={(e) => setSelectedUsername(e.target.value)}
                    >
                      <option value="">All Users</option>
                      {Object.values(usernames).map((username) => (
                        <option key={username} value={username}>
                          {username}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4"
                role="alert"
              >
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                    )}
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === "received" ? "Sender" : "Receiver"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message) => (
                      <tr
                        key={`${message.userId}-${message.key}`}
                        className="hover:bg-gray-50"
                      >
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {message.username}
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {message.userId}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {message.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {activeTab === "received"
                            ? message.sender
                            : message.receiver}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {message.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(message.timestamp || message.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {message.channel || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {message.fileUrl ? (
                            <div className="flex flex-col items-start">
                              {message.fileFormat &&
                              message.fileFormat
                                .toLowerCase()
                                .match(/png|jpg|jpeg|gif|svg/) ? (
                                <img
                                  src={message.fileUrl}
                                  alt={message.filename || "File"}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <div className="h-12 w-12 flex items-center justify-center bg-gray-200 rounded">
                                  <svg
                                    className="h-6 w-6 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                              <span className="text-xs mt-1 text-blue-600">
                                {message.filename || "File"}
                              </span>
                            </div>
                          ) : (
                            "No file"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <button
                            onClick={() => handleEdit(message)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(message)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Delete
                          </button>
                          {message.fileUrl && (
                            <button
                              onClick={() => handleDownload(message)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={isAdmin ? 9 : 7}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No messages found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {editingMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
            <form onSubmit={handleUpdate}>
              {isAdmin && (
                <div className="mb-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingMessage.username || ""}
                    onChange={(e) =>
                      setEditingMessage({
                        ...editingMessage,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {isAdmin && (
                <div className="mb-4">
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    User ID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingMessage.userId || ""}
                    onChange={(e) =>
                      setEditingMessage({
                        ...editingMessage,
                        userId: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID
                </label>
                <input
                  id="id"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editingMessage.id || ""}
                  onChange={(e) =>
                    setEditingMessage({ ...editingMessage, id: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="senderReceiver"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {activeTab === "received" ? "Sender" : "Receiver"}
                </label>
                <input
                  id="senderReceiver"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={
                    editingMessage[
                      activeTab === "received" ? "sender" : "receiver"
                    ] || ""
                  }
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      [activeTab === "received" ? "sender" : "receiver"]:
                        e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  value={editingMessage.description || ""}
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="timestamp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  id="timestamp"
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={
                    editingMessage.timestamp || editingMessage.createdAt
                      ? new Date(
                          editingMessage.timestamp || editingMessage.createdAt
                        )
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      timestamp: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="channel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Channel
                </label>
                <input
                  id="channel"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editingMessage.channel || ""}
                  onChange={(e) =>
                    setEditingMessage({
                      ...editingMessage,
                      channel: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  File/Image
                </label>
                {editingMessage.fileUrl && (
                  <div className="mb-2">
                    <p>Current File: {editingMessage.filename}</p>
                    {editingMessage.fileFormat &&
                      editingMessage.fileFormat
                        .toLowerCase()
                        .match(/png|jpg|jpeg|gif|svg/) && (
                        <img
                          src={editingMessage.fileUrl}
                          alt={editingMessage.filename}
                          className="h-20 w-20 object-cover rounded"
                        />
                      )}
                  </div>
                )}
                <input
                  id="file"
                  type="file"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setEditingMessage(null);
                    setFile(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionsPage;
