const twilio = require("twilio");
const { db } = require("../config/firebase");

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
};

const buildTwimletUrl = (message) => {
  const safe = encodeURIComponent(message);
  return `https://twimlets.com/message?Message=${safe}`;
};

// POST /api/ngo/call-at-risk
const callAtRiskStudents = async (req, res) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      return res.status(400).json({ error: "Twilio credentials missing" });
    }

    const from = process.env.TWILIO_FROM_NUMBER;
    if (!from) {
      return res.status(400).json({ error: "TWILIO_FROM_NUMBER missing" });
    }

    const message =
      req.body?.message ||
      "Hello. This is an automated call from the Learning Support Platform. Please contact your mentor for immediate assistance.";

    // Find at-risk students with phone numbers
    const studentsSnapshot = await db.collection("users").where("role", "==", "student").get();
    const calls = [];
    for (const doc of studentsSnapshot.docs) {
      const user = doc.data();
      if (!user.phone) continue;
      const progressDoc = await db.collection("students").doc(doc.id).get();
      const risk = progressDoc.data()?.lastAnalysis?.riskLevel;
      if (risk !== "high") continue;
      calls.push({ id: doc.id, name: user.name, phone: user.phone });
    }

    if (calls.length === 0) {
      return res.json({ message: "No at-risk students with phone numbers found", total: 0 });
    }

    const results = [];
    for (const c of calls) {
      try {
        const call = await client.calls.create({
          to: c.phone,
          from,
          url: buildTwimletUrl(message),
        });
        results.push({ studentId: c.id, phone: c.phone, sid: call.sid, status: call.status });
      } catch (err) {
        results.push({ studentId: c.id, phone: c.phone, error: err.message });
      }
    }

    res.json({ total: results.length, results });
  } catch (err) {
    console.error("callAtRiskStudents error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { callAtRiskStudents };
