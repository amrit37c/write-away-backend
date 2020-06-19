const router = require("express").Router();
const controller = require("../controllers/volumeController");
const middleware = require("../utils/userUtils");

router.get("/:publicationId", middleware.authenticateUser, controller.getAll);
// router.post("/", middleware.authenticateUser, userController.update);

// router.put("/update-password", userController.updatePassword);

module.exports = router;
