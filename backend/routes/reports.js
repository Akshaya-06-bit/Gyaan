const router = require("express").Router();
const { exportReport } = require("../controllers/reportsController");

router.get("/export", exportReport);

module.exports = router;
