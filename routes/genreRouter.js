const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/genreContoller");

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

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", uploads.array("topicMedia", 5), controller.save);
router.put("/:id", uploads.array("topicMedia", 5), controller.update);
router.delete("/:id", controller.delete);
router.put("/:id/genre-img-update", controller.updateGenreImg);

module.exports = router;
