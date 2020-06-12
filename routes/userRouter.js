const router = require("express").Router();
const userController = require("../controllers/userController");
const middleware = require("../utils/userUtils");
const validator = require("../Validations/userValidations");

// router.post("/register", (req, res, next) => userController.saveUser);
router.route("/register")
  .post(validator.validate, userController.saveUser);

router.route("/login").post(userController.loginUser);
router.get("/", middleware.authenticateUser, userController.getOne);
router.post("/", userController.update);

router.put("/update-password", userController.updatePassword);
router.put("/:id", middleware.authenticatedUser, userController.update);
router.post("/logout", middleware.logout);
router.post("/send-forget-email", userController.sendEmail);
router.post("/resend-otp", userController.resendOTP);
router.post("/verify-otp", userController.verifyOTP);
router.post("/verify-signup-otp", userController.verifySignUpOTP);
router.get("/verify-user/:id", userController.verifyUser);
router.post("/feedback", userController.sendFeedBack);
router.post("/testimonial", userController.sendTestimonial);
router.post("/contactus", userController.sendContactUs);

module.exports = router;
