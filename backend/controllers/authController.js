const { db, auth } = require("../config/firebase");

const register = async (req, res) => {
  const { uid, name, email, role } = req.body;

  console.log("Register request:", { uid, name, email, role });

  if (!uid || !name || !email || !role)
    return res.status(400).json({ error: "All fields required" });

  const validRoles = ["student", "mentor", "admin"];
  if (!validRoles.includes(role))
    return res.status(400).json({ error: "Invalid role" });

  try {
    const existing = await db.collection("users").doc(uid).get();
    if (existing.exists) {
      return res.status(200).json({ message: "User exists", ...existing.data() });
    }

    const userData = {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(uid).set(userData);

    // Non-blocking — don't fail registration if claims fail
    auth.setCustomUserClaims(uid, { role }).catch((e) =>
      console.warn("setCustomUserClaims failed:", e.message)
    );

    res.status(201).json({ message: "User registered", ...userData });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json(doc.data());
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const validRoles = ["student", "mentor", "admin"];
  if (!validRoles.includes(role))
    return res.status(400).json({ error: "Invalid role" });

  try {
    await db.collection("users").doc(userId).update({ role });
    auth.setCustomUserClaims(userId, { role }).catch((e) =>
      console.warn("setCustomUserClaims failed:", e.message)
    );
    res.json({ message: "Role updated" });
  } catch (err) {
    console.error("updateUserRole error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, getProfile, getAllUsers, updateUserRole };
