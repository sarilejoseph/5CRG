import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import jsPDF from "jspdf";
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
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("received");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [viewMode, setViewMode] = useState("individual");
  const [allUsersData, setAllUsersData] = useState([]);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

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
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const filters = {
        today: (d) =>
          new Date(d.timestamp).toDateString() === startOfToday.toDateString(),
        thisWeek: (d) =>
          new Date(d.timestamp) >=
          new Date(today.setDate(today.getDate() - today.getDay())),
        lastWeek: (d) => {
          const startOfLastWeek = new Date(
            today.setDate(today.getDate() - today.getDay() - 7)
          );
          const endOfLastWeek = new Date(
            today.setDate(today.getDate() - today.getDay() + 6)
          );
          const timestamp = new Date(d.timestamp);
          return timestamp >= startOfLastWeek && timestamp <= endOfLastWeek;
        },
        twoWeeksAgo: (d) => {
          const startOfTwoWeeksAgo = new Date(
            today.setDate(today.getDate() - today.getDay() - 14)
          );
          const endOfTwoWeeksAgo = new Date(
            today.setDate(today.getDate() - today.getDay() - 8)
          );
          const timestamp = new Date(d.timestamp);
          return (
            timestamp >= startOfTwoWeeksAgo && timestamp <= endOfTwoWeeksAgo
          );
        },
        thisMonth: (d) =>
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
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const filters = {
        today: (m) =>
          new Date(m.timestamp).toDateString() === startOfToday.toDateString(),
        thisWeek: (m) =>
          new Date(m.timestamp) >=
          new Date(today.setDate(today.getDate() - today.getDay())),
        lastWeek: (m) => {
          const startOfLastWeek = new Date(
            today.setDate(today.getDate() - today.getDay() - 7)
          );
          const endOfLastWeek = new Date(
            today.setDate(today.getDate() - today.getDay() + 6)
          );
          const timestamp = new Date(m.timestamp);
          return timestamp >= startOfLastWeek && timestamp <= endOfLastWeek;
        },
        twoWeeksAgo: (m) => {
          const startOfTwoWeeksAgo = new Date(
            today.setDate(today.getDate() - today.getDay() - 14)
          );
          const endOfTwoWeeksAgo = new Date(
            today.setDate(today.getDate() - today.getDay() - 8)
          );
          const timestamp = new Date(m.timestamp);
          return (
            timestamp >= startOfTwoWeeksAgo && timestamp <= endOfTwoWeeksAgo
          );
        },
        thisMonth: (m) =>
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

  const generatePDFContent = (section) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 10;

    // Adding left logo (crs.png)
    try {
      doc.addImage(crs, "PNG", margin, 5, 15, 15);
    } catch (error) {
      console.error("Error adding left logo:", error);
    }

    // Adding right logo (crg.png)
    try {
      doc.addImage(crg, "PNG", pageWidth - margin - 15, 5, 15, 15);
    } catch (error) {
      console.error("Error adding right logo:", error);
    }

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(171, 172, 173);
    doc.text(
      "AFP Vision 2028: A World-Class Armed Forces, Source of National Pride",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 6;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("HEADQUARTERS", pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("5th CIVIL RELATIONS GROUP", pageWidth / 2, y, {
      align: "center",
    });
    y += 6;

    doc.text("CIVIL RELATIONS SERVICE AFP", pageWidth / 2, y, {
      align: "center",
    });
    y += 6;

    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text(
      "Naval Station Felix Apolinario, Panacan, Davao City",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 6;

    doc.setFontSize(10);
    doc.text(
      "crscrs@gmail.com LAN: 8888 Cel No: 0917-153-7433",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 6;

    doc.setLineWidth(0.3);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.setFont("helvetica", "bold");
    doc.text(
      section === "receivedMessagesTable"
        ? "Received Messages History"
        : section === "sentMessagesTable"
        ? "Sent Messages History"
        : "All Users Messages History",
      margin,
      y
    );
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
    y += 6;

    doc.text(
      `Time Filter: ${
        timeFilter === "today"
          ? "Today"
          : timeFilter === "thisWeek"
          ? "This Week"
          : timeFilter === "lastWeek"
          ? "Last Week"
          : timeFilter === "twoWeeksAgo"
          ? "Two Weeks Ago"
          : timeFilter === "thisMonth"
          ? "This Month"
          : "All Time"
      }`,
      margin,
      y
    );
    y += 6;

    doc.text(
      `Type Filter: ${typeFilter === "all" ? "All Types" : typeFilter}`,
      margin,
      y
    );
    y += 6;

    if (viewMode === "all") {
      doc.text("Aggregated data for all users", margin, y);
      y += 6;
    }

    let columns, columnWidths, messages;
    if (section === "receivedMessagesTable") {
      columns = [
        "From",
        "Type",
        "ID",
        "Subject",
        "Date Sent",
        "Date Received",
        "Channel",
        "Format",
        "Attachment",
      ];
      columnWidths = [22, 18, 18, 28, 23, 23, 18, 18, 22];
      messages = filteredReceivedMessages;
    } else if (section === "sentMessagesTable") {
      columns = [
        "To",
        "Type",
        "ID",
        "Subject",
        "Date Sent",
        "Channel",
        "Format",
        "Attachment",
      ];
      columnWidths = [27, 18, 18, 28, 23, 18, 18, 22];
      messages = filteredSentMessages;
    } else {
      columns = [
        "User",
        "Direction",
        activeTab === "received" ? "From" : "To",
        "Type",
        "Subject",
        "Date",
        "Attachment",
      ];
      columnWidths = [30, 20, 30, 20, 30, 25, 27];
      messages = filterAllUsersData();
    }

    const startX = margin;
    const baseRowHeight = 8;
    const fontSize = 8;
    const lineHeight = 4;
    const maxLinesPerCell = 3;

    doc.setFontSize(fontSize);
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    let x = startX;
    columns.forEach((col, index) => {
      doc.rect(x, y, columnWidths[index], baseRowHeight, "F");
      try {
        const headerLines = doc.splitTextToSize(
          col.toUpperCase(),
          columnWidths[index] - 4
        );
        headerLines.slice(0, maxLinesPerCell).forEach((line, i) => {
          doc.text(line, x + 2, y + 4 + i * lineHeight);
        });
      } catch (error) {
        console.error(`Error rendering header ${col}:`, error);
        doc.text(col.toUpperCase().substring(0, 10), x + 2, y + 4);
      }
      x += columnWidths[index];
    });
    y += baseRowHeight;

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    messages.forEach((message, index) => {
      x = startX;
      const rowData =
        section === "receivedMessagesTable"
          ? [
              message.sender || message.staffName || "System",
              message.communicationType || message.type || "Unknown",
              message.documentId || message.id || "-",
              message.subject || message.description || "-",
              formatTimestamp(message.dateSent || message.timestamp),
              formatTimestamp(message.dateReceived || message.timestamp),
              message.channel || "Unknown",
              message.fileFormat || "Unknown",
              message.fileUrl ? "File Attached" : "-",
            ]
          : section === "sentMessagesTable"
          ? [
              message.receiver || "-",
              message.communicationType || message.type || "Unknown",
              message.documentId || message.id || "-",
              message.subject || message.description || "-",
              formatTimestamp(message.dateSent || message.timestamp),
              message.channel || "Unknown",
              message.fileFormat || "Unknown",
              message.fileUrl ? "File Attached" : "-",
            ]
          : [
              message.userName || "-",
              message.messageType || "-",
              message.messageType === "received"
                ? message.sender || "System"
                : message.receiver || "-",
              message.type || "Unknown",
              message.subject || "-",
              formatTimestamp(message.timestamp),
              message.fileUrl ? "File Attached" : "-",
            ];

      let maxLines = 1;
      const wrappedTexts = rowData.map((cell, i) => {
        try {
          const text = cell.length > 20 ? cell.substring(0, 17) + "..." : cell;
          const lines = doc.splitTextToSize(text, columnWidths[i] - 4);
          maxLines = Math.max(
            maxLines,
            Math.min(lines.length, maxLinesPerCell)
          );
          return lines.slice(0, maxLinesPerCell);
        } catch (error) {
          console.error(`Error wrapping text for cell ${i}:`, error);
          return [cell.substring(0, 10)];
        }
      });
      const rowHeight = maxLines * lineHeight;

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(startX, y, pageWidth - 2 * margin, rowHeight, "F");
      }

      wrappedTexts.forEach((lines, i) => {
        lines.forEach((line, j) => {
          doc.text(line, x + 2, y + 4 + j * lineHeight);
        });
        x += columnWidths[i];
      });

      x = startX;
      rowData.forEach((_, i) => {
        doc.setDrawColor(226, 232, 240);
        doc.rect(x, y, columnWidths[i], rowHeight);
        x += columnWidths[i];
      });

      y += rowHeight;

      if (y > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = 10;
        y += 5;
        doc.setFontSize(12);
        doc.setTextColor(171, 172, 173);
        doc.text(
          "AFP Vision 2028: A World-Class Armed Forces, Source of National Pride",
          pageWidth / 2,
          y,
          { align: "center" }
        );
        y += 6;
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("HEADQUARTERS", pageWidth / 2, y, { align: "center" });
        y += 8;
        doc.setFontSize(16);
        doc.text("5th CIVIL RELATIONS GROUP", pageWidth / 2, y, {
          align: "center",
        });
        y += 6;
        doc.text("CIVIL RELATIONS SERVICE AFP", pageWidth / 2, y, {
          align: "center",
        });
        y += 6;
        doc.setFontSize(12);
        doc.setTextColor(108, 117, 125);
        doc.text(
          "Naval Station Felix Apolinario, Panacan, Davao City",
          pageWidth / 2,
          y,
          { align: "center" }
        );
        y += 6;
        doc.setFontSize(10);
        doc.text(
          "crscrs@gmail.com LAN: 8888 Cel No: 0917-153-7433",
          pageWidth / 2,
          y,
          { align: "center" }
        );
        y += 6;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        x = startX;
        doc.setFontSize(fontSize);
        doc.setFillColor(59, 130, 246);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        columns.forEach((col, index) => {
          doc.rect(x, y, columnWidths[index], baseRowHeight, "F");
          try {
            const headerLines = doc.splitTextToSize(
              col.toUpperCase(),
              columnWidths[index] - 4
            );
            headerLines.slice(0, maxLinesPerCell).forEach((line, i) => {
              doc.text(line, x + 2, y + 4 + i * lineHeight);
            });
          } catch (error) {
            console.error(`Error rendering header ${col} on new page:`, error);
            doc.text(col.toUpperCase().substring(0, 10), x + 2, y + 4);
          }
          x += columnWidths[index];
        });
        y += baseRowHeight;
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
      }
    });

    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(
      `Generated by: User ID - ${user?.uid || "Unknown"}${
        user?.email ? ` | Email - ${user?.email}` : ""
      }`,
      pageWidth / 2,
      y,
      { align: "center" }
    );

    return doc;
  };

  const handlePrint = (section) => {
    const printContent = document.getElementById(section);
    if (!printContent) {
      console.error(`Print content element with ID "${section}" not found`);
      alert("Error: Could not find report content to print.");
      return;
    }

    const preloadImages = (urls) => {
      const promises = urls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve(url);
          img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            resolve(url);
          };
        });
      });
      return Promise.all(promises);
    };

    const imageUrls = [crs, crg];
    const messages =
      section === "receivedMessagesTable"
        ? filteredReceivedMessages
        : section === "sentMessagesTable"
        ? filteredSentMessages
        : filterAllUsersData();
    messages.forEach((message) => {
      if (message.fileUrl && message.fileFormat?.match(/png|jpg|jpeg/i)) {
        imageUrls.push(message.fileUrl);
      }
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Failed to open print window. Check pop-up blocker.");
      alert("Unable to open print window. Please allow pop-ups for this site.");
      return;
    }

    preloadImages(imageUrls)
      .then(() => {
        printWindow.document.write(`
          <html>
            <head>
              <title>Message History Report</title>
              <style>
                body { 
                  font-family: Arial, Helvetica, sans-serif;
                  color: #1e293b;
                  line-height: 1.6;
                  margin: 20px;
                  font-size: 14px;
                }
                .official-header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 10px;
                  position: relative;
                }
                .vision-text {
                  color: rgb(171, 172, 173);
                  font-size: 12px;
                  margin-bottom: 4px;
                }
                .main-title {
                  font-size: 20px;
                  font-weight: 700;
                  color: rgb(0, 0, 0);
                  margin: 8px 0;
                  letter-spacing: 0.5px;
                }
                .subtitle {
                  font-size: 16px;
                  font-weight: 600;
                  color: rgb(0, 0, 0);
                  margin: 4px 0;
                }
                .address-text {
                  font-size: 12px;
                  color: #6c757d;
                  margin: 4px 0;
                }
                .contact-text {
                  font-size: 10px;
                  color: #6c757d;
                }
                .logo-left, .logo-right {
                  position: absolute;
                  top: 10px;
                  width: 50px;
                  height: 50px;
                }
                .logo-left { left: 0; }
                .logo-right { right: 0; }
                table { 
                  width: 100%; 
                  border-collapse: collapse;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  border-radius: 6px;
                  overflow: hidden;
                  margin-bottom: 20px;
                }
                th, td { 
                  border: none;
                  padding: 8px 12px;
                  text-align: left;
                  font-size: 12px;
                }
                th { 
                  background-color: #3b82f6;
                  color: white;
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 10px;
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
                  margin-bottom: 15px;
                }
                h1 { 
                  color: #1e40af;
                  font-weight: 700;
                  margin-bottom: 8px;
                  font-size: 18px;
                }
                p {
                  color: #64748b;
                  font-size: 12px;
                }
                .footer {
                  margin-top: 20px;
                  padding-top: 10px;
                  border-top: 1px solid #e2e8f0;
                  text-align: center;
                  font-size: 10px;
                  color: #6c757d;
                }
                img {
                  max-width: 80px;
                  max-height: 80px;
                  object-fit: contain;
                  display: block;
                }
                td:last-child {
                  width: 100px;
                }
                @media print {
                  body { margin: 10mm; font-size: 12px; }
                  .logo-left, .logo-right { width: 40px; height: 40px; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  th, td { padding: 6px 10px; }
                  img { max-width: 60px; max-height: 60px; }
                }
                @media screen and (max-width: 600px) {
                  body { margin: 10px; font-size: 12px; }
                  th, td { padding: 6px 8px; font-size: 10px; }
                  .logo-left, .logo-right { width: 40px; height: 40px; }
                  h1 { font-size: 16px; }
                  .main-title { font-size: 18px; }
                  .subtitle { font-size: 14px; }
                }
              </style>
            </head>
            <body>
              <div class="official-header">
                <img src="${crs}" alt="AFP Logo" class="logo-left" onerror="this.style.display='none'">
                <div class="vision-text">AFP Vision 2028: A World-Class Armed Forces, Source of National Pride</div>
                <div class="main-title">HEADQUARTERS</div>
                <div class="subtitle">5<sup>th</sup> CIVIL RELATIONS GROUP</div>
                <div class="subtitle">CIVIL RELATIONS SERVICE AFP</div>
                <div class="address-text">Naval Station Felix Apolinario, Panacan, Davao City</div>
                <div class="contact-text">crscrs@gmail.com LAN: 8888 Cel No: 0917-153-7433</div>
                <img src="${crg}" alt="Civil Relations Service Logo" class="logo-right" onerror="this.style.display='none'">
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
                ${
                  viewMode === "all"
                    ? "<p>Aggregated data for all users</p>"
                    : ""
                }
              </div>
              ${printContent.outerHTML.replace(
                /<a[^>]*>View File<\/a>/g,
                "File Attached"
              )}
              <div class="footer">
                <p>Generated by: User ID - ${user?.uid || "Unknown"}${
          user?.email ? ` | Email - ${user?.email}` : ""
        }</p>
              </div>
              <script>
                setTimeout(() => {
                  if (document.readyState === 'complete') {
                    window.print();
                  }
                }, 1000);
                window.onafterprint = () => {
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      })
      .catch((error) => {
        console.error("Error preloading images:", error);
        printWindow.close();
        alert("Failed to load report content. Please try again.");
      });
  };

  const handleDownloadPDF = (section) => {
    try {
      const doc = generatePDFContent(section);
      doc.save(
        `${
          section === "receivedMessagesTable"
            ? "Received_Messages"
            : section === "sentMessagesTable"
            ? "Sent_Messages"
            : "All_Users_Messages"
        }_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const doc = await generatePDFContent();
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewContent(pdfUrl);
      setShowPreview(true);
      // Clean up the URL after the preview is closed
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      alert("Failed to generate PDF preview. Check console for details.");
    }
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
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-4">
          Records & Reports
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {isAdmin && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">
                  View Mode
                </p>
                <div className="inline-flex rounded-lg overflow-hidden">
                  <button
                    className={`px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200 ${
                      viewMode === "individual"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } rounded-l-lg border border-gray-300`}
                    onClick={() => toggleViewMode("individual")}
                  >
                    Individual
                  </button>
                  <button
                    className={`px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200 ${
                      viewMode === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } rounded-r-lg border border-gray-300`}
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
                  className="w-full sm:w-auto p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
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
          <div className="p-4 sm:p-6">
            <nav className="flex flex-wrap gap-4 sm:gap-6 border-b">
              <button
                className={`pb-2 text-sm sm:text-base font-medium transition-colors duration-200 ${
                  activeTab === "received"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
                onClick={() => setActiveTab("received")}
              >
                Incoming
              </button>
              <button
                className={`pb-2 text-sm sm:text-base font-medium transition-colors duration-200 ${
                  activeTab === "sent"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
                onClick={() => setActiveTab("sent")}
              >
                Outgoing
              </button>
            </nav>

            <div className="flex flex-col sm:flex-row justify-between py-4 gap-4">
              <select
                className="p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="twoWeeksAgo">Two Weeks Ago</option>
                <option value="thisMonth">This Month</option>
                <option value="all">All Time</option>
              </select>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="relative">
                  <button
                    className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors duration-200 w-full sm:w-auto"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v3.172a1 1 0 01-.293.707l-2 2A1 1 0 0110 20v-3.172a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                      />
                    </svg>
                    Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white rounded-lg shadow-lg z-10">
                      <button
                        className={`w-full text-left p-2 text-sm sm:text-base font-medium ${
                          typeFilter === "all"
                            ? "text-indigo-600 bg-gray-100"
                            : "text-gray-700 hover:bg-gray-100"
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
                          className={`w-full text-left p-2 text-sm sm:text-base font-medium ${
                            typeFilter === type
                              ? "text-indigo-600 bg-gray-100"
                              : "text-gray-700 hover:bg-gray-100"
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
                <button
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition-colors duration-200 w-full sm:w-auto"
                  onClick={() =>
                    handlePrint(
                      viewMode === "all"
                        ? "allUsersMessagesTable"
                        : `${activeTab}MessagesTable`
                    )
                  }
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
                <div className="relative">
                  <button
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition-colors duration-200 w-full sm:w-auto"
                    onClick={() =>
                      handlePreviewPDF(
                        viewMode === "all"
                          ? "allUsersMessagesTable"
                          : `${activeTab}MessagesTable`
                      )
                    }
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    PDF Preview
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition-colors duration-200"
                      onClick={() =>
                        handleDownloadPDF(
                          viewMode === "all"
                            ? "allUsersMessagesTable"
                            : `${activeTab}MessagesTable`
                        )
                      }
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                    <button
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors duration-200"
                      onClick={() => setShowPreview(false)}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Close
                    </button>
                  </div>
                </div>
                <iframe
                  src={previewContent}
                  className="w-full h-full rounded-lg"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16 sm:py-32">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 overflow-x-auto">
              {viewMode === "individual" && (
                <>
                  <div
                    className={activeTab === "received" ? "block" : "hidden"}
                    id="receivedMessagesTable"
                  >
                    {filteredReceivedMessages.length === 0 ? (
                      <div className="text-center py-12 text-sm sm:text-base">
                        No received messages
                      </div>
                    ) : (
                      <table className="w-full min-w-[640px] border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              From
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Type
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              ID
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Subject
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Date Sent
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Date Received
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Channel
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Format
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Attachment
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReceivedMessages.map((message) => (
                            <tr key={message.id}>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.sender ||
                                  message.staffName ||
                                  "System"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.communicationType || message.type}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.documentId || message.id}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.subject || message.description}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {formatTimestamp(
                                  message.dateSent || message.timestamp
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {formatTimestamp(
                                  message.dateReceived || message.timestamp
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.channel || "Unknown"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.fileFormat || "Unknown"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.fileUrl ? (
                                  message.fileFormat.toLowerCase() === "png" ||
                                  message.fileFormat.toLowerCase() === "jpg" ||
                                  message.fileFormat.toLowerCase() ===
                                    "jpeg" ? (
                                    <img
                                      src={message.fileUrl}
                                      alt="Attachment"
                                      className="w-16 sm:w-20 h-16 sm:h-20 object-cover"
                                    />
                                  ) : (
                                    <a
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline text-xs sm:text-sm"
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
                      <div className="text-center py-12 text-sm sm:text-base">
                        No sent messages
                      </div>
                    ) : (
                      <table className="w-full min-w-[640px] border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              To
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Type
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              ID
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Subject
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Date Sent
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Channel
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Format
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                              Attachment
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSentMessages.map((message) => (
                            <tr key={message.id}>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.receiver}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.communicationType || message.type}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.documentId || message.id}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.subject || message.description}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {formatTimestamp(
                                  message.dateSent || message.timestamp
                                )}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.channel || "Unknown"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.fileFormat || "Unknown"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                                {message.fileUrl ? (
                                  message.fileFormat.toLowerCase() === "png" ||
                                  message.fileFormat.toLowerCase() === "jpg" ||
                                  message.fileFormat.toLowerCase() ===
                                    "jpeg" ? (
                                    <img
                                      src={message.fileUrl}
                                      alt="Attachment"
                                      className="w-16 sm:w-20 h-16 sm:h-20 object-cover"
                                    />
                                  ) : (
                                    <a
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline text-xs sm:text-sm"
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
                    <div className="text-center py-12 text-sm sm:text-base">
                      No messages
                    </div>
                  ) : (
                    <table className="w-full min-w-[640px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            User
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            Direction
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            {activeTab === "received" ? "From" : "To"}
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            Type
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            Subject
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            Date
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left">
                            Attachment
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterAllUsersData().map((message) => (
                          <tr key={message.id + message.userId}>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {message.userName}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {message.messageType}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {message.messageType === "received"
                                ? message.sender || "System"
                                : message.receiver}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {message.type}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {message.subject}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {formatTimestamp(message.timestamp)}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                              {message.fileUrl ? (
                                message.fileFormat.toLowerCase() === "png" ||
                                message.fileFormat.toLowerCase() === "jpg" ||
                                message.fileFormat.toLowerCase() === "jpeg" ? (
                                  <img
                                    src={message.fileUrl}
                                    alt="Attachment"
                                    className="w-16 sm:w-20 h-16 sm:h-20 object-cover"
                                  />
                                ) : (
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline text-xs sm:text-sm"
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
