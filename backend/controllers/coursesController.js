const { db } = require("../config/firebase");
const { getCourses } = require("../data/courseData");

// POST /api/courses/preferences
const savePreferences = async (req, res) => {
  const { uid, age, cls, subjects, level } = req.body;
  if (!cls || !subjects?.length || !level)
    return res.status(400).json({ error: "cls, subjects, and level are required" });

  try {
    const courses = getCourses(subjects, cls, level);

    if (uid) {
      await db.collection("preferences").doc(uid).set(
        { age, cls, subjects, level, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }

    res.json({ courses, total: courses.length });
  } catch (err) {
    console.error("savePreferences error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/courses/preferences/:uid
const getPreferences = async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await db.collection("preferences").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: "No preferences found" });
    const { cls, subjects, level } = doc.data();
    const courses = getCourses(subjects, cls, level);
    res.json({ preferences: doc.data(), courses });
  } catch (err) {
    console.error("getPreferences error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { savePreferences, getPreferences };
