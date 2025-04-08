import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";

const database = getDatabase(app);
const auth = getAuth(app);

const SideBySideMessageTables = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState("daily");
  const [topSenders, setTopSenders] = useState([]);
  const [topReceivers, setTopReceivers] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageActivityData, setMessageActivityData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkAdminStatus(user.uid);

        // First try to use displayName if available
        if (user.displayName) {
          setUserName(user.displayName);
        } else {
          // Otherwise fetch the name from the user profile in the database
          const userRef = ref(database, `users/${user.uid}/profile`);
          onValue(userRef, (snapshot) => {
            const profileData = snapshot.val();
            if (profileData && profileData.name) {
              setUserName(profileData.name);
            } else {
              // Fallback to email if no name is found
              setUserName(user.email?.split("@")[0] || "User");
            }
          });
        }

        fetchMessages(user.uid);
        fetchOnlineUsers();
      } else {
        setUser(null);
        setUserName("");
        setIsAdmin(false);
        setReceivedMessages([]);
        setSentMessages([]);
        setTopSenders([]);
        setTopReceivers([]);
        setOnlineUsers([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages(selectedUser ? selectedUser.uid : user.uid);
      generateActivityData();
    }
  }, [timeframe, user, selectedUser]);

  const checkAdminStatus = (uid) => {
    const adminRef = ref(database, `users/${uid}/role`);
    onValue(adminRef, (snapshot) => {
      const role = snapshot.val();
      setIsAdmin(role === "admin");
    });
  };

  const fetchOnlineUsers = () => {
    const onlineStatusRef = ref(database, "users");
    onValue(onlineStatusRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersArray = Object.entries(usersData).map(([uid, userData]) => ({
          uid,
          name:
            userData.profile?.name ||
            userData.email?.split("@")[0] ||
            "Unknown User",
          email: userData.email || "",
          online: userData.online || false,
          lastSeen: userData.lastSeen || null,
          role: userData.role || "user",
        }));
        setOnlineUsers(usersArray);
      } else {
        setOnlineUsers([]);
      }
    });
  };

  const getTimeframeDate = () => {
    const today = new Date();
    const startDate = new Date(today);

    if (timeframe === "daily") startDate.setHours(0, 0, 0, 0);
    else if (timeframe === "weekly") startDate.setDate(today.getDate() - 7);
    else if (timeframe === "monthly") startDate.setMonth(today.getMonth() - 1);

    return startDate;
  };

  const generateActivityData = () => {
    const startDate = getTimeframeDate();
    const endDate = new Date();

    // Create data points based on timeframe
    let dataPoints = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString();
      const receivedCount = countMessagesOnDate(receivedMessages, currentDate);
      const sentCount = countMessagesOnDate(sentMessages, currentDate);

      dataPoints.push({
        date: dateStr,
        received: receivedCount,
        sent: sentCount,
      });

      // Increment based on timeframe
      if (timeframe === "daily") {
        // For daily view, use hourly increments
        currentDate.setHours(currentDate.getHours() + 2);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    setMessageActivityData(dataPoints);
  };

  const countMessagesOnDate = (messages, date) => {
    // Count messages that fall within the same date or hour depending on timeframe
    return messages.filter((message) => {
      const messageDate = new Date(message.timestamp);
      if (timeframe === "daily") {
        return (
          messageDate.getDate() === date.getDate() &&
          messageDate.getMonth() === date.getMonth() &&
          messageDate.getFullYear() === date.getFullYear() &&
          messageDate.getHours() === date.getHours()
        );
      } else {
        return (
          messageDate.getDate() === date.getDate() &&
          messageDate.getMonth() === date.getMonth() &&
          messageDate.getFullYear() === date.getFullYear()
        );
      }
    }).length;
  };

  const fetchMessages = (userId) => {
    const today = new Date();
    const startDate = getTimeframeDate();

    const receivedRef = ref(database, `users/${userId}/receivedMessages`);
    onValue(
      receivedRef,
      (snapshot) => {
        const data = snapshot.val();
        let receivedMessageArray = [];

        if (data) {
          receivedMessageArray = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              messageId: key,
              sender: value.sender,
              type: value.type,
              description: value.description,
              timestamp: value.timestamp,
              staffName: value.staffName,
            }))
            .filter((message) => {
              const messageDate = new Date(message.timestamp);
              return messageDate >= startDate && messageDate <= today;
            });

          setReceivedMessages(receivedMessageArray);

          const senderCounts = {};
          receivedMessageArray.forEach((message) => {
            senderCounts[message.sender] =
              (senderCounts[message.sender] || 0) + 1;
          });

          const sortedSenders = Object.entries(senderCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([sender, count]) => ({ name: sender, count }));

          setTopSenders(sortedSenders);
        } else {
          setReceivedMessages([]);
          setTopSenders([]);
        }

        const sentRef = ref(database, `users/${userId}/sentMessages`);
        onValue(
          sentRef,
          (snapshot) => {
            const data = snapshot.val();
            let sentMessageArray = [];

            if (data) {
              sentMessageArray = Object.entries(data)
                .map(([key, value]) => ({
                  id: key,
                  messageId: key,
                  receiver: value.receiver,
                  type: value.type,
                  description: value.description,
                  timestamp: value.timestamp,
                  staffName: value.staffName,
                }))
                .filter((message) => {
                  const messageDate = new Date(message.timestamp);
                  return messageDate >= startDate && messageDate <= today;
                });

              setSentMessages(sentMessageArray);

              const receiverCounts = {};
              sentMessageArray.forEach((message) => {
                receiverCounts[message.receiver] =
                  (receiverCounts[message.receiver] || 0) + 1;
              });

              const sortedReceivers = Object.entries(receiverCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([receiver, count]) => ({ name: receiver, count }));

              setTopReceivers(sortedReceivers);
            } else {
              setSentMessages([]);
              setTopReceivers([]);
            }

            generateActivityData();
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

  const formatCurrentDateTime = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
  };

  const OnlineUsersCard = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Online Users</h2>
      </div>
      <div className="p-2 overflow-y-auto max-h-96">
        {onlineUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users available
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {onlineUsers.map((onlineUser) => (
              <li
                key={onlineUser.uid}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedUser?.uid === onlineUser.uid ? "bg-indigo-50" : ""
                }`}
                onClick={() => (isAdmin ? handleUserSelect(onlineUser) : null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        onlineUser.online ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-800">
                      {onlineUser.name}
                      {onlineUser.role === "admin" && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          Admin
                        </span>
                      )}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserSelect(onlineUser);
                      }}
                    >
                      View
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {onlineUser.online
                    ? "Currently online"
                    : onlineUser.lastSeen
                    ? `Last seen: ${new Date(
                        onlineUser.lastSeen
                      ).toLocaleString()}`
                    : "Last seen: Unknown"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isAdmin && selectedUser && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <button
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors text-sm font-medium"
            onClick={() => setSelectedUser(null)}
          >
            Back to My Data
          </button>
        </div>
      )}
    </div>
  );

  const MessageAnalytics = () => (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-lg shadow">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
          {isAdmin && selectedUser && (
            <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              Viewing: {selectedUser.name}
            </span>
          )}
        </div>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              timeframe === "daily"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTimeframe("daily")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              timeframe === "weekly"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTimeframe("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              timeframe === "monthly"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTimeframe("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
            <h3 className="text-sm uppercase font-semibold text-indigo-700 mb-1">
              Incoming
            </h3>
            <p className="text-3xl font-bold text-indigo-800">
              {receivedMessages.length}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 shadow-sm">
            <h3 className="text-sm uppercase font-semibold text-emerald-700 mb-1">
              Outgoing
            </h3>
            <p className="text-3xl font-bold text-emerald-800">
              {sentMessages.length}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">
              Top Senders
            </h3>
            {topSenders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">
                No data available
              </p>
            ) : (
              <div className="flex flex-col space-y-1">
                {topSenders.slice(0, 3).map((sender, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="font-medium text-gray-700 truncate max-w-[70%]">
                      {sender.name}
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      {sender.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">
              Top Receivers
            </h3>
            {topReceivers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">
                No data available
              </p>
            ) : (
              <div className="flex flex-col space-y-1">
                {topReceivers.slice(0, 3).map((receiver, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="font-medium text-gray-700 truncate max-w-[70%]">
                      {receiver.name}
                    </span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      {receiver.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Message Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messageActivityData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Received"
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Sent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const ReceivedMessagesTable = ({ title, messages }) => (
    <div className="w-full bg-gray-200 rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50">
            No received messages{" "}
            {timeframe === "daily"
              ? "today"
              : timeframe === "weekly"
              ? "this week"
              : "this month"}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="py-3 px-4 text-left font-semibold">No</th>
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Sender</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Description
                </th>
                <th className="py-3 px-4 text-left font-semibold">Timestamp</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Staff Name
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr
                  key={message.id}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-800">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                    {message.messageId.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {message.sender}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {message.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-xs truncate">
                    {message.description}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {formatTimestamp(message.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {message.staffName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const SentMessagesTable = ({ title, messages }) => (
    <div className="w-full bg-gray-200 rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50">
            No sent messages{" "}
            {timeframe === "daily"
              ? "today"
              : timeframe === "weekly"
              ? "this week"
              : "this month"}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="py-3 px-4 text-left font-semibold">No</th>
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Receiver</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Description
                </th>
                <th className="py-3 px-4 text-left font-semibold">Timestamp</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Staff Name
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr
                  key={message.id}
                  className="border-b border-gray-100 hover:bg-emerald-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-800">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                    {message.messageId.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {message.receiver}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {message.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-xs truncate">
                    {message.description}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {formatTimestamp(message.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {message.staffName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen flex flex-col bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">
            Welcome back, {userName}!
            {isAdmin && (
              <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Admin
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Record your communications with us.
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-gray-700">
            {formatCurrentDateTime(currentDateTime)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="w-full md:w-3/4">
              <MessageAnalytics />
            </div>
            <div className="w-full md:w-1/4">
              <OnlineUsersCard />
            </div>
          </div>
          <div className="space-y-6">
            <ReceivedMessagesTable
              title={`Messages Received ${
                isAdmin && selectedUser ? `(${selectedUser.name})` : ""
              } (${
                timeframe === "daily"
                  ? "Today"
                  : timeframe === "weekly"
                  ? "This Week"
                  : "This Month"
              })`}
              messages={receivedMessages}
            />
            <SentMessagesTable
              title={`Messages Sent ${
                isAdmin && selectedUser ? `(${selectedUser.name})` : ""
              } (${
                timeframe === "daily"
                  ? "Today"
                  : timeframe === "weekly"
                  ? "This Week"
                  : "This Month"
              })`}
              messages={sentMessages}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SideBySideMessageTables;
