import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase"; // Assuming auth is exported from firebase.js

const database = getDatabase();

function ActivityLogsPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [selectedUsername, setSelectedUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const fetchUsernames = useCallback(() => {
    const usersRef = ref(database, `users`);
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usernameMap = {};
        Object.entries(usersData).forEach(([userId, userData]) => {
          usernameMap[userId] = userData.name || "Unknown";
        });
        setUsernames(usernameMap);
      } else {
        setUsernames({});
      }
    });
  }, []);

  const fetchLogs = useCallback(() => {
    if (!user) return;

    setLogs([]);
    setErrorMessage("");

    if (isAdmin) {
      const usersRef = ref(database, `users`);
      onValue(
        usersRef,
        (snapshot) => {
          try {
            const usersData = snapshot.val();
            if (!usersData) {
              console.log("No users data found for admin");
              setLogs([]);
              return;
            }

            const allLogs = [];
            Object.entries(usersData).forEach(([userId, userData]) => {
              const userLogs = userData.activityLogs || {};
              Object.entries(userLogs).forEach(([key, value]) => {
                allLogs.push({
                  key,
                  userId,
                  username: userData.name || "Unknown",
                  ...value,
                });
              });
            });

            const sortedLogs = allLogs.sort((a, b) => {
              const timestampA = a.timestamp || 0;
              const timestampB = b.timestamp || 0;
              return timestampB - timestampA;
            });

            console.log("Admin logs fetched:", sortedLogs);
            setLogs(sortedLogs);
          } catch (error) {
            console.error("Error fetching admin logs:", error);
            setErrorMessage("Failed to load logs. Please try again later.");
          }
        },
        (error) => {
          console.error("Database read error:", error);
          setErrorMessage("Failed to access logs. Check your permissions.");
        }
      );
    } else {
      const logsRef = ref(database, `users/${user.uid}/activityLogs`);
      onValue(
        logsRef,
        (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const logsArray = Object.entries(data)
                .map(([key, value]) => ({
                  key,
                  userId: user.uid,
                  username: usernames[user.uid] || "Unknown",
                  ...value,
                }))
                .sort((a, b) => {
                  const timestampA = a.timestamp || 0;
                  const timestampB = b.timestamp || 0;
                  return timestampB - timestampA;
                });
              console.log("User logs fetched:", logsArray);
              setLogs(logsArray);
            } else {
              console.log("No logs found for user:", user.uid);
              setLogs([]);
            }
          } catch (error) {
            console.error("Error fetching logs:", error);
            setErrorMessage("Failed to load logs. Please try again later.");
          }
        },
        (error) => {
          console.error("Database read error:", error);
          setErrorMessage("Failed to access logs. Check your permissions.");
        }
      );
    }
  }, [user, isAdmin, usernames]);

  useEffect(() => {
    if (!user) return;
    fetchUsernames();
    fetchLogs();
  }, [user, isAdmin, fetchUsernames, fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const searchableContent = `${log.action || ""} ${log.description || ""} ${
      log.userId || ""
    } ${log.username || ""}`.toLowerCase();
    const matchesSearch = searchableContent.includes(searchTerm.toLowerCase());
    const matchesUsername = selectedUsername
      ? log.username === selectedUsername
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
            Please log in to access your activity logs
          </h1>
          <p>You need to be logged in to view your activity logs dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mt-10 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">
          Activity Logs
        </h1>

        <main className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search logs..."
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
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr
                        key={`${log.userId}-${log.key}`}
                        className="hover:bg-gray-50"
                      >
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {log.username}
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {log.userId}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {log.action || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.description || "No description"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={isAdmin ? 5 : 3}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ActivityLogsPage;
