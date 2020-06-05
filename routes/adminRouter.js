const router = require("express").Router();
const multer = require("multer");
const userController = require("../controllers/userController");
const blogController = require("../controllers/blogController");
const adminController = require("../controllers/adminController");

const middleware = require("../utils/userUtils");


// SET STORAGE
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "media/");
  },
  filename(req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const uploads = multer({ storage });


// router.post("/register", (req, res, next) => userController.saveUser);
router.route("/register")
  .post(userController.saveUser);

router.route("/login").post(userController.loginUser);
router.get("/blog", blogController.getAllBlogStatAdmin);
router.get("/blog-home", blogController.getAllBlogStatAdmin);
router.get("/blog/:id", blogController.getOne);
router.post("/blog", uploads.single("media"), blogController.save);
router.put("/blog/:id", uploads.single("media"), blogController.update);


router.get("/admin-dashboard", adminController.getStats);

// users
router.get("/users", userController.getAll);
router.put("/users/:id", userController.update);


// router.post("/", userController.update);

// router.put("/update-password", userController.updatePassword);
// router.put("/:id", userController.update);
// router.post("/logout", middleware.logout);
// router.post("/send-forget-email", userController.sendEmail);
// router.post("/verify-otp", userController.verifyOTP);
module.exports = router;
