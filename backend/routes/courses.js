const router = require("express").Router();
const { savePreferences, getPreferences } = require("../controllers/coursesController");
const { suggestCourses, generateQuiz, generateStructure, generateMindMap } = require("../controllers/groqController");

router.post("/preferences", savePreferences);
router.get("/preferences/:uid", getPreferences);
router.post("/suggest", suggestCourses);
router.post("/quiz", generateQuiz);
router.post("/structure", generateStructure);
router.post("/mindmap", generateMindMap);

module.exports = router;
