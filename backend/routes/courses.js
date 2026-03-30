const router = require("express").Router();
const { savePreferences, getPreferences } = require("../controllers/coursesController");
const { suggestCourses } = require("../controllers/groqController");

router.post("/preferences", savePreferences);
router.get("/preferences/:uid", getPreferences);
router.post("/suggest", suggestCourses);

module.exports = router;
