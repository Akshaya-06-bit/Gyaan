const { db, auth } = require("../config/firebase");

const demoStudents = [
  { id: "demo-student-1", name: "Mallik", email: "mallik@student.demo", class: "Grade 9", phone: "+919154127948", risk: "high" },
  { id: "demo-student-2", name: "Gowtham", email: "gowtham@student.demo", class: "Grade 8", phone: "+918519977380", risk: "high" },
  { id: "demo-student-3", name: "Aarav Kumar", email: "aarav@student.demo", class: "Grade 8", phone: "+919999111111", risk: "medium" },
  { id: "demo-student-4", name: "Isha Verma", email: "isha@student.demo", class: "Grade 9", phone: "+919999222222", risk: "medium" },
  { id: "demo-student-5", name: "Rohan Mehta", email: "rohan@student.demo", class: "Grade 10", phone: "+919999333333", risk: "low" },
];

const demoMentors = [
  { id: "demo-mentor-1", name: "Neha Rao", email: "neha@mentor.demo", expertise: ["Math", "Science"], experienceLevel: "Intermediate" },
  { id: "demo-mentor-2", name: "Vikram Shah", email: "vikram@mentor.demo", expertise: ["English", "History"], experienceLevel: "Advanced" },
  { id: "demo-mentor-3", name: "Anita Joshi", email: "anita@mentor.demo", expertise: ["Biology", "Chemistry"], experienceLevel: "Intermediate" },
  { id: "demo-mentor-4", name: "Rahul Das", email: "rahul@mentor.demo", expertise: ["Physics", "Math"], experienceLevel: "Advanced" },
];

const sampleScores = [
  { subject: "Math", score: 72, maxScore: 100, date: "2024-01-10", testName: "Math Test 1" },
  { subject: "Science", score: 85, maxScore: 100, date: "2024-01-10", testName: "Science Test 1" },
  { subject: "English", score: 60, maxScore: 100, date: "2024-01-10", testName: "English Test 1" },
  { subject: "Math", score: 65, maxScore: 100, date: "2024-02-14", testName: "Math Test 2" },
  { subject: "Science", score: 78, maxScore: 100, date: "2024-02-14", testName: "Science Test 2" },
  { subject: "English", score: 55, maxScore: 100, date: "2024-02-14", testName: "English Test 2" },
  { subject: "Math", score: 80, maxScore: 100, date: "2024-03-20", testName: "Math Test 3" },
  { subject: "Science", score: 90, maxScore: 100, date: "2024-03-20", testName: "Science Test 3" },
  { subject: "English", score: 62, maxScore: 100, date: "2024-03-20", testName: "English Test 3" },
  { subject: "History", score: 70, maxScore: 100, date: "2024-04-18", testName: "History Test 1" },
];

const seedDemoData = async (req, res) => {
  try {
    const batch = db.batch();

    demoStudents.forEach((s, idx) => {
      const userRef = db.collection("users").doc(s.id);
      batch.set(userRef, {
        name: s.name,
        email: s.email,
        role: "student",
        class: s.class,
        phone: s.phone,
        createdAt: new Date().toISOString(),
        assignedMentorId: demoMentors[idx % demoMentors.length].id,
      }, { merge: true });

      const studentDocRef = db.collection("students").doc(s.id);
      batch.set(studentDocRef, {
        lastAnalysis: {
          riskLevel: s.risk || "low",
          overallAvg: s.risk === "high" ? 48 : s.risk === "medium" ? 62 : 78,
          weakSubjects: s.risk === "high" ? ["Math", "English"] : s.risk === "medium" ? ["Science"] : [],
        },
      }, { merge: true });

      const scoresRef = db.collection("students").doc(s.id).collection("scores");
      sampleScores.forEach((sc, i) => {
        const docRef = scoresRef.doc(`${s.id}-score-${i}`);
        batch.set(docRef, { ...sc, createdAt: new Date().toISOString() });
      });
    });

    demoMentors.forEach((m) => {
      const userRef = db.collection("users").doc(m.id);
      batch.set(userRef, {
        name: m.name,
        email: m.email,
        role: "mentor",
        expertise: m.expertise,
        experienceLevel: m.experienceLevel,
        availability: "Available",
        createdAt: new Date().toISOString(),
      }, { merge: true });
    });

    await batch.commit();

    // Best-effort: set custom claims (non-blocking)
    demoStudents.forEach((s) => auth.setCustomUserClaims(s.id, { role: "student" }).catch(() => {}));
    demoMentors.forEach((m) => auth.setCustomUserClaims(m.id, { role: "mentor" }).catch(() => {}));

    res.json({
      message: "Demo students and mentors seeded",
      students: demoStudents.length,
      mentors: demoMentors.length,
    });
  } catch (err) {
    console.error("seedDemoData error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { seedDemoData };
