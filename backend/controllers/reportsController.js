const { db } = require("../config/firebase");

const buildOverview = async () => {
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

const buildPerformance = async () => {
  const studentsSnapshot = await db.collection("users").where("role", "==", "student").get();
  const subjectScores = {};
  const classPerformance = {};

  for (const doc of studentsSnapshot.docs) {
    const studentClass = doc.data().class || "Unknown";
    const progressDoc = await db.collection("students").doc(doc.id).get();
    const progressData = progressDoc.data();

    if (progressData?.lastAnalysis) {
      const analysis = progressData.lastAnalysis;
      if (analysis.weakSubjects) {
        analysis.weakSubjects.forEach((subject) => {
          if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, weak: 0, strong: 0, average: 0 };
          }
          subjectScores[subject].weak++;
          subjectScores[subject].total++;
        });
      }
      if (analysis.strongSubjects) {
        analysis.strongSubjects.forEach((subject) => {
          if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, weak: 0, strong: 0, average: 0 };
          }
          subjectScores[subject].strong++;
          subjectScores[subject].total++;
        });
      }

      if (!classPerformance[studentClass]) {
        classPerformance[studentClass] = { total: 0, atRisk: 0 };
      }
      classPerformance[studentClass].total++;
      if (analysis.riskLevel === "high") classPerformance[studentClass].atRisk++;
    }
  }

  Object.keys(subjectScores).forEach((subject) => {
    const data = subjectScores[subject];
    data.average = data.total > 0 ? ((data.strong || 0) / data.total) * 100 : 0;
  });

  return { subjectScores, classPerformance };
};

const exportReport = async (req, res) => {
  const format = (req.query.format || "csv").toLowerCase();
  try {
    const overview = await buildOverview();
    const performance = await buildPerformance();

    if (format === "json") {
      return res.json({ overview, performance });
    }

    const lines = [];
    lines.push("Section,Metric,Value");
    lines.push(`Overview,Total Students,${overview.totalStudents}`);
    lines.push(`Overview,Total Mentors,${overview.totalMentors}`);
    lines.push(`Overview,Students At Risk,${overview.studentsAtRisk}`);
    lines.push(`Overview,Active Sessions,${overview.activeSessions}`);

    Object.entries(performance.subjectScores).forEach(([subject, data]) => {
      lines.push(`Subject ${subject},Strong,${data.strong || 0}`);
      lines.push(`Subject ${subject},Weak,${data.weak || 0}`);
      lines.push(`Subject ${subject},Average,${data.average.toFixed(1)}`);
    });

    Object.entries(performance.classPerformance).forEach(([cls, data]) => {
      lines.push(`Class ${cls},Total Students,${data.total}`);
      lines.push(`Class ${cls},At Risk,${data.atRisk}`);
    });

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ngo-report.csv");
    res.send(csv);
  } catch (err) {
    console.error("exportReport error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { exportReport };
