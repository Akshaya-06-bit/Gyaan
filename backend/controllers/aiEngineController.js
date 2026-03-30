const { db } = require("../config/firebase");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const buildPrompt = (subject, classLevel, topic) =>
  `Return ONLY valid JSON. Do not include markdown, comments, or trailing commas.
Generate a structured learning path for ${classLevel} ${subject} ${
    topic ? `on ${topic}` : ""
  }.
Required JSON shape:
{
  "subject": string,
  "classLevel": string,
  "topic": string,
  "tree": [{"title": string, "children": [{"title": string, "children": [{"title": string}]}]}],
  "roadmap": [string]
}`;

const sanitizeJson = (text) => {
  if (!text) return "";
  let t = text.trim();
  // Remove code fences
  t = t.replace(/```json/gi, "").replace(/```/g, "").trim();
  // Extract first JSON object
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  // Replace smart quotes
  t = t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  // Remove trailing commas before } or ]
  t = t.replace(/,\s*([}\]])/g, "$1");
  return t;
};

const parseJsonOrThrow = (raw) => {
  const cleaned = sanitizeJson(raw);
  return JSON.parse(cleaned);
};

const trySave = async (collection, payload) => {
  try {
    const doc = await db.collection(collection).add(payload);
    return doc.id;
  } catch (err) {
    console.warn(`Firestore save failed for ${collection}:`, err.message);
    return null;
  }
};

const generateCourseStructure = async (req, res) => {
  const { subject, classLevel, topic, studentId } = req.body;
  if (!subject || !classLevel) return res.status(400).json({ error: "subject and classLevel required" });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: buildPrompt(subject, classLevel, topic) }],
      temperature: 0.3,
      max_tokens: 800,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    const payload = parseJsonOrThrow(raw);
    const savedId = await trySave("courseStructures", {
      ...payload,
      studentId: studentId || null,
      createdAt: new Date().toISOString(),
    });
    res.json({ id: savedId, ...payload });
  } catch (err) {
    console.error("generateCourseStructure error:", err);
    res.status(500).json({ error: err.message });
  }
};

const generateQuiz = async (req, res) => {
  const { topic, classLevel, studentId } = req.body;
  if (!topic || !classLevel) return res.status(400).json({ error: "topic and classLevel required" });

  try {
    const prompt = `Return ONLY valid JSON. Do not include markdown, comments, or trailing commas.
Generate a quiz for ${classLevel} on ${topic}.
Required JSON shape:
{
  "topic": string,
  "level": string,
  "questions": [{"id": string, "type": "mcq"|"short", "question": string, "options"?: [string], "answer": string}]
}`;
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    const payload = parseJsonOrThrow(raw);
    const savedId = await trySave("quizzes", {
      ...payload,
      studentId: studentId || null,
      createdAt: new Date().toISOString(),
    });
    res.json({ id: savedId, ...payload });
  } catch (err) {
    console.error("generateQuiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

const generateConceptMap = async (req, res) => {
  const { topic, subject, classLevel } = req.body;
  if (!topic) return res.status(400).json({ error: "topic required" });
  try {
    const prompt = `Return ONLY valid JSON. Do not include markdown, comments, or trailing commas.
Generate a concept map for ${classLevel || ""} ${subject || ""} on ${topic}.
Required JSON shape:
{
  "topic": string,
  "nodes": [{"id": string, "label": string}],
  "edges": [{"from": string, "to": string}]
}`;
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 700,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    const payload = parseJsonOrThrow(raw);
    const savedId = await trySave("conceptMaps", {
      ...payload,
      createdAt: new Date().toISOString(),
    });
    res.json({ id: savedId, ...payload });
  } catch (err) {
    console.error("generateConceptMap error:", err);
    res.status(500).json({ error: err.message });
  }
};

const submitQuiz = async (req, res) => {
  const { quizId, studentId, responses } = req.body;
  if (!quizId || !responses) return res.status(400).json({ error: "quizId and responses required" });
  try {
    const quizDoc = await db.collection("quizzes").doc(quizId).get();
    if (!quizDoc.exists) return res.status(404).json({ error: "Quiz not found" });
    const quiz = quizDoc.data();
    const questions = quiz.questions || [];
    let score = 0;
    questions.forEach((q) => {
      const r = responses[q.id];
      if (r && String(r).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) {
        score++;
      }
    });
    const result = {
      quizId,
      studentId: studentId || null,
      score,
      total: questions.length,
      responses,
      submittedAt: new Date().toISOString(),
    };
    await trySave("quizResults", result);
    res.json(result);
  } catch (err) {
    console.error("submitQuiz error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  INSIGHTS_PROMPT: buildPrompt("Math", "Grade 8", "Algebra"),
  generateCourseStructure,
  generateQuiz,
  generateConceptMap,
  submitQuiz,
};
