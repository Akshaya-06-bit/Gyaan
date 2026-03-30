const { db } = require("../config/firebase");

const memoryGoals = {};

const buildGoal = (body) => ({
  label: body.label || "New Goal",
  progress: Number(body.progress || 0),
  total: Math.max(1, Number(body.total || 1)),
  studentId: body.studentId || "demo-student-1",
  updatedAt: new Date().toISOString(),
});

const getGoals = async (req, res) => {
  const studentId = req.query.studentId || "demo-student-1";
  try {
    const snapshot = await db.collection("goals").where("studentId", "==", studentId).get();
    const goals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ goals });
  } catch (err) {
    const goals = memoryGoals[studentId] || [];
    return res.json({ goals, source: "memory" });
  }
};

const createGoal = async (req, res) => {
  const studentId = req.body.studentId || "demo-student-1";
  const goal = buildGoal(req.body);
  try {
    const docRef = await db.collection("goals").add({
      ...goal,
      studentId,
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ goal: { id: docRef.id, ...goal, studentId } });
  } catch (err) {
    const id = `goal-${Date.now()}`;
    const next = { id, ...goal, studentId };
    memoryGoals[studentId] = [next, ...(memoryGoals[studentId] || [])];
    return res.status(201).json({ goal: next, source: "memory" });
  }
};

const updateGoal = async (req, res) => {
  const goalId = req.params.goalId;
  const studentId = req.body.studentId || "demo-student-1";
  const patch = buildGoal(req.body);
  try {
    await db.collection("goals").doc(goalId).set(patch, { merge: true });
    return res.json({ goal: { id: goalId, ...patch, studentId } });
  } catch (err) {
    const list = memoryGoals[studentId] || [];
    const updated = list.map((g) => (g.id === goalId ? { ...g, ...patch } : g));
    memoryGoals[studentId] = updated;
    const goal = updated.find((g) => g.id === goalId);
    return res.json({ goal, source: "memory" });
  }
};

const deleteGoal = async (req, res) => {
  const goalId = req.params.goalId;
  const studentId = req.query.studentId || "demo-student-1";
  try {
    await db.collection("goals").doc(goalId).delete();
    return res.json({ ok: true });
  } catch (err) {
    memoryGoals[studentId] = (memoryGoals[studentId] || []).filter((g) => g.id !== goalId);
    return res.json({ ok: true, source: "memory" });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
