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
                // Create a unique log ID that combines user ID and log key
                const logId = `${userId.substring(0, 6)}-${key.substring(
                  0,
                  8
                )}`;

                allLogs.push({
                  key,
                  userId,
                  username: userData.name || "Unknown",
                  logId,
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
                .map(([key, value]) => {
                  // Create a unique log ID that combines user ID and log key
                  const logId = `${user.uid.substring(0, 6)}-${key.substring(
                    0,
                    8
                  )}`;

                  return {
                    key,
                    userId: user.uid,
                    username: usernames[user.uid] || "Unknown",
                    logId,
                    ...value,
                  };
                })
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
    } ${log.username || ""} ${log.logId || ""}`.toLowerCase();
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
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-4">
          Activity Logs
        </h1>

        <main className="bg-white rounded-xl shadow-lg">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row items-center sm:space-x-4">
            <div className="flex-1">
              <p className="text-sm sm:text-base text-gray-500">
                Search by log ID, action, or description
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm sm:text-base sm:w-64"
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
                <div className="w-full sm:w-64">
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
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
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 sm:mx-6 mt-4"
              role="alert"
            >
              <span className="block sm:inline text-sm sm:text-base">
                {errorMessage}
              </span>
            </div>
          )}

          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full min-w-[640px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Log ID
                  </th>
                  {isAdmin && (
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                  )}
                  {isAdmin && (
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                  )}
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-base font-mono text-gray-500">
                        {log.logId}
                      </td>
                      {isAdmin && (
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-base text-gray-500">
                          {log.username}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-base text-gray-500">
                          {log.userId}
                        </td>
                      )}
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-base font-medium text-gray-900">
                        {log.action || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-base text-gray-500">
                        {log.description || "No description"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm sm:text-base text-gray-500">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 3}
                      className="px-2 sm:px-4 py-2 sm:py-4 text-center text-sm sm:text-base text-gray-500"
                    >
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ActivityLogsPage;
