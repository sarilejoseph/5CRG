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
import bgLogin from "../Assets/bgmain.png";
import { app } from "../firebase";

const RecordForm = () => {
  const [messageType, setMessageType] = useState("sent");
  const [formData, setFormData] = useState({
    id: "",
    sender: "",
    receiver: "",
    type: "Email",
    channel: "Email",
    timestamp: "",
    description: "",
    subject: "",
    staffName: "",
    customTypeValue: "",
    customChannelValue: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isRADMessage, setIsRADMessage] = useState(false);
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
    const isRAD = formData.type === "RAD";
    setIsRADMessage(isRAD);
    if (isRAD && !formData.subject.includes("SUBJECT:")) {
      setFormData((prev) => ({
        ...prev,
        subject: "SUBJECT: \nLOCATION: \nTIME: \nCONTENT: ",
      }));
    } else if (!isRAD && isRADMessage) {
      setFormData((prev) => ({ ...prev, subject: "" }));
    }
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
            if (data.id && data.id.startsWith("R")) {
              const idNum = parseInt(data.id.substring(1), 10);
              if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
            }
          });
        }
      }
      const newId = `R${String(maxId + 1).padStart(3, "0")}`;
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
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, subject: event.target.result }));
        setFilePreview(null);
      };
      reader.readAsText(selectedFile);
    } else {
      setFilePreview(null);
      setFormData((prev) => ({
        ...prev,
        subject: `File attached: ${selectedFile.name}`,
      }));
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setFilePreview(null);
    if (isRADMessage) {
      setFormData((prev) => ({
        ...prev,
        subject: "SUBJECT: \nLOCATION: \nTIME: \nCONTENT: ",
      }));
    } else {
      setFormData((prev) => ({ ...prev, subject: "" }));
    }
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const resetForm = () => {
    setFormData({
      id: nextId,
      type: "Email",
      channel: "Email",
      timestamp: "",
      description: "",
      subject: "",
      sender:
        messageType === "sent" ? user?.displayName || user?.email || "" : "",
      receiver:
        messageType === "received"
          ? user?.displayName || user?.email || ""
          : "",
      staffName: user?.displayName || user?.email || "",
      customTypeValue: "",
      customChannelValue: "",
    });
    setFile(null);
    setFilePreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to submit a record");
      return;
    }

    const requiredFields = [
      "id",
      messageType === "sent" ? "receiver" : "sender",
      "timestamp",
      "description",
      "subject",
    ];
    if (requiredFields.some((field) => !formData[field])) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalType =
        formData.type === "Others" ? formData.customTypeValue : formData.type;
      const finalChannel =
        formData.channel === "Others"
          ? formData.customChannelValue
          : formData.channel;

      const recordData = {
        id: formData.id,
        sender: formData.sender,
        receiver: formData.receiver,
        type: finalType,
        channel: finalChannel,
        description: formData.description,
        subject: formData.subject,
        timestamp: formData.timestamp
          ? new Date(formData.timestamp).getTime()
          : Date.now(),
        staffName:
          formData.staffName ||
          user.displayName ||
          user.email ||
          "Unknown User",
        createdAt: serverTimestamp(),
      };

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
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="timestamp"
                name="timestamp"
                type="datetime-local"
                value={formData.timestamp}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="staffName"
                className="block text-sm text-gray-700 mb-1"
              >
                Staff
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sender"
                className="block text-sm text-gray-700 mb-1"
              >
                From <span className="text-red-500">*</span>
              </label>
              <input
                id="sender"
                name="sender"
                type="text"
                value={formData.sender}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md bg-gray-200${
                  messageType === "sent" ? "bg-gray-100" : ""
                }`}
                readOnly={messageType === "sent"}
                required
              />
            </div>
            <div>
              <label
                htmlFor="receiver"
                className="block text-sm text-gray-700 mb-1"
              >
                To <span className="text-red-500">*</span>
              </label>
              <input
                id="receiver"
                name="receiver"
                type="text"
                value={formData.receiver}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md bg-gray-200${
                  messageType === "received" ? "bg-gray-100" : ""
                }`}
                readOnly={messageType === "received"}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="type"
                className="block text-sm text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-gray-200"
              >
                <option value="Email">Email</option>
                <option value="RAD">RAD</option>
                <option value="Conference notice">Conference notice</option>
                <option value="LOI">LOI</option>
                <option value="Memo">Memo</option>
                <option value="Letters">Letters</option>
                <option value="Others">Others</option>
              </select>
              {formData.type === "Others" && (
                <input
                  type="text"
                  name="customTypeValue"
                  placeholder="Specify..."
                  className="w-full mt-1 p-2 border rounded-md"
                  onChange={handleChange}
                  value={formData.customTypeValue}
                />
              )}
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
                <option value="Email">Email</option>
                <option value="Viber">Viber</option>
                <option value="Hardcopy">Hardcopy</option>
                <option value="Signal">Signal</option>
                <option value="Telegram">Telegram</option>
                <option value="SMS">SMS</option>
                <option value="Others">Others</option>
              </select>
              {formData.channel === "Others" && (
                <input
                  type="text"
                  name="customChannelValue"
                  placeholder="Specify..."
                  className="w-full mt-1 p-2 border rounded-md"
                  onChange={handleChange}
                  value={formData.customChannelValue}
                />
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm text-gray-700 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full h-20 p-2 border rounded-md resize-none bg-gray-200"
              placeholder="Enter description..."
              required
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm text-gray-700 mb-1"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full h-32 p-2 border rounded-md resize-none bg-gray-200"
                placeholder={
                  isRADMessage
                    ? "SUBJECT:\nLOCATION:\nTIME:\nCONTENT:"
                    : "Content..."
                }
                required
              ></textarea>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute right-2 top-2 p-1 bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />
            </div>

            {(file || filePreview) && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-500 mr-1"
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
                    <span className="text-sm text-blue-600">{file?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {filePreview && file?.type.startsWith("image/") && (
                  <div className="mt-1 flex justify-center">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-40 max-w-full object-contain rounded-md"
                    />
                  </div>
                )}

                {file && !file.type.startsWith("image/") && (
                  <div className="mt-1 p-1 bg-gray-100 rounded-md text-center text-sm text-gray-600">
                    {file.type === "text/plain"
                      ? "Text loaded"
                      : file.type.includes("pdf")
                      ? "PDF"
                      : file.type.includes("word")
                      ? "Word"
                      : `${file.type || "Unknown"}`}
                  </div>
                )}
              </div>
            )}
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
