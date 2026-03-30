const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/courses/suggest
const suggestCourses = async (req, res) => {
  const { age, cls, subjects, level } = req.body;

  if (!cls || !subjects?.length || !level)
    return res.status(400).json({ error: "cls, subjects, and level are required" });

  const prompt = `You are an educational course advisor for Indian school students.

A student has the following profile:
- Age: ${age || "not specified"}
- Class: ${cls}
- Subjects needed: ${subjects.join(", ")}
- Learning level: ${level}

For EACH subject listed, suggest exactly 2 real YouTube playlists that are:
1. Appropriate for their class and level
2. Free and publicly available on YouTube
3. Preferably from well-known Indian education channels like Khan Academy India, Vedantu, BYJU'S, Unacademy, or similar

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.
Each object must have exactly these fields:
- subject (string): one of the requested subjects
- title (string): playlist title
- url (string): full YouTube playlist URL starting with https://www.youtube.com/playlist?list=
- channel (string): YouTube channel name
- description (string): one sentence about what this playlist covers
- level (string): same as input level

Example format:
[
  {
    "subject": "Math",
    "title": "Class 8 Algebra Full Course",
    "url": "https://www.youtube.com/playlist?list=PLxxxxxx",
    "channel": "Vedantu",
    "description": "Covers all algebra topics for Class 8 CBSE students.",
    "level": "Beginner"
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Groq raw response:", raw);
      return res.status(500).json({ error: "AI returned invalid format. Try again." });
    }

    const courses = JSON.parse(jsonMatch[0]);

    // Attach YouTube thumbnail from video ID if possible, else use channel placeholder
    const enriched = courses.map((c) => {
      const listId = c.url?.match(/list=([^&]+)/)?.[1];
      return {
        ...c,
        thumb: listId
          ? `https://img.youtube.com/vi/${listId}/hqdefault.jpg`
          : `https://via.placeholder.com/320x180?text=${encodeURIComponent(c.subject)}`,
        class: cls,
      };
    });

    res.json({ courses: enriched, total: enriched.length });
  } catch (err) {
    console.error("Groq suggest error:", err.message);
    res.status(500).json({ error: "AI suggestion failed: " + err.message });
  }
};

module.exports = { suggestCourses };
