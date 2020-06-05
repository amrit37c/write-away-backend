const router = require("express").Router();
const controllers = require("../controllers/adminController");
// const middleware = require("../utils/userUtils");

router.get("/", controllers.getStats);
module.exports = router;
