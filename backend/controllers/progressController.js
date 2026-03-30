const { db } = require("../config/firebase");

// POST /api/progress/:studentId/scores
const addTestScore = async (req, res) => {
  const { studentId } = req.params;
  const { subject, score, maxScore, date, testName } = req.body;

  if (!subject || score === undefined || !maxScore || !date)
    return res.status(400).json({ error: "subject, score, maxScore, date are required" });

  try {
    const ref = await db
      .collection("students")
      .doc(studentId)
      .collection("scores")
      .add({ subject, score, maxScore, date, testName: testName || subject, createdAt: new Date().toISOString() });

    res.status(201).json({ id: ref.id, message: "Score added" });
  } catch (err) {
    console.error("addTestScore error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress/:studentId/scores
const getTestScores = async (req, res) => {
  const { studentId } = req.params;
  try {
    const snapshot = await db
      .collection("students")
      .doc(studentId)
      .collection("scores")
      .orderBy("date", "asc")
      .get();

    const scores = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(scores);
  } catch (err) {
    console.error("getTestScores error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress/:studentId/summary
const getStudentSummary = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [studentDoc, scoresSnap] = await Promise.all([
      db.collection("users").doc(studentId).get(),
      db.collection("students").doc(studentId).collection("scores").orderBy("date", "asc").get(),
    ]);

    if (!studentDoc.exists)
      return res.status(404).json({ error: "Student not found" });

    const scores = scoresSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const student = studentDoc.data();

    // Group scores by subject
    const subjectMap = {};
    scores.forEach(({ subject, score, maxScore, date, testName }) => {
      if (!subjectMap[subject]) subjectMap[subject] = [];
      subjectMap[subject].push({ score, maxScore, date, testName, pct: Math.round((score / maxScore) * 100) });
    });

    // Compute per-subject averages
    const subjectAverages = Object.entries(subjectMap).map(([subject, entries]) => {
      const avg = Math.round(entries.reduce((s, e) => s + e.pct, 0) / entries.length);
      return { subject, avg, entries };
    });

    res.json({ student, scores, subjectAverages });
  } catch (err) {
    console.error("getStudentSummary error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addTestScore, getTestScores, getStudentSummary };
