const router = require("express").Router();
const userController = require("../controllers/userController");
const middleware = require("../utils/userUtils");

// router.post("/register", (req, res, next) => userController.saveUser);
router.route("/register")
  .post(userController.saveUser);

router.route("/login").post(userController.loginUser);
router.get("/", middleware.authenticateUser, userController.getOne);
router.post("/", userController.update);

router.put("/update-password", userController.updatePassword);
router.put("/:id", userController.update);
router.post("/logout", middleware.logout);
router.post("/send-forget-email", userController.sendEmail);
router.post("/verify-otp", userController.verifyOTP);
module.exports = router;
