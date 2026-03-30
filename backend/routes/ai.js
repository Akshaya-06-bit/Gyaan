const router = require("express").Router();
const { analyzeStudent, getCachedAnalysis, chatWithTutor } = require("../controllers/aiController");

router.post("/analyze/:studentId", analyzeStudent);
router.get("/analyze/:studentId", getCachedAnalysis);
router.post("/chat", chatWithTutor);

module.exports = router;
