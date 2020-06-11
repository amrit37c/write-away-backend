const router = require("express").Router();
const multer = require("multer");
const Jimp = require("jimp");
const ipLocation = require("ip-location"); // get location from ip

const userController = require("../controllers/userController");
const blogController = require("../controllers/blogController");
const adminController = require("../controllers/adminController");
const publicationController = require("../controllers/publicationController");

const middleware = require("../utils/userUtils");


// SET STORAGE
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "media/");
  },
  filename(req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const img = `${file.fieldname}-${Date.now()}.${ext}`;
    cb(null, img);
  },
});

const uploads = multer({ storage });

const thumbnail = (async (req, res, next) => {
  // Create thumnail of an image;
  if (req.file) {
    const ext = req.file.filename.split(".").pop();
    const img = req.file.filename.split(".");

    const thumb = await Jimp.read(`media/${req.file.filename}`);
    if (thumb) {
      const file = [];
      // generate thumnail for home page
      thumb
        .resize(593, 492) // resize
        .quality(60) // set JPEG quality
        .write(`media/${img[0]}-520*481.${ext}`); // save


      file.push(`${img[0]}-520*481.${ext}`);

      // generate thumnail for blog page

      thumb
        .resize(873, 602) // resize
        .quality(60) // set JPEG quality
        .write(`media/${img[0]}-690*572.${ext}`); // save

      file.push(`${img[0]}-690*572.${ext}`);

      thumb
        .resize(180, 222) // resize
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


// publications
router.get("/publication/publication-home", publicationController.getAllPublicationStatAdmin);
router.get("/publication/", middleware.authenticatedUser, publicationController.getAllPublictionAd);
router.get("/publication/:id", publicationController.getOne);
router.post("/publication/", uploads.fields([{ name: "mediaCover", maxCount: 1 }, { name: "categoryContent", maxCount: 1 }]), publicationController.save);
router.put("/publication/:id", uploads.fields([{ name: "mediaCover", maxCount: 1 }, { name: "categoryContent", maxCount: 1 }]), publicationController.update);
router.put("/publication-update/:id", publicationController.update);

// save user content for publication
router.post("/publication/user-content", middleware.authenticateUser, publicationController.saveUserPublication);
router.put("/publication/user-content/:id", middleware.authenticateUser, publicationController.updateUserPublication);

// bookmark publication for user
router.post("/publication/publication-bookmark", middleware.authenticateUser, publicationController.saveBookMark);
router.put("/publication/publication-bookmark/:id", middleware.authenticateUser, publicationController.updateBookMark);

// like publication for user
router.post("/publication/publication-like", middleware.authenticateUser, publicationController.saveLike);
router.put("/publication/publication-like/:id", middleware.authenticateUser, publicationController.updateLike);

module.exports = router;
