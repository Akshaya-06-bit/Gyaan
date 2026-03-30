const router = require("express").Router();
const {
  createSession,
  listSessions,
  updateSessionStatus,
} = require("../controllers/sessionsController");

router.post("/", createSession);
router.get("/", listSessions);
router.patch("/:sessionId/status", updateSessionStatus);

module.exports = router;
