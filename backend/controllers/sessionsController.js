const { db } = require("../config/firebase");

// POST /api/sessions
const createSession = async (req, res) => {
  const { title, date, mentorId, studentIds, notes } = req.body;
  if (!title || !date) {
    return res.status(400).json({ error: "title and date are required" });
  }

  try {
    const payload = {
      title,
      date,
      mentorId: mentorId || null,
      studentIds: Array.isArray(studentIds) ? studentIds : [],
      notes: notes || "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("sessions").add(payload);
    res.status(201).json({ id: ref.id, ...payload });
  } catch (err) {
    console.error("createSession error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/sessions?mentorId=
const listSessions = async (req, res) => {
  const { mentorId } = req.query;
  try {
    let query = db.collection("sessions");
    if (mentorId) query = query.where("mentorId", "==", mentorId);
    const snap = await query.orderBy("date", "asc").get();
    const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ sessions, total: sessions.length });
  } catch (err) {
    console.error("listSessions error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/sessions/:sessionId/status
const updateSessionStatus = async (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.body;
  const valid = ["scheduled", "completed", "canceled"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await db.collection("sessions").doc(sessionId).update({ status });
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("updateSessionStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSession, listSessions, updateSessionStatus };
