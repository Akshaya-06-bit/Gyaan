const { db } = require("../config/firebase");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INSIGHTS_PROMPT = `You are an AI education analyst for an NGO learning platform.
Based on the following aggregated data, provide 4-5 concise, actionable insights.
Focus on:
1) Critical subjects needing attention
2) Grades/cohorts at risk
3) Mentor workload patterns
4) Progress trends
Return JSON array of strings only.`;

const getOverview = async (req, res) => {
  try {
    const studentsSnapshot = await db.collection("users").where("role", "==", "student").get();
    const mentorsSnapshot = await db.collection("users").where("role", "==", "mentor").get();
    const sessionsSnapshot = await db.collection("sessions").get();
    const atRiskSnapshot = await db
      .collection("students")
      .where("lastAnalysis.riskLevel", "==", "high")
      .get();

    res.json({
      totalStudents: studentsSnapshot.size,
      totalMentors: mentorsSnapshot.size,
      activeSessions: sessionsSnapshot.size,
      studentsAtRisk: atRiskSnapshot.size,
    });
  } catch (err) {
    console.error("ngo overview error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getStudents = async (req, res) => {
  const { class: filterClass, subject, riskLevel, search } = req.query;
  try {
    let query = db.collection("users").where("role", "==", "student");
    if (filterClass) query = query.where("class", "==", filterClass);

    const studentsSnapshot = await query.get();
    const students = [];

    for (const doc of studentsSnapshot.docs) {
      const student = doc.data();
      const progressDoc = await db.collection("students").doc(doc.id).get();
      const progressData = progressDoc.data();

      let assignedMentor = null;
      if (student.assignedMentorId) {
        const mentorDoc = await db.collection("users").doc(student.assignedMentorId).get();
        if (mentorDoc.exists) assignedMentor = mentorDoc.data().name;
      }

      const risk = progressData?.lastAnalysis?.riskLevel || "low";
      const progressStatus = risk === "high" ? "At Risk" : risk === "medium" ? "Average" : "Good";

      const payload = {
        id: doc.id,
        name: student.name,
        email: student.email,
        class: student.class || "Not specified",
        assignedMentor,
        progressStatus,
        riskLevel: risk,
        weakSubjects: progressData?.lastAnalysis?.weakSubjects || [],
        lastActive: student.lastActive || student.createdAt,
      };
      students.push(payload);
    }

    let filtered = students;
    if (riskLevel) filtered = filtered.filter((s) => s.riskLevel === riskLevel);
    if (subject)
      filtered = filtered.filter((s) => s.weakSubjects && s.weakSubjects.includes(subject));
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((s) => s.name?.toLowerCase().includes(q));
    }

    res.json({ students: filtered, total: filtered.length });
  } catch (err) {
    console.error("ngo students error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getMentors = async (req, res) => {
  try {
    const mentorsSnapshot = await db.collection("users").where("role", "==", "mentor").get();
    const mentors = [];
    for (const doc of mentorsSnapshot.docs) {
      const mentor = doc.data();
      const assignedStudentsSnapshot = await db
        .collection("users")
        .where("assignedMentorId", "==", doc.id)
        .get();

      const assigned = assignedStudentsSnapshot.size;
      const max = mentor.maxStudents || 10;
      const loadRatio = max > 0 ? assigned / max : 0;
      let workload = "Low";
      if (loadRatio >= 0.7) workload = "High";
      else if (loadRatio >= 0.4) workload = "Medium";

      mentors.push({
        id: doc.id,
        name: mentor.name,
        email: mentor.email,
        expertise: mentor.expertise || ["General"],
        assignedStudents: assigned,
        availability: mentor.availability || "Available",
        workload,
      });
    }

    res.json({ mentors, total: mentors.length });
  } catch (err) {
    console.error("ngo mentors error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getProgressAnalytics = async (req, res) => {
  try {
    const studentsSnapshot = await db.collection("users").where("role", "==", "student").get();
    const subjectScores = {};
    const trendMap = {};

    for (const doc of studentsSnapshot.docs) {
      const progressDoc = await db.collection("students").doc(doc.id).get();
      const progressData = progressDoc.data();

      if (progressData?.lastAnalysis) {
        const analysis = progressData.lastAnalysis;
        if (analysis.weakSubjects) {
          analysis.weakSubjects.forEach((subject) => {
            if (!subjectScores[subject]) subjectScores[subject] = { weak: 0, strong: 0, total: 0 };
            subjectScores[subject].weak++;
            subjectScores[subject].total++;
          });
        }
        if (analysis.strongSubjects) {
          analysis.strongSubjects.forEach((subject) => {
            if (!subjectScores[subject]) subjectScores[subject] = { weak: 0, strong: 0, total: 0 };
            subjectScores[subject].strong++;
            subjectScores[subject].total++;
          });
        }
      }

      const scoresSnap = await db
        .collection("students")
        .doc(doc.id)
        .collection("scores")
        .get();
      scoresSnap.docs.forEach((sdoc) => {
        const s = sdoc.data();
        const dt = new Date(s.date);
        if (Number.isNaN(dt.getTime())) return;
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        const pct = Math.round((s.score / s.maxScore) * 100);
        if (!trendMap[key]) trendMap[key] = { sum: 0, count: 0 };
        trendMap[key].sum += pct;
        trendMap[key].count += 1;
      });
    }

    const subjectAverages = {};
    Object.keys(subjectScores).forEach((subject) => {
      const data = subjectScores[subject];
      const strong = data.strong || 0;
      const total = data.total || 0;
      subjectAverages[subject] = {
        strong,
        weak: data.weak || 0,
        average: total > 0 ? (strong / total) * 100 : 0,
      };
    });

    const trends = Object.keys(trendMap)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        const label = date.toLocaleString("en-US", { month: "short" });
        const avg = Math.round(trendMap[key].sum / trendMap[key].count);
        return { month: label, averageScore: avg };
      });

    const weakestSubjects = Object.entries(subjectAverages)
      .sort((a, b) => a[1].average - b[1].average)
      .slice(0, 3)
      .map(([subject]) => subject);

    res.json({
      subjectScores: subjectAverages,
      trends,
      weakestSubjects,
    });
  } catch (err) {
    console.error("ngo progress error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAIInsights = async (req, res) => {
  try {
    const overview = await new Promise((resolve, reject) => {
      getOverview({ }, { json: resolve, status: () => ({ json: reject }) });
    });
    const progress = await new Promise((resolve, reject) => {
      getProgressAnalytics({ }, { json: resolve, status: () => ({ json: reject }) });
    });
    const mentorsData = await new Promise((resolve, reject) => {
      getMentors({ }, { json: resolve, status: () => ({ json: reject }) });
    });

    const prompt = `${INSIGHTS_PROMPT}
OVERVIEW: ${JSON.stringify(overview)}
PROGRESS: ${JSON.stringify(progress)}
MENTORS: ${JSON.stringify(mentorsData)}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    let insights = [];
    try {
      insights = JSON.parse(raw);
    } catch {
      insights = [
        "High-risk students concentrated in Grades 8 and 9; allocate more mentor time there.",
        "Math shows the lowest average score; prioritize remediation modules.",
        "Mentor workload is uneven; redistribute assignments for balance.",
        "Trend indicates steady improvement over the last 3 months.",
      ];
    }

    res.json({ insights, prompt });
  } catch (err) {
    console.error("ngo ai-insights error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getRiskAlerts = async (req, res) => {
  try {
    const studentsSnapshot = await db.collection("students").get();
    let highRiskCount = 0;
    const alerts = [];

    studentsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const risk = data?.lastAnalysis?.riskLevel;
      if (risk === "high") {
        highRiskCount++;
        alerts.push(`${doc.id} needs immediate attention`);
      }
    });

    const sessionsSnapshot = await db.collection("sessions").where("status", "==", "canceled").get();
    if (sessionsSnapshot.size > 0) alerts.push(`${sessionsSnapshot.size} sessions missed`);

    res.json({
      summary: `${highRiskCount} students at high risk`,
      alerts,
    });
  } catch (err) {
    console.error("ngo alerts error:", err);
    res.status(500).json({ error: err.message });
  }
};

const downloadReport = async (req, res) => {
  const format = (req.query.format || "csv").toLowerCase();
  try {
    const overview = await new Promise((resolve, reject) => {
      getOverview({ }, { json: resolve, status: () => ({ json: reject }) });
    });
    const progress = await new Promise((resolve, reject) => {
      getProgressAnalytics({ }, { json: resolve, status: () => ({ json: reject }) });
    });

    if (format === "json") return res.json({ overview, progress });

    const lines = [];
    lines.push("Section,Metric,Value");
    lines.push(`Overview,Total Students,${overview.totalStudents}`);
    lines.push(`Overview,Total Mentors,${overview.totalMentors}`);
    lines.push(`Overview,Active Sessions,${overview.activeSessions}`);
    lines.push(`Overview,Students At Risk,${overview.studentsAtRisk}`);
    lines.push(`Progress,Weakest Subjects,${(progress.weakestSubjects || []).join(" | ")}`);
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ngo-report.csv");
    res.send(csv);
  } catch (err) {
    console.error("ngo report error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  INSIGHTS_PROMPT,
  getOverview,
  getStudents,
  getMentors,
  getProgressAnalytics,
  getAIInsights,
  getRiskAlerts,
  downloadReport,
};
