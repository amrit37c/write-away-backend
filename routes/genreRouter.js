const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/genreContoller");

// SET STORAGE
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "media/");
  },
  filename(req, file, cb) {
    const ext = file.originalname.split(".")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const uploads = multer({ storage });

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", controller.save);
router.put("/:id", controller.update);


module.exports = router;
