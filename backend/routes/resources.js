const router = require("express").Router();
const { createResource, listResources } = require("../controllers/resourcesController");

router.post("/", createResource);
router.get("/", listResources);

module.exports = router;
