const router = require("express").Router();
const userController = require("../controllers/userController");
const middleware = require("../utils/userUtils");

router.get("/", middleware.authenticateUser, userController.getOne);
module.exports = router;
