import React, { useState, useEffect } from "react";
import { auth, database, storage } from "../firebase";
import { ref as dbRef, onValue, update } from "firebase/database";
import { onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    name: "",
    department: "",
    phoneNumber: "",
    bio: "",
    profilePicture: "",
  });

  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserProfile(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserProfile = (uid) => {
    onValue(
      dbRef(database, `users/${uid}`),
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData({
            email: userData.email || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            name: userData.name || "",
            department: userData.department || "",
            phoneNumber: userData.phoneNumber || "",
            bio: userData.bio || "",
            profilePicture: userData.profilePicture || "",
          });
          setIsAdmin(userData.role === "admin");
        }
        setLoading(false);
      },
      (error) => {
        showNotification(`Failed to load profile: ${error.message}`, "error");
        setLoading(false);
      }
    );
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a preview of the selected image
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewImage(null);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFile(null);
      setPreviewImage(null);
    }
  };

  const uploadProfilePicture = async (uid) => {
    if (!file) return formData.profilePicture;

    try {
      // Create a reference to 'profilePictures/[uid]'
      const profilePicRef = storageRef(storage, `profilePictures/${uid}`);

      // Upload the file
      await uploadBytes(profilePicRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(profilePicRef);
      return downloadURL;
    } catch (error) {
      showNotification(
        `Profile picture upload failed: ${error.message}`,
        "error"
      );
      return formData.profilePicture;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profilePictureURL = await uploadProfilePicture(user.uid);

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showNotification("New passwords do not match", "error");
          setLoading(false);
          return;
        }
        await updatePassword(user, formData.newPassword);
      }

      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }

      await update(dbRef(database, `users/${user.uid}`), {
        email: formData.email,
        name: formData.name,
        department: formData.department,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        profilePicture: profilePictureURL, // Save the profile picture URL
        updatedAt: new Date().toISOString(),
      });

      showNotification("Profile updated successfully", "success");
      setEditMode(false);
      fetchUserProfile(user.uid);
    } catch (error) {
      showNotification(`Failed to update profile: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Profile</h1>

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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <div className="text-center">
                <img
                  src={
                    previewImage ||
                    formData.profilePicture ||
                    "/defaultProfilePic.png"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
                {editMode && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 w-full"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-800">
                  {formData.name}
                </h2>
                <p className="text-gray-600 mb-2">{formData.email}</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isAdmin
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isAdmin ? "Admin" : "User"}
                </span>
              </div>
            </div>

            <div className="w-full md:w-2/3 md:pl-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-800">
                  {editMode ? "Edit Profile" : "Profile Information"}
                </h3>
                <button
                  onClick={toggleEditMode}
                  className={`px-4 py-2 rounded-md ${
                    editMode
                      ? "bg-gray-300 text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!editMode}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!editMode}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!editMode}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    disabled={!editMode}
                  ></textarea>
                </div>

                {editMode && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <h4 className="text-lg font-medium text-gray-700 mb-4">
                        Change Password (Optional)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="mb-4 md:col-span-2">
                          <label className="block text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 mr-4"
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium">
                {isAdmin ? "Administrator" : "Standard User"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-medium">
                {user?.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
