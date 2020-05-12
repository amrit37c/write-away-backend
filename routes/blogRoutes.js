const router = require("express").Router();
const multer = require("multer");
const blogController = require("../controllers/blogController");

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
router.get("/:id", blogController.getOne);
router.post("/", uploads.single("media"), blogController.save);
router.put("/:id", uploads.single("media"), blogController.update);


module.exports = router;
