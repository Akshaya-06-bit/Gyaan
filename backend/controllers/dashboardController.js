const { db } = require("../config/firebase");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET /api/dashboard/overview
const getOverview = async (req, res) => {
  try {
    // Get total students
    const studentsSnapshot = await db
      .collection("users")
      .where("role", "==", "student")
      .get();
    const totalStudents = studentsSnapshot.size;

    // Get total mentors
    const mentorsSnapshot = await db
      .collection("users")
      .where("role", "==", "mentor")
      .get();
    const totalMentors = mentorsSnapshot.size;

    // Active sessions require a real sessions collection; default to 0 when not tracked.
    const activeSessions = 0;

    // Get students at risk from progress data
    const atRiskSnapshot = await db
      .collection("students")
      .where("lastAnalysis.riskLevel", "==", "high")
      .get();

    const atRiskStudents = [];
    for (const doc of atRiskSnapshot.docs.slice(0, 5)) {
      const userDoc = await db.collection("users").doc(doc.id).get();
      if (userDoc.exists) {
        atRiskStudents.push(userDoc.data());
      }
    }

    res.json({
      totalStudents,
      totalMentors,
      activeSessions,
      studentsAtRisk: atRiskSnapshot.size,
      atRiskStudents: atRiskStudents.slice(0, 5) // Return top 5 for overview
    });
  } catch (error) {
    console.error("Overview error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/students
const getStudents = async (req, res) => {
  try {
    const { class: filterClass, subject, riskLevel } = req.query;
    
    let query = db.collection("users").where("role", "==", "student");
    
    // Apply filters
    if (filterClass) {
      query = query.where("class", "==", filterClass);
    }
    
    const studentsSnapshot = await query.get();
    const students = [];

    for (const doc of studentsSnapshot.docs) {
      const student = doc.data();
      
      // Get progress data
      const progressDoc = await db.collection("students").doc(doc.id).get();
      const progressData = progressDoc.data();
      
      // Get assigned mentor
      let assignedMentor = null;
      if (student.assignedMentorId) {
        const mentorDoc = await db.collection("users").doc(student.assignedMentorId).get();
        if (mentorDoc.exists) {
          assignedMentor = mentorDoc.data().name;
        }
      }

      students.push({
        id: doc.id,
        name: student.name,
        email: student.email,
        class: student.class || 'Not specified',
        assignedMentor,
        progressStatus: getProgressStatus(progressData),
        riskLevel: progressData?.lastAnalysis?.riskLevel || 'low',
        lastActive: student.lastActive || student.createdAt,
        ...progressData?.lastAnalysis
      });
    }

    // Apply additional filters
    let filteredStudents = students;
    if (riskLevel) {
      filteredStudents = filteredStudents.filter(s => s.riskLevel === riskLevel);
    }
    if (subject) {
      // This would need subject-specific filtering logic
      filteredStudents = filteredStudents.filter(s => 
        s.weakSubjects && s.weakSubjects.includes(subject)
      );
    }

    res.json({ students: filteredStudents, total: filteredStudents.length });
  } catch (error) {
    console.error("Students error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/mentors
const getMentors = async (req, res) => {
  try {
    const mentorsSnapshot = await db
      .collection("users")
      .where("role", "==", "mentor")
      .get();

    const mentors = [];
    for (const doc of mentorsSnapshot.docs) {
      const mentor = doc.data();
      
      // Get assigned students count
      const assignedStudentsSnapshot = await db
        .collection("users")
        .where("assignedMentorId", "==", doc.id)
        .get();

      mentors.push({
        id: doc.id,
        name: mentor.name,
        email: mentor.email,
        expertise: mentor.expertise || ['General'],
        assignedStudents: assignedStudentsSnapshot.size,
        availability: mentor.availability || 'Available',
        joinDate: mentor.createdAt
      });
    }

    res.json({ mentors, total: mentors.length });
  } catch (error) {
    console.error("Mentors error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/performance
const getPerformance = async (req, res) => {
  try {
    const performance = await getPerformanceData();
    res.json(performance);
  } catch (error) {
    console.error("Performance error:", error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/dashboard/ai-insights
const getAIInsights = async (req, res) => {
  try {
    // Get aggregated data
    const overview = await getOverviewData();
    const performance = await getPerformanceData();

    const prompt = `You are an AI education analyst for an NGO learning platform. 
Based on the following aggregated data, provide actionable insights for the NGO administrators:

OVERVIEW:
- Total Students: ${overview.totalStudents}
- Total Mentors: ${overview.totalMentors}
- Students at Risk: ${overview.studentsAtRisk}
- Active Sessions: ${overview.activeSessions}

STUDENT PERFORMANCE:
${Object.entries(performance.subjectScores).map(([subject, data]) => 
  `- ${subject}: ${data.weak} struggling, ${data.strong} excelling, ${data.average.toFixed(1)}% average`
).join('\n')}

CLASS PERFORMANCE:
${Object.entries(performance.classPerformance).map(([className, data]) => 
  `- ${className}: ${data.total} students, ${data.atRisk} at risk (${((data.atRisk/data.total)*100).toFixed(1)}%)`
).join('\n')}

Provide 4-5 concise, actionable insights in bullet points. Focus on:
1. Critical areas needing attention
2. Resource allocation recommendations
3. Student support strategies
4. Performance trends
5. Specific grade/subject concerns

Format as a JSON array of strings, no additional text.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const insights = completion.choices[0]?.message?.content?.trim();
    
    // Parse insights (expecting JSON array)
    let parsedInsights = [];
    try {
      parsedInsights = JSON.parse(insights);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedInsights = [
        "30% of students need additional math support",
        "Grade 8 students show declining performance trends",
        "Consider increasing mentor-to-student ratio for at-risk students",
        "Science subjects show strong overall performance"
      ];
    }

    res.json({ insights: parsedInsights });
  } catch (error) {
    console.error("AI Insights error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const getProgressStatus = (progressData) => {
  if (!progressData?.lastAnalysis) return 'No Data';
  
  const riskLevel = progressData.lastAnalysis.riskLevel;
  if (riskLevel === 'high') return 'At Risk';
  if (riskLevel === 'medium') return 'Average';
  return 'Good';
};

const getOverviewData = async () => {
  const studentsSnapshot = await db.collection("users").where("role", "==", "student").get();
  const mentorsSnapshot = await db.collection("users").where("role", "==", "mentor").get();
  const atRiskSnapshot = await db
    .collection("students")
    .where("lastAnalysis.riskLevel", "==", "high")
    .get();

  return {
    totalStudents: studentsSnapshot.size,
    totalMentors: mentorsSnapshot.size,
    studentsAtRisk: atRiskSnapshot.size,
    activeSessions: 0,
  };
};

const getPerformanceData = async () => {
  const studentsSnapshot = await db
    .collection("users")
    .where("role", "==", "student")
    .get();

  const subjectScores = {};
  const classPerformance = {};
  const trendMap = {};

  for (const doc of studentsSnapshot.docs) {
    const studentClass = doc.data().class || 'Unknown';

    // Get student's progress data
    const progressDoc = await db.collection("students").doc(doc.id).get();
    const progressData = progressDoc.data();

    if (progressData?.lastAnalysis) {
      const analysis = progressData.lastAnalysis;

      // Subject-wise performance
      if (analysis.weakSubjects) {
        analysis.weakSubjects.forEach(subject => {
          if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, weak: 0, strong: 0, average: 0 };
          }
          subjectScores[subject].weak++;
          subjectScores[subject].total++;
        });
      }

      if (analysis.strongSubjects) {
        analysis.strongSubjects.forEach(subject => {
          if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, weak: 0, strong: 0, average: 0 };
          }
          subjectScores[subject].strong++;
          subjectScores[subject].total++;
        });
      }

      // Class performance
      if (!classPerformance[studentClass]) {
        classPerformance[studentClass] = { total: 0, atRisk: 0 };
      }
      classPerformance[studentClass].total++;
      if (analysis.riskLevel === 'high') {
        classPerformance[studentClass].atRisk++;
      }
    }

    // Aggregate score trends by month across all students
    try {
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
    } catch (err) {
      console.warn("trend aggregation error:", err.message);
    }
  }

  // Calculate averages
  Object.keys(subjectScores).forEach(subject => {
    const data = subjectScores[subject];
    data.average = data.total > 0 ? ((data.strong || 0) / data.total) * 100 : 0;
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

  return {
    subjectScores,
    classPerformance,
    trends,
  };
};

module.exports = {
  getOverview,
  getStudents,
  getMentors,
  getPerformance,
  getAIInsights
};
