const express = require("express");
const {
  getAssignments,
  createAssignment,
  submitAssignment,
  getSubmissions,
} = require("../controllers/assignmentsController");

const router = express.Router();

router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.post("/submit-assignment", submitAssignment);
router.get("/submissions", getSubmissions);

module.exports = router;
