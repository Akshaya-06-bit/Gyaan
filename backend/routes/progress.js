const router = require("express").Router();
const {
  addTestScore,
  getTestScores,
  getStudentSummary,
} = require("../controllers/progressController");

router.post("/:studentId/scores", addTestScore);
router.get("/:studentId/scores", getTestScores);
router.get("/:studentId/summary", getStudentSummary);

module.exports = router;
