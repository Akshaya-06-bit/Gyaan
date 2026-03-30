const router = require("express").Router();
const {
  getOverview,
  getStudents,
  getMentors,
  getPerformance,
  getAIInsights
} = require("../controllers/dashboardController");

// Dashboard overview
router.get("/overview", getOverview);

// Student analytics
router.get("/students", getStudents);

// Mentor management
router.get("/mentors", getMentors);

// Performance insights
router.get("/performance", getPerformance);

// AI-generated insights
router.post("/ai-insights", getAIInsights);

module.exports = router;
