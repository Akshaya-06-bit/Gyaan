const { db } = require("../config/firebase");

// GET /api/mentor/assigned/:studentId
const getAssignedMentor = async (req, res) => {
  const { studentId } = req.params;
  try {
    const studentDoc = await db.collection("users").doc(studentId).get();
    if (!studentDoc.exists) return res.status(404).json({ error: "Student not found" });
    const assignedMentorId = studentDoc.data().assignedMentorId;
    if (!assignedMentorId) return res.status(404).json({ error: "No mentor assigned" });
    const mentorDoc = await db.collection("users").doc(assignedMentorId).get();
    if (!mentorDoc.exists) return res.status(404).json({ error: "Mentor not found" });
    res.json({ id: assignedMentorId, ...mentorDoc.data() });
  } catch (err) {
    console.error("getAssignedMentor error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/mentor/students?mentorId=
const getMentorStudents = async (req, res) => {
  const { mentorId } = req.query;
  if (!mentorId) return res.status(400).json({ error: "mentorId required" });
  try {
    const studentsSnapshot = await db
      .collection("users")
      .where("assignedMentorId", "==", mentorId)
      .get();

    const students = [];
    for (const doc of studentsSnapshot.docs) {
      const student = doc.data();
      const progressDoc = await db.collection("students").doc(doc.id).get();
      const progressData = progressDoc.data() || {};
      const analysis = progressData.lastAnalysis || {};

      students.push({
        id: doc.id,
        name: student.name,
        email: student.email,
        class: student.class || "Not specified",
        riskLevel: analysis.riskLevel || "low",
        weakSubjects: analysis.weakSubjects || [],
        overallAvg: analysis.overallAvg || null,
        lastActive: student.lastActive || student.createdAt,
      });
    }

    res.json({ students, total: students.length });
  } catch (err) {
    console.error("getMentorStudents error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/mentor/suggestions/:studentId
const getMentorSuggestions = async (req, res) => {
  const { studentId } = req.params;
  try {
    const studentDoc = await db.collection("users").doc(studentId).get();
    if (!studentDoc.exists) return res.status(404).json({ error: "Student not found" });
    const progressDoc = await db.collection("students").doc(studentId).get();
    const progress = progressDoc.data() || {};
    const analysis = progress.lastAnalysis || {};
    const weak = analysis.weakSubjects || [];
    const risk = analysis.riskLevel || "low";

    const sessionSuggestions = [];
    if (weak.length > 0) {
      weak.forEach((w) => sessionSuggestions.push(`Focus next session on ${w} fundamentals.`));
    } else {
      sessionSuggestions.push("Review recent topics and reinforce strengths.");
    }
    sessionSuggestions.push("Start with a 5‑minute diagnostic quiz.");

    const mentorActions = [
      "Assign a short practice quiz after the session.",
      "Send a brief recap note to student and guardian.",
    ];

    const riskNotes =
      risk === "high"
        ? [`Student is high risk. Prioritize intervention this week.`]
        : risk === "medium"
        ? [`Student shows moderate risk. Monitor weekly.`]
        : [`Student is stable. Maintain current pace.`];

    res.json({
      student: { id: studentId, name: studentDoc.data().name },
      riskLevel: risk,
      weakSubjects: weak,
      sessionSuggestions,
      mentorActions,
      riskNotes,
    });
  } catch (err) {
    console.error("getMentorSuggestions error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/mentor/message
const sendMentorMessage = async (req, res) => {
  const { studentId, mentorId, message } = req.body;
  if (!studentId || !mentorId || !message)
    return res.status(400).json({ error: "studentId, mentorId, message required" });
  try {
    const payload = {
      studentId,
      mentorId,
      message,
      createdAt: new Date().toISOString(),
    };
    await db.collection("mentorMessages").add(payload);
    res.json({ status: "sent" });
  } catch (err) {
    console.error("sendMentorMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/mentor/session-request
const createSessionRequest = async (req, res) => {
  const { studentId, mentorId, requestedAt, notes } = req.body;
  if (!studentId || !mentorId)
    return res.status(400).json({ error: "studentId and mentorId required" });
  try {
    const payload = {
      studentId,
      mentorId,
      requestedAt: requestedAt || new Date().toISOString(),
      notes: notes || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const doc = await db.collection("sessionRequests").add(payload);
    res.json({ id: doc.id, ...payload });
  } catch (err) {
    console.error("createSessionRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/mentor/session-request/:studentId
const listSessionRequests = async (req, res) => {
  const { studentId } = req.params;
  try {
    const snap = await db
      .collection("sessionRequests")
      .where("studentId", "==", studentId)
      .orderBy("createdAt", "desc")
      .get();
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ requests });
  } catch (err) {
    console.error("listSessionRequests error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/mentor/session-request/:requestId
const updateSessionRequest = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;
  if (!["pending", "approved", "rejected"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  try {
    await db.collection("sessionRequests").doc(requestId).update({ status });
    res.json({ status });
  } catch (err) {
    console.error("updateSessionRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAssignedMentor,
  getMentorStudents,
  getMentorSuggestions,
  sendMentorMessage,
  createSessionRequest,
  listSessionRequests,
  updateSessionRequest,
};
