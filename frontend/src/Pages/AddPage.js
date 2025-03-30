import React, { useState, useRef, useEffect } from "react";
import {
  getDatabase,
  ref,
  push,
  get,
  serverTimestamp,
} from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";

const RecordForm = () => {
  const [messageType, setMessageType] = useState("sent");
  const [formData, setFormData] = useState({
    id: "",
    sender: "",
    receiver: "",
    type: "STL",
    channel: "Email",
    timestamp: "",
    description: "",
    cite: "",
    agenda: "",
    title: "",
    staffName: "",
    customTypeValue: "",
    customChannelValue: "",
    fileFormat: "PDF",
  });
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [nextId, setNextId] = useState("");
  const fileInputRef = useRef(null);
  const database = getDatabase(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userIdentifier =
          currentUser.displayName || currentUser.email || "";
        setFormData((prev) => ({
          ...prev,
          sender: messageType === "sent" ? userIdentifier : "",
          receiver: messageType === "received" ? userIdentifier : "",
          staffName: userIdentifier,
          id: nextId || "",
        }));
        generateNextId(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [messageType, nextId]);

  useEffect(() => {
    // Reset the relevant fields based on type
    const type = formData.type;
    const newFormData = { ...formData };

    // Clear all content fields first
    newFormData.description = "";
    newFormData.cite = "";
    newFormData.agenda = "";
    newFormData.title = "";

    // Set default file format based on type
    switch (type) {
      case "STL":
        newFormData.fileFormat = "PDF";
        break;
      case "Conference Notice":
        newFormData.fileFormat = "JPEG";
        break;
      case "LOI":
        newFormData.fileFormat = "MS Word";
        break;
      case "RAD":
        newFormData.fileFormat = "PNG";
        break;
      case "Letter":
        newFormData.fileFormat = "PDF";
        break;
      default:
        newFormData.fileFormat = "PDF";
    }

    setFormData(newFormData);
  }, [formData.type]);

  const generateNextId = async (userId) => {
    try {
      const paths = [
        `users/${userId}/sentMessages`,
        `users/${userId}/receivedMessages`,
      ];
      let maxId = 0;
      for (const path of paths) {
        const snapshot = await get(ref(database, path));
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const data = child.val();
            if (data.id && !isNaN(parseInt(data.id.slice(1)))) {
              const idNum = parseInt(data.id.slice(1), 10);
              if (idNum > maxId) maxId = idNum;
            }
          });
        }
      }
      const newId = `O${String(maxId + 1).padStart(5, "0")}`;
      setNextId(newId);
      setFormData((prev) => ({ ...prev, id: newId }));
    } catch (error) {
      console.error("Error generating ID:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const resetForm = () => {
    setFormData({
      id: nextId,
      type: "STL",
      channel: "Email",
      timestamp: "",
      description: "",
      cite: "",
      agenda: "",
      title: "",
      sender:
        messageType === "sent" ? user?.displayName || user?.email || "" : "",
      receiver:
        messageType === "received"
          ? user?.displayName || user?.email || ""
          : "",
      staffName: user?.displayName || user?.email || "",
      customTypeValue: "",
      customChannelValue: "",
      fileFormat: "PDF",
    });
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to submit a record");
      return;
    }

    let requiredFields = ["id", "timestamp"];

    // Add type-specific required fields
    switch (formData.type) {
      case "STL":
      case "Letter":
        requiredFields.push("description");
        break;
      case "Conference Notice":
        requiredFields.push("agenda");
        break;
      case "LOI":
        requiredFields.push("title");
        break;
      case "RAD":
        requiredFields.push("cite");
        break;
    }

    // Add sender/receiver based on message type
    requiredFields.push(messageType === "sent" ? "receiver" : "sender");

    if (requiredFields.some((field) => !formData[field])) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recordData = {
        id: formData.id,
        sender: formData.sender,
        receiver: formData.receiver,
        type: formData.type,
        channel: formData.channel,
        timestamp: formData.timestamp
          ? new Date(formData.timestamp).getTime()
          : Date.now(),
        staffName:
          formData.staffName ||
          user.displayName ||
          user.email ||
          "Unknown User",
        fileFormat: formData.fileFormat,
        createdAt: serverTimestamp(),
      };

      // Add type-specific fields
      switch (formData.type) {
        case "STL":
        case "Letter":
          recordData.description = formData.description;
          break;
        case "Conference Notice":
          recordData.agenda = formData.agenda;
          break;
        case "LOI":
          recordData.title = formData.title;
          break;
        case "RAD":
          recordData.cite = formData.cite;
          break;
      }

      if (file) {
        const fileRef = storageRef(
          storage,
          `users/${user.uid}/files/${file.name}`
        );
        await uploadBytes(fileRef, file);
        recordData.fileUrl = `users/${user.uid}/files/${file.name}`;
        recordData.filename = file.name;
      }

      const dbRef = ref(
        database,
        `users/${user.uid}/${
          messageType === "sent" ? "sentMessages" : "receivedMessages"
        }`
      );
      await push(dbRef, recordData);

      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Failed to save record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render the appropriate content field based on type
  const renderContentField = () => {
    switch (formData.type) {
      case "STL":
      case "Letter":
        return (
          <div>
            <label
              htmlFor="description"
              className="block text-sm text-gray-700 mb-1"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Max 100 characters"
              maxLength={100}
              required
            ></textarea>
          </div>
        );
      case "Conference Notice":
        return (
          <div>
            <label
              htmlFor="agenda"
              className="block text-sm text-gray-700 mb-1"
            >
              Agenda <span className="text-red-500">*</span>
            </label>
            <textarea
              id="agenda"
              name="agenda"
              value={formData.agenda}
              onChange={handleChange}
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Max 100 characters"
              maxLength={100}
              required
            ></textarea>
          </div>
        );
      case "LOI":
        return (
          <div>
            <label htmlFor="title" className="block text-sm text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <textarea
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Max 100 characters"
              maxLength={100}
              required
            ></textarea>
          </div>
        );
      case "RAD":
        return (
          <div>
            <label htmlFor="cite" className="block text-sm text-gray-700 mb-1">
              Cite Number <span className="text-red-500">*</span>
            </label>
            <input
              id="cite"
              name="cite"
              type="text"
              value={formData.cite}
              onChange={handleChange}
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
    <div className="min-h-screen flex bg-gray-100 flex-col relative">
      <div className="w-full max-w-5xl mx-auto p-4 bg-white border mt-5 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-blue-800">Add Record</h1>
          <div className="flex items-center space-x-2">
            <span
              className={
                messageType === "sent" ? "text-blue-600" : "text-gray-500"
              }
            >
              Out
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={messageType === "received"}
                onChange={() =>
                  setMessageType(messageType === "sent" ? "received" : "sent")
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:left-0.5 after:top-0.5"></div>
            </label>
            <span
              className={
                messageType === "received" ? "text-blue-600" : "text-gray-500"
              }
            >
              In
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md">
            Saved!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="type"
                className="block text-sm text-gray-700 mb-1"
              >
                Type of Communication
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-gray-200"
              >
                <option value="STL">STL (Subject to letter)</option>
                <option value="Conference Notice">Conference Notice</option>
                <option value="LOI">LOI (Letter of Instructions)</option>
                <option value="RAD">RAD message</option>
                <option value="Letter">Letter (Civilian)</option>
              </select>
            </div>

            <div>
              <label htmlFor="id" className="block text-sm text-gray-700 mb-1">
                ID <span className="text-red-500">*</span>
              </label>
              <input
                id="id"
                name="id"
                type="text"
                value={formData.id}
                readOnly
                className="w-full p-2 bg-gray-100 border rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="timestamp"
                className="block text-sm text-gray-700 mb-1"
              >
                Dated <span className="text-red-500">*</span>
              </label>
              <input
                id="timestamp"
                name="timestamp"
                type="date"
                value={formData.timestamp}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sender"
                className="block text-sm text-gray-700 mb-1"
              >
                Sender/Originator <span className="text-red-500">*</span>
              </label>
              <input
                id="sender"
                name="sender"
                type="text"
                value={formData.sender}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  messageType === "sent" ? "bg-gray-100" : "bg-white"
                }`}
                readOnly={messageType === "sent"}
                maxLength={25}
                required
              />
            </div>

            <div>
              <label
                htmlFor="receiver"
                className="block text-sm text-gray-700 mb-1"
              >
                Receiver <span className="text-red-500">*</span>
              </label>
              <input
                id="receiver"
                name="receiver"
                type="text"
                value={formData.receiver}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  messageType === "received" ? "bg-gray-100" : "bg-white"
                }`}
                readOnly={messageType === "received"}
                required
              />
            </div>
          </div>

          {renderContentField()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="dateReceived"
                className="block text-sm text-gray-700 mb-1"
              >
                Date received
              </label>
              <input
                id="dateReceived"
                name="dateReceived"
                type="date"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="staffName"
                className="block text-sm text-gray-700 mb-1"
              >
                Received by
              </label>
              <input
                id="staffName"
                name="staffName"
                type="text"
                value={formData.staffName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="channel"
                className="block text-sm text-gray-700 mb-1"
              >
                Channel
              </label>
              <select
                id="channel"
                name="channel"
                value={formData.channel}
                onChange={handleChange}
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
              <label
                htmlFor="fileFormat"
                className="block text-sm text-gray-700 mb-1"
              >
                File Format
              </label>
              <select
                id="fileFormat"
                name="fileFormat"
                value={formData.fileFormat}
                onChange={handleChange}
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
              <label
                htmlFor="file"
                className="block text-sm text-gray-700 mb-1"
              >
                Attachment
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-3 py-1 ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-md flex items-center`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                `Save ${messageType === "sent" ? "Outgoing" : "Incoming"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;
