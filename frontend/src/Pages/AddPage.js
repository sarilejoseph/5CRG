import React, { useState, useRef, useEffect } from "react";
import {
  getDatabase,
  ref,
  push,
  serverTimestamp,
  get,
  runTransaction,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
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
  const [idGenerated, setIdGenerated] = useState(false);
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
        }));
        // Only generate ID on initial load and when not already generated
        if (!idGenerated && !formData.id) {
          generateNextId(currentUser.uid, userIdentifier);
          setIdGenerated(true);
        }
      } else {
        setUser(null);
        setFormData((prev) => ({
          ...prev,
          sender: "",
          receiver: "",
          staffName: "",
        }));
      }
    });
    return () => unsubscribe();
  }, [messageType]);

  // Update sender/receiver when message type changes
  useEffect(() => {
    if (user) {
      const userIdentifier = user.displayName || user.email || "";
      setFormData((prev) => ({
        ...prev,
        sender: messageType === "sent" ? userIdentifier : prev.sender,
        receiver: messageType === "received" ? userIdentifier : prev.receiver,
      }));
    }
  }, [messageType, user]);

  useEffect(() => {
    const type = formData.type;
    const newFormData = { ...formData };
    newFormData.description = "";
    newFormData.cite = "";
    newFormData.agenda = "";
    newFormData.title = "";

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

  const generateNextId = async (userId, userIdentifier) => {
    try {
      let prefix = "XX";
      if (userIdentifier) {
        const name = userIdentifier.split("@")[0];
        const words = name.trim().split(/\s+/);
        if (words[0]) {
          const firstLetter = words[0][0]?.toUpperCase() || "X";
          const secondLetter = (
            words[1]?.[0] ||
            words[0][1] ||
            "X"
          ).toUpperCase();
          prefix = `${firstLetter}${secondLetter}`;
        }
      }

      // First check if there's an existing ID counter
      const counterRef = ref(database, `users/${userId}/lastMessageId`);
      const snapshot = await get(counterRef);

      // Only increment if we're actually creating a new record
      if (!snapshot.exists()) {
        // If no counter exists yet, initialize it to 1
        await runTransaction(counterRef, () => 1);
        const newId = `${prefix}0001`;
        setFormData((prev) => ({ ...prev, id: newId }));
      } else {
        // If counter exists, just read it (don't increment)
        const currentValue = snapshot.val();
        const newId = `${prefix}${String(currentValue).padStart(4, "0")}`;
        setFormData((prev) => ({ ...prev, id: newId }));
      }
    } catch (error) {
      console.error("Error generating ID:", error);
      setError("Failed to generate ID. Using temporary ID.");
      const tempId = `XX${String(Date.now()).slice(-4)}`;
      setFormData((prev) => ({ ...prev, id: tempId }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const resetForm = () => {
    const userIdentifier = user?.displayName || user?.email || "";
    setFormData({
      id: "",
      type: "STL",
      channel: "Email",
      timestamp: "",
      description: "",
      cite: "",
      agenda: "",
      title: "",
      sender: messageType === "sent" ? userIdentifier : "",
      receiver: messageType === "received" ? userIdentifier : "",
      staffName: userIdentifier,
      customTypeValue: "",
      customChannelValue: "",
      fileFormat: "PDF",
    });
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = null;

    // Reset ID generation state and generate a new ID
    setIdGenerated(false);
    if (user) {
      generateNextId(user.uid, userIdentifier);
      setIdGenerated(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to submit a record");
      return;
    }

    const requiredFields = [
      "id",
      "timestamp",
      messageType === "sent" ? "receiver" : "sender",
    ];
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

      const dbRef = ref(
        database,
        `users/${user.uid}/${
          messageType === "sent" ? "sentMessages" : "receivedMessages"
        }`
      );

      if (file) {
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const validExtensions = {
          PDF: ["pdf"],
          JPEG: ["jpg", "jpeg"],
          "MS Word": ["doc", "docx"],
          PNG: ["png"],
          Excel: ["xls", "xlsx"],
        }[formData.fileFormat];

        if (!validExtensions.includes(fileExtension)) {
          throw new Error(
            `Invalid file format. Expected ${formData.fileFormat}`
          );
        }

        const fileName = `${formData.id}_${Date.now()}.${fileExtension}`;
        const filePath = `users/${user.uid}/files/${fileName}`;
        const storageReference = storageRef(storage, filePath);

        const uploadResult = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        recordData.fileUrl = downloadURL;
        recordData.filename = fileName;
        recordData.filePath = filePath;
      }

      await push(dbRef, recordData);

      // Now increment counter for next ID
      const counterRef = ref(database, `users/${user.uid}/lastMessageId`);
      await runTransaction(counterRef, (currentValue) => {
        return (currentValue || 0) + 1;
      });

      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(`Failed to save record: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const fileFormatOptions = ["PDF", "JPEG", "MS Word", "PNG", "Excel"];

  return (
    <div className="min-h-screen flex bg-gray-100 flex-col relative pt-10">
      <div className="w-full max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-4 ml-1">
          Add Record
        </h1>
        <div className="bg-white border rounded-lg shadow p-4 mt-2">
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

          <div className="flex justify-end items-center mb-4">
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
                <label
                  htmlFor="id"
                  className="block text-sm text-gray-700 mb-1"
                >
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
                  accept={
                    formData.fileFormat === "PDF"
                      ? ".pdf"
                      : formData.fileFormat === "JPEG"
                      ? ".jpg,.jpeg"
                      : formData.fileFormat === "MS Word"
                      ? ".doc,.docx"
                      : formData.fileFormat === "PNG"
                      ? ".png"
                      : formData.fileFormat === "Excel"
                      ? ".xls,.xlsx"
                      : ""
                  }
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
    </div>
  );
};

export default RecordForm;
