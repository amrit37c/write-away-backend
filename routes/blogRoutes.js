const router = require("express").Router();
const multer = require("multer");
const blogController = require("../controllers/blogController");
const blogLikeController = require("../controllers/blogLikeController");
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

router.post("/blog-like/:id", middleware.authenticateLoginUser, blogLikeController.save);

module.exports = router;
