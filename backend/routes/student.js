const express = require("express");
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalsController");

const router = express.Router();

router.get("/goals", getGoals);
router.post("/goals", createGoal);
router.put("/goals/:goalId", updateGoal);
router.delete("/goals/:goalId", deleteGoal);

module.exports = router;
