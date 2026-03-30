const router = require("express").Router();
const {
  generateCourseStructure,
  generateQuiz,
  generateConceptMap,
  submitQuiz,
} = require("../controllers/aiEngineController");

router.post("/generate-course-structure", generateCourseStructure);
router.post("/generate-quiz", generateQuiz);
router.post("/generate-concept-map", generateConceptMap);
router.post("/submit-quiz", submitQuiz);

module.exports = router;
