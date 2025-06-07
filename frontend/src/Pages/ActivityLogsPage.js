import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";
import { auth } from "../firebase";
import jsPDF from "jspdf";
import crs from "../Assets/crs.png";
import crg from "../Assets/logo.png";

const database = getDatabase();

function ActivityLogsPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [selectedLogs, setSelectedLogs] = useState([]);

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
        const usersList = Object.entries(usersData).map(
          ([userId, userData]) => ({
            uid: userId,
            name: userData.name || "Unknown",
            email: userData.email || "No email",
          })
        );
        setAllUsers(usersList);
      } else {
        setAllUsers([]);
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
                  const logId = `${user.uid.substring(0, 6)}-${key.substring(
                    0,
                    8
                  )}`;
                  return {
                    key,
                    userId: user.uid,
                    username:
                      allUsers.find((u) => u.uid === user.uid)?.name ||
                      "Unknown",
                    logId,
                    ...value,
                  };
                })
                .sort((a, b) => {
                  const timestampA = a.timestamp || 0;
                  const timestampB = b.timestamp || 0;
                  return timestampB - timestampA;
                });
              setLogs(logsArray);
            } else {
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
  }, [user, isAdmin, allUsers]);

  useEffect(() => {
    if (!user) return;
    fetchUsernames();
    fetchLogs();
  }, [user, isAdmin, fetchUsernames, fetchLogs]);

  const handleClearSelected = async () => {
    if (selectedLogs.length === 0) {
      setErrorMessage("No logs selected for deletion.");
      return;
    }

    try {
      for (const log of selectedLogs) {
        if (!isAdmin && log.userId !== user.uid) {
          setErrorMessage("You can only delete your own logs.");
          return;
        }
        const logRef = ref(
          database,
          `users/${log.userId}/activityLogs/${log.key}`
        );
        await remove(logRef);
      }
      setSelectedLogs([]);
      setErrorMessage("Selected logs cleared successfully.");
      fetchLogs();
    } catch (error) {
      console.error("Error clearing logs:", error);
      setErrorMessage("Failed to clear logs. Please try again.");
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all logs? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      if (isAdmin && viewMode === "all") {
        // Admin clearing all users' logs
        const usersRef = ref(database, `users`);
        const snapshot = await get(usersRef);
        const usersData = snapshot.val();
        if (usersData) {
          for (const userId of Object.keys(usersData)) {
            const logsRef = ref(database, `users/${userId}/activityLogs`);
            await remove(logsRef);
          }
        }
      } else {
        // User or admin in individual mode
        const targetUserId =
          isAdmin && viewMode === "individual" && selectedUser
            ? selectedUser
            : user.uid;
        if (!isAdmin && targetUserId !== user.uid) {
          setErrorMessage("You can only clear your own logs.");
          return;
        }
        const logsRef = ref(database, `users/${targetUserId}/activityLogs`);
        await remove(logsRef);
      }
      setSelectedLogs([]);
      setErrorMessage("All logs cleared successfully.");
      fetchLogs();
    } catch (error) {
      console.error("Error clearing all logs:", error);
      setErrorMessage("Failed to clear all logs. Please try again.");
    }
  };

  const toggleLogSelection = (log) => {
    setSelectedLogs((prev) =>
      prev.some((l) => l.key === log.key && l.userId === log.userId)
        ? prev.filter((l) => !(l.key === log.key && l.userId === log.userId))
        : [...prev, log]
    );
  };

  const filterLogsByTime = (logs) => {
    const now = new Date();
    return logs.filter((log) => {
      if (!log.timestamp) return false;
      const logDate = new Date(log.timestamp);
      switch (timeFilter) {
        case "daily":
          return logDate.toDateString() === now.toDateString();
        case "weekly":
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return logDate >= oneWeekAgo && logDate <= now;
        case "monthly":
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return logDate >= oneMonthAgo && logDate <= now;
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredLogs = filterLogsByTime(
    logs.filter((log) => {
      const searchableContent = `${log.action || ""} ${log.description || ""} ${
        log.userId || ""
      } ${log.username || ""} ${log.logId || ""}`.toLowerCase();
      const matchesSearch = searchableContent.includes(
        searchTerm.toLowerCase()
      );
      const matchesUser =
        isAdmin && viewMode === "individual" && selectedUser
          ? log.userId === selectedUser
          : true;
      return matchesSearch && matchesUser;
    })
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === "all") {
      setSelectedUser("");
    }
  };

  const generatePDFContent = () => {
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
    doc.text("Activity Logs Report", margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
    y += 6;

    doc.text(
      `Time Filter: ${
        timeFilter === "daily"
          ? "Daily"
          : timeFilter === "weekly"
          ? "Weekly"
          : timeFilter === "monthly"
          ? "Monthly"
          : "All Time"
      }`,
      margin,
      y
    );
    y += 6;

    if (isAdmin) {
      if (viewMode === "individual" && selectedUser) {
        const selectedUserData = allUsers.find((u) => u.uid === selectedUser);
        doc.text(
          `Filtered for: ${selectedUserData?.name || "Unknown"} (${
            selectedUserData?.email || "No email"
          })`,
          margin,
          y
        );
        y += 6;
      } else {
        doc.text("Aggregated data for all users", margin, y);
        y += 6;
      }
    }

    const columns = isAdmin
      ? ["Log ID", "Username", "User ID", "Action", "Description", "Date"]
      : ["Log ID", "Action", "Description", "Date"];
    const columnWidths = isAdmin ? [35, 30, 35, 20, 45, 37] : [45, 30, 50, 57];
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
    filteredLogs.forEach((log, index) => {
      x = startX;
      const rowData = isAdmin
        ? [
            log.logId || "N/A",
            log.username || "Unknown",
            log.userId || "N/A",
            log.action || "N/A",
            log.description || "No description",
            formatDate(log.timestamp),
          ]
        : [
            log.logId || "N/A",
            log.action || "N/A",
            log.description || "No description",
            formatDate(log.timestamp),
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

        // Adding left logo on new page
        try {
          doc.addImage(crs, "PNG", margin, 5, 15, 15);
        } catch (error) {
          console.error("Error adding left logo on new page:", error);
        }

        // Adding right logo on new page
        try {
          doc.addImage(crg, "PNG", pageWidth - margin - 15, 5, 15, 15);
        } catch (error) {
          console.error("Error adding right logo on new page:", error);
        }

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

  const generateReportHTML = () => {
    const tableContent = document.createElement("table");
    tableContent.innerHTML = `
      <thead>
        <tr>
          <th>Log ID</th>
          ${isAdmin ? "<th>Username</th><th>User ID</th>" : ""}
          <th>Action</th>
          <th>Description</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${filteredLogs
          .map(
            (log) => `
              <tr>
                <td>${log.logId}</td>
                ${
                  isAdmin
                    ? `<td>${log.username}</td><td>${log.userId}</td>`
                    : ""
                }
                <td>${log.action || "N/A"}</td>
                <td>${log.description || "No description"}</td>
                <td>${formatDate(log.timestamp)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    `;

    return `
      <html>
        <head>
          <title>Activity Logs Report</title>
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
            <h1>Activity Logs Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Time Filter: ${
              timeFilter === "daily"
                ? "Daily"
                : timeFilter === "weekly"
                ? "Weekly"
                : timeFilter === "monthly"
                ? "Monthly"
                : "All Time"
            }</p>
            ${
              isAdmin
                ? viewMode === "individual" && selectedUser
                  ? `<p>Filtered for: ${
                      allUsers.find((u) => u.uid === selectedUser)?.name ||
                      "Unknown"
                    } (${
                      allUsers.find((u) => u.uid === selectedUser)?.email ||
                      "No email"
                    })</p>`
                  : "<p>Aggregated data for all users</p>"
                : ""
            }
          </div>
          ${tableContent.outerHTML}
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
    `;
  };

  const handlePrint = () => {
    const reportWindow = window.open("", "_blank");
    reportWindow.document.write(generateReportHTML());
    reportWindow.document.close();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = generatePDFContent();
      doc.save(
        `activity_logs_report_${new Date().toISOString().split("T")[0]}.pdf`
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

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex flex-col items-start space-y-2">
              <p className="text-sm sm:text-base text-gray-500">
                Search by log ID, action, or description
              </p>
              {isAdmin && (
                <>
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
                  {viewMode === "individual" && allUsers.length > 0 && (
                    <select
                      value={selectedUser || ""}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full sm:w-auto p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a User</option>
                      {allUsers.map((user) => (
                        <option key={user.uid} value={user.uid}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm sm:text-base sm:w-64 focus:ring-2 focus:ring-indigo-500"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="w-full sm:w-64 mb-4 sm:mb-0">
              <select
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-indigo-500"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {isAdmin && (
                <>
                  <button
                    className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold tracking-wide hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                    onClick={handlePrint}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </button>
                  <button
                    className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-semibold tracking-wide hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                    onClick={handlePreviewPDF}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download PDF
                  </button>
                </>
              )}
              <button
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg text-sm sm:text-base font-semibold tracking-wide hover:bg-red-700 transition-colors duration-200 shadow-sm"
                onClick={handleClearSelected}
                disabled={selectedLogs.length === 0}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-6a1 1 0 00-1 1v3H5"
                  />
                </svg>
                Clear Selected
              </button>
              <button
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg text-sm sm:text-base font-semibold tracking-wide hover:bg-red-700 transition-colors duration-200 shadow-sm"
                onClick={handleClearAll}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-6a1 1 0 00-1 1v3H5"
                  />
                </svg>
                Clear All
              </button>
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
                      onClick={handleDownloadPDF}
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
                          strokeWidth={2}
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
                          strokeWidth={2}
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
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
                      <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedLogs.some(
                            (l) => l.key === log.key && l.userId === log.userId
                          )}
                          onChange={() => toggleLogSelection(log)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
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
                      colSpan={isAdmin ? 7 : 5}
                      className="px-2 sm:px-4 py-2 sm:py-4 text-center text-sm sm:text-base text-gray-500"
                    >
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogsPage;
