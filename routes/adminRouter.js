const router = require("express").Router();
const multer = require("multer");
const Jimp = require("jimp");
const ipLocation = require("ip-location"); // get location from ip

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
    const img = `${file.fieldname}-${Date.now()}.${ext}`;
    // const img = "Rohit.jpg";
    cb(null, img);
  },
});

const uploads = multer({ storage });

const thumbnail = (async (req, res, next) => {
  console.log("calld");
  // Create thumnail of an image;
  if (req.file) {
    console.log("FILE");
    const ext = req.file.filename.split(".").pop();
    const img = req.file.filename.split(".");

    const thumb = await Jimp.read(`media/${req.file.filename}`);
    if (thumb) {
      const file = [];
      // generate thumnail for home page
      thumb
        .resize(520, 481) // resize
        .quality(60) // set JPEG quality
        .write(`media/${img[0]}-520*481.${ext}`); // save


      file.push(`${img[0]}-520*481.${ext}`);

      // generate thumnail for blog page

      thumb
        .resize(690, 572) // resize
        .quality(60) // set JPEG quality
        .write(`media/${img[0]}-690*572.${ext}`); // save

      file.push(`${img[0]}-690*572.${ext}`);

      thumb
        .resize(138, 170) // resize
        .quality(60) // set JPEG quality
        .write(`media/${img[0]}-138*170.${ext}`); // save

      file.push(`${img[0]}-138*170.${ext}`);

      req.file = file;
      next();
    }
  } else {
    next();
  }
});


// router.post("/register", (req, res, next) => userController.saveUser);
router.route("/register")
  .post(userController.saveUser);

router.route("/login").post(userController.loginUser);
router.get("/blog", blogController.getFilterBlog);
router.get("/blog-home", blogController.getAllBlogStatAdmin);
router.get("/blog/:id", blogController.getOne);
router.post("/blog", uploads.single("media"), thumbnail, blogController.save);
router.put("/blog/:id", uploads.single("media"), thumbnail, blogController.update);


router.get("/admin-dashboard", adminController.getStats);

// users
router.get("/users", userController.getAll);
router.put("/users/:id", userController.update);

router.post("/test", uploads.single("media"), thumbnail, (async (req, res) => {
  // get current location
  // const { ip } = req;
  // const location = await ipLocation("172.217.167.78");
  res.send(req.file);
}));
// router.post("/", userController.update);

// router.put("/update-password", userController.updatePassword);
// router.put("/:id", userController.update);
// router.post("/logout", middleware.logout);
// router.post("/send-forget-email", userController.sendEmail);
// router.post("/verify-otp", userController.verifyOTP);
module.exports = router;
