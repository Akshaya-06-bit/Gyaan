const router = require("express").Router();
const {
  getStudentsForMatching,
  getMentorsForMatching,
  performAIMatching,
  assignMentorToStudent,
  bulkAssignMentors
} = require("../controllers/matchingController");

// Get students data for matching
router.get("/students", getStudentsForMatching);

// Get mentors data for matching
router.get("/mentors", getMentorsForMatching);

// Perform AI-powered matching
router.post("/ai-match", performAIMatching);

// Assign specific mentor to student
router.post("/assign-mentor", assignMentorToStudent);

// Bulk assign mentors based on AI matches
router.post("/bulk-assign", bulkAssignMentors);

module.exports = router;
