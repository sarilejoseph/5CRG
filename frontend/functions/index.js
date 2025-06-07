const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.removeUser = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    // Ensure the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to delete users."
      );
    }

    // Check if the caller has admin privileges
    const callerUid = context.auth.uid;
    const userRef = admin.database().ref(`users/${callerUid}`);
    const snapshot = await userRef.once("value");
    if (!snapshot.exists() || snapshot.val().role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an admin to delete users."
      );
    }

    const { uid } = data;

    // Prevent admin from deleting themselves
    if (uid === callerUid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Cannot delete your own account."
      );
    }

    try {
      // Delete user from Authentication
      await admin.auth().deleteUser(uid);
      // Delete user data from Realtime Database
      await admin.database().ref(`users/${uid}`).remove();
      return { message: "User deleted successfully" };
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        `Failed to delete user: ${error.message}`
      );
    }
  });
