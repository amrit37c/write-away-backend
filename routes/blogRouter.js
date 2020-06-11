const router = require("express").Router();
const multer = require("multer");
const blogController = require("../controllers/blogController");
// const blogBookMarkController = require("../controllers/blogBookMarkController");
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

// My desk
router.get("/user-blog", middleware.authenticateUser, blogController.getUserBlog);


router.get("/", middleware.authenticatedUser, blogController.getAll);
router.get("/:id", middleware.authenticateLoginUser, blogController.getOne);
router.post("/", uploads.single("media"), blogController.save);
router.put("/:id", uploads.single("media"), blogController.update);

// router.post("/blog-bookmark/:id", middleware.authenticateLoginUser, blogBookMarkController.save);

// update user for read count
router.put("/blog-read/:id", middleware.authenticatedUser, blogController.updateRead);

// social share
router.post("/blog-share/:id", middleware.authenticatedUser, blogController.updateShare);

// bookmark blog for user
router.post("/blog-bookmark", middleware.authenticatedUser, blogController.saveBookMark);
router.put("/blog-bookmark/:id", middleware.authenticatedUser, blogController.updateBookMark);

// like blog for user
router.post("/blog-like", middleware.authenticatedUser, blogController.saveLike);
router.put("/blog-like/:id", middleware.authenticatedUser, blogController.updateLike);


module.exports = router;
