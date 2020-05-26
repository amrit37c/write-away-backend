const router = require("express").Router();
const multer = require("multer");
const blogController = require("../controllers/blogController");
const blogBookMarkController = require("../controllers/blogBookMarkController");
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

router.get("/", blogController.getAll);
router.get("/:id", middleware.authenticateLoginUser, blogController.getOne);
router.post("/", uploads.single("media"), blogController.save);
router.put("/:id", uploads.single("media"), blogController.update);

// router.post("/blog-bookmark/:id", middleware.authenticateLoginUser, blogBookMarkController.save);


// bookmark publication for user
router.post("/blog-bookmark", middleware.authenticateUser, blogController.saveBookMark);
router.put("/blog-bookmark/:id", middleware.authenticateUser, blogController.updateBookMark);
module.exports = router;
