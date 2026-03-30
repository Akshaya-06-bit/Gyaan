const router = require("express").Router();
const { seedDemoData } = require("../controllers/seedController");

router.post("/demo", seedDemoData);

module.exports = router;
