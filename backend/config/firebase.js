const admin = require("firebase-admin");
const path = require("path");

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
  const fs = require("fs");

  if (fs.existsSync(serviceAccountPath)) {
    // Option 1: Use service account JSON file
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    // Option 2: Use .env variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
