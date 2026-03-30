const router = require("express").Router();
const {
  getOverview,
  getStudents,
  getMentors,
  getProgressAnalytics,
  getAIInsights,
  getRiskAlerts,
  downloadReport,
} = require("../controllers/ngoController");
const { callAtRiskStudents } = require("../controllers/callsController");

router.get("/analytics", getOverview);
router.get("/students", getStudents);
router.get("/mentors", getMentors);
router.get("/progress", getProgressAnalytics);
router.post("/ai-insights", getAIInsights);
router.get("/alerts", getRiskAlerts);
router.get("/report", downloadReport);
router.post("/call-at-risk", callAtRiskStudents);

module.exports = router;
