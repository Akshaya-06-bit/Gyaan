const { db } = require("../config/firebase");

// POST /api/resources
const createResource = async (req, res) => {
  const { title, subject, link, notes, mentorId } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: "title and subject are required" });
  }

  try {
    const payload = {
      title,
      subject,
      link: link || "",
      notes: notes || "",
      mentorId: mentorId || null,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("resources").add(payload);
    res.status(201).json({ id: ref.id, ...payload });
  } catch (err) {
    console.error("createResource error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/resources?mentorId=
const listResources = async (req, res) => {
  const { mentorId } = req.query;
  try {
    let query = db.collection("resources");
    if (mentorId) query = query.where("mentorId", "==", mentorId);
    const snap = await query.orderBy("createdAt", "desc").get();
    const resources = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ resources, total: resources.length });
  } catch (err) {
    console.error("listResources error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createResource, listResources };
