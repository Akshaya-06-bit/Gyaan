const { db } = require("../config/firebase");

const memory = {
  assignments: [],
  submissions: [],
};

const seedIfEmpty = () => {
  if (memory.assignments.length) return;
  memory.assignments.push(
    {
      id: "a1",
      title: "Algebra Practice Set",
      subject: "Math",
      description: "Solve 5 linear equation problems.",
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      assignedStudents: ["student@demo.com"],
      createdBy: "mentor@demo.com",
      createdAt: new Date().toISOString(),
    },
    {
      id: "a2",
      title: "Reading Comprehension",
      subject: "English",
      description: "Summarize the passage and answer 3 questions.",
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignedStudents: ["student@demo.com"],
      createdBy: "mentor@demo.com",
      createdAt: new Date().toISOString(),
    }
  );
};

const getAssignments = async (req, res) => {
  const studentId = req.query.studentId;
  try {
    let query = db.collection("assignments");
    if (studentId) {
      query = query.where("assignedStudents", "array-contains", studentId);
    }
    const snapshot = await query.get();
    const assignments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ assignments });
  } catch (err) {
    seedIfEmpty();
    const list = studentId
      ? memory.assignments.filter((a) => a.assignedStudents.includes(studentId))
      : memory.assignments;
    return res.json({ assignments: list, source: "memory" });
  }
};

const createAssignment = async (req, res) => {
  const { title, subject, description, dueDate, assignedStudents, createdBy } = req.body;
  if (!title || !subject || !description || !dueDate)
    return res.status(400).json({ error: "Missing required fields" });

  const payload = {
    title,
    subject,
    description,
    dueDate,
    assignedStudents: assignedStudents || [],
    createdBy: createdBy || "admin",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection("assignments").add(payload);
    return res.status(201).json({ assignment: { id: docRef.id, ...payload } });
  } catch (err) {
    const id = `a-${Date.now()}`;
    const assignment = { id, ...payload };
    memory.assignments.unshift(assignment);
    return res.status(201).json({ assignment, source: "memory" });
  }
};

const submitAssignment = async (req, res) => {
  const { assignmentId, studentId, submissionText, fileName } = req.body;
  if (!assignmentId || !studentId)
    return res.status(400).json({ error: "Missing required fields" });

  const payload = {
    assignmentId,
    studentId,
    submissionText: submissionText || "",
    fileName: fileName || "",
    submittedAt: new Date().toISOString(),
    status: "Submitted",
  };

  try {
    const docRef = await db.collection("submissions").add(payload);
    return res.status(201).json({ submission: { id: docRef.id, ...payload } });
  } catch (err) {
    const id = `s-${Date.now()}`;
    const submission = { id, ...payload };
    memory.submissions.unshift(submission);
    return res.status(201).json({ submission, source: "memory" });
  }
};

const getSubmissions = async (req, res) => {
  const assignmentId = req.query.assignmentId;
  try {
    let query = db.collection("submissions");
    if (assignmentId) query = query.where("assignmentId", "==", assignmentId);
    const snapshot = await query.get();
    const submissions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ submissions });
  } catch (err) {
    const list = assignmentId
      ? memory.submissions.filter((s) => s.assignmentId === assignmentId)
      : memory.submissions;
    return res.json({ submissions: list, source: "memory" });
  }
};

module.exports = { getAssignments, createAssignment, submitAssignment, getSubmissions };
