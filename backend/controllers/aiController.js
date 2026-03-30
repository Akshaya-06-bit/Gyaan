const { db } = require("../config/firebase");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rule-based AI analysis (no external API key needed)
const analyzeScores = (subjectAverages, scores) => {
  const weak    = subjectAverages.filter((s) => s.avg < 60);
  const medium  = subjectAverages.filter((s) => s.avg >= 60 && s.avg < 75);
  const strong  = subjectAverages.filter((s) => s.avg >= 75);

  // Detect declining trend in last 3 scores per subject
  const declining = subjectAverages.filter(({ entries }) => {
    if (entries.length < 3) return false;
    const last3 = entries.slice(-3).map((e) => e.pct);
    return last3[2] < last3[1] && last3[1] < last3[0];
  });

  // Overall average
  const overallAvg =
    subjectAverages.length > 0
      ? Math.round(subjectAverages.reduce((s, e) => s + e.avg, 0) / subjectAverages.length)
      : 0;

  // Risk level
  let riskLevel = "low";
  if (weak.length >= 2 || overallAvg < 55 || declining.length >= 2) riskLevel = "high";
  else if (weak.length === 1 || overallAvg < 70 || declining.length === 1) riskLevel = "medium";

  // Suggestions
  const suggestions = [];
  weak.forEach(({ subject }) => {
    suggestions.push(`Focus on ${subject} — average is below 60%. Consider extra practice sessions.`);
  });
  declining.forEach(({ subject }) => {
    if (!weak.find((w) => w.subject === subject))
      suggestions.push(`${subject} scores are declining. Review recent topics and seek mentor help.`);
  });
  medium.forEach(({ subject }) => {
    suggestions.push(`${subject} is average. Consistent practice can push it to the next level.`);
  });
  strong.forEach(({ subject }) => {
    suggestions.push(`Great work in ${subject}! Keep maintaining this performance.`);
  });

  if (suggestions.length === 0)
    suggestions.push("Overall performance looks good. Keep up the consistent effort!");

  return {
    overallAvg,
    riskLevel,
    weakSubjects: weak.map((s) => s.subject),
    decliningSubjects: declining.map((s) => s.subject),
    strongSubjects: strong.map((s) => s.subject),
    suggestions,
    analyzedAt: new Date().toISOString(),
  };
};

// POST /api/ai/analyze/:studentId
const analyzeStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    const scoresSnap = await db
      .collection("students")
      .doc(studentId)
      .collection("scores")
      .orderBy("date", "asc")
      .get();

    if (scoresSnap.empty)
      return res.status(404).json({ error: "No scores found for this student" });

    const scores = scoresSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Build subject averages
    const subjectMap = {};
    scores.forEach(({ subject, score, maxScore, date, testName }) => {
      if (!subjectMap[subject]) subjectMap[subject] = [];
      subjectMap[subject].push({ score, maxScore, date, testName, pct: Math.round((score / maxScore) * 100) });
    });
    const subjectAverages = Object.entries(subjectMap).map(([subject, entries]) => {
      const avg = Math.round(entries.reduce((s, e) => s + e.pct, 0) / entries.length);
      return { subject, avg, entries };
    });

    const analysis = analyzeScores(subjectAverages, scores);

    // Cache analysis in Firestore
    await db.collection("students").doc(studentId).set(
      { lastAnalysis: analysis },
      { merge: true }
    );

    res.json(analysis);
  } catch (err) {
    console.error("analyzeStudent error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ai/analyze/:studentId  — return cached analysis
const getCachedAnalysis = async (req, res) => {
  const { studentId } = req.params;
  try {
    const doc = await db.collection("students").doc(studentId).get();
    if (!doc.exists || !doc.data()?.lastAnalysis)
      return res.status(404).json({ error: "No analysis found. Run POST first." });
    res.json(doc.data().lastAnalysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/chat
const chatWithTutor = async (req, res) => {
  const { message, studentId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Get student context if studentId provided
    let contextPrompt = "";
    if (studentId) {
      try {
        const studentDoc = await db.collection("users").doc(studentId).get();
        if (studentDoc.exists) {
          const studentData = studentDoc.data();
          contextPrompt = `Student profile: ${studentData.name}, Role: ${studentData.role}. `;
        }
      } catch (err) {
        console.log("Could not fetch student context:", err.message);
      }
    }

    const systemPrompt = `${contextPrompt}You are a helpful AI tutor for Indian school students. 
- Provide clear, educational answers
- Be encouraging and supportive
- Keep answers concise but thorough
- Use examples relevant to Indian curriculum
- If you don't know something, admit it honestly
- Respond in a friendly, conversational tone`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    
    if (!reply) {
      return res.status(500).json({ error: "AI tutor failed to respond" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat tutor error:", err.message);
    res.status(500).json({ error: "AI tutor error: " + err.message });
  }
};

module.exports = { analyzeStudent, getCachedAnalysis, chatWithTutor };
