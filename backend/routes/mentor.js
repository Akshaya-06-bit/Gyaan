const router = require("express").Router();
const {
  getAssignedMentor,
  getMentorStudents,
  getMentorSuggestions,
  sendMentorMessage,
  createSessionRequest,
  listSessionRequests,
  updateSessionRequest,
} = require("../controllers/mentorController");

router.get("/assigned/:studentId", getAssignedMentor);
router.get("/students", getMentorStudents);
router.get("/suggestions/:studentId", getMentorSuggestions);
router.post("/message", sendMentorMessage);
router.post("/session-request", createSessionRequest);
router.get("/session-request/:studentId", listSessionRequests);
router.patch("/session-request/:requestId", updateSessionRequest);

module.exports = router;
