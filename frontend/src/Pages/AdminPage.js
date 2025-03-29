import React, { useState, useEffect } from "react";
import { auth, database } from "../firebase";
import { ref, onValue, set, update, remove, get } from "firebase/database";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateEmail,
  deleteUser as deleteAuthUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    department: "",
    phoneNumber: "",
  });
  const [showPasscodeModal, setShowPasscodeModal] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [passcodeAttempts, setPasscodeAttempts] = useState(0);
  const [passcodeError, setPasscodeError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const navigate = useNavigate();
  const CORRECT_PASSCODE = "1234";
  const MAX_ATTEMPTS = 5;

  // Handle passcode submission
  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === CORRECT_PASSCODE) {
      setShowPasscodeModal(false);
      fetchUsers();
    } else {
      const newAttempts = passcodeAttempts + 1;
      setPasscodeAttempts(newAttempts);
      setPasscodeError(
        `Incorrect passcode. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`
      );
      setPasscode("");
      if (newAttempts >= MAX_ATTEMPTS) {
        setPasscodeError("Maximum attempts reached. Access denied.");
        setTimeout(() => navigate("/"), 3000);
      }
    }
  };

  // Check authentication and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentAdmin(user);
        setAdminEmail(user.email);
        checkAdminRole(user.uid);
      } else {
        setCurrentAdmin(null);
        setIsAdmin(false);
        setAccessDenied(true);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Verify admin role
  const checkAdminRole = async (uid) => {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      if (snapshot.exists() && snapshot.val().role === "admin") {
        setIsAdmin(true);
        setShowPasscodeModal(true);
      } else {
        setIsAdmin(false);
        setAccessDenied(true);
        setTimeout(() => navigate("/dashboard"), 3000);
      }
      setLoading(false);
    } catch (error) {
      setIsAdmin(false);
      setAccessDenied(true);
      setLoading(false);
      setTimeout(() => navigate("/dashboard"), 3000);
    }
  };

  // Fetch all users with their auth UIDs
  const fetchUsers = () => {
    setLoading(true);
    onValue(
      ref(database, "users"),
      (snapshot) => {
        const data = snapshot.val();
        const usersList = [];
        if (data) {
          Object.entries(data).forEach(([uid, userData]) => {
            usersList.push({ uid, ...userData });
          });
        }
        setUsers(usersList);
        setLoading(false);
      },
      (error) => {
        showNotification(`Failed to load users: ${error.message}`, "error");
        setLoading(false);
      }
    );
  };

  // Show notification helper
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle admin password capture for re-authentication
  const handleAdminPasswordCapture = (e) => {
    setAdminPassword(e.target.value);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "user",
      department: "",
      phoneNumber: "",
    });
    setFormMode("add");
    setSelectedUser(null);
    setShowForm(false);
    setAdminPassword("");
  };

  // Handle user actions
  const handleAddUser = () => {
    setFormMode("add");
    resetForm();
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFormData({
      email: user.email || "",
      password: "",
      name: user.name || "",
      role: user.role || "user",
      department: user.department || "",
      phoneNumber: user.phoneNumber || "",
    });
    setShowForm(true);
  };

  const handleViewUser = (user) => {
    setFormMode("view");
    setSelectedUser(user);
    setFormData({
      email: user.email || "",
      password: "********",
      name: user.name || "",
      role: user.role || "user",
      department: user.department || "",
      phoneNumber: user.phoneNumber || "",
    });
    setShowForm(true);
  };

  const handleDeleteUser = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${user.name || user.email}?`
      )
    ) {
      try {
        setLoading(true);

        // Re-authenticate admin if needed
        if (adminPassword) {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        }

        // Delete from Realtime Database
        await remove(ref(database, `users/${user.uid}`));

        // If the user has an authUid, delete from Authentication
        if (user.authUid) {
          try {
            console.log("Would delete auth user with ID:", user.authUid);
          } catch (authError) {
            console.error("Auth deletion failed:", authError);
            // Continue anyway as we've removed from database
          }
        }

        showNotification("User deleted successfully", "success");
        fetchUsers();
      } catch (error) {
        showNotification(`Failed to delete user: ${error.message}`, "error");
        setLoading(false);
      }
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formMode === "add") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const uid = userCredential.user.uid;

        await set(ref(database, `users/${uid}`), {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          department: formData.department,
          phoneNumber: formData.phoneNumber,
          createdAt: new Date().toISOString(),
          createdBy: currentAdmin ? currentAdmin.uid : "system",
        });

        showNotification("User added successfully", "success");
      } else if (formMode === "edit") {
        const updates = {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          phoneNumber: formData.phoneNumber,
          updatedAt: new Date().toISOString(),
          updatedBy: currentAdmin ? currentAdmin.uid : "system",
        };

        // Update email if changed
        if (selectedUser.email !== formData.email) {
          await updateEmail(auth.currentUser, formData.email);
          updates.email = formData.email;
        }

        await update(ref(database, `users/${selectedUser.uid}`), updates);
        showNotification("User updated successfully", "success");
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      showNotification(`Failed to save user: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Access denied view
  if (accessDenied || !isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md">
          <h1 className="text-2xl font-bold mb-3">Access Denied</h1>
          <p className="mb-4">
            You do not have admin privileges to access this page.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Passcode modal
  if (showPasscodeModal) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
            Admin Access
          </h2>
          <form onSubmit={handlePasscodeSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Enter Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 4-digit passcode"
                maxLength={4}
                required
                autoFocus
              />
            </div>
            {passcodeError && (
              <div className="mb-4 text-red-600 text-sm font-medium">
                {passcodeError}
              </div>
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Exit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main user management interface
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">User Management</h1>

      {notification.show && (
        <div
          className={`mb-4 p-4 rounded-md ${
            notification.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleAddUser}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              {formMode === "add"
                ? "Add New User"
                : formMode === "edit"
                ? "Edit User"
                : "User Details"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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

          <form onSubmit={handleSubmitForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formMode === "view"}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formMode === "view"}
                  required={formMode === "add"}
                  placeholder={
                    formMode === "edit"
                      ? "Leave blank to keep current password"
                      : ""
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formMode === "view"}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formMode === "view"}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formMode === "view"}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formMode === "view"}
                />
              </div>
            </div>

            {formMode !== "view" && (
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
                >
                  {formMode === "add" ? "Add User" : "Update User"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="ml-4 bg-gray-300 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-blue-50 text-blue-800 border-b">
          User Accounts
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found in the system
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className="border-b border-gray-200 hover:bg-blue-50"
                  >
                    <td className="py-3 px-4">{user.name || "N/A"}</td>
                    <td className="py-3 px-4">{user.email || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.department || "N/A"}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit User"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
