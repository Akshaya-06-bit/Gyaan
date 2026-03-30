const router = require("express").Router();
const {
  getOverview,
  getStudents,
  getMentors,
  getProgressAnalytics,
  getAIInsights,
  getRiskAlerts,
} = require("../controllers/ngoController");

router.get("/students", getStudents);
router.get("/mentors", getMentors);
router.get("/analytics", getOverview);
router.post("/ai-insights", getAIInsights);
router.get("/alerts", getRiskAlerts);
router.get("/progress", getProgressAnalytics);

module.exports = router;
