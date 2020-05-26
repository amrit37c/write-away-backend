const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/publicationController");
const middleware = require("../utils/userUtils");

// SET STORAGE
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "media/");
  },
  filename(req, file, cb) {
    console.log("file", file);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const uploads = multer({ storage });

router.get("/", middleware.authenticatedUser, controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", uploads.fields([{ name: "mediaCover", maxCount: 1 }, { name: "categoryContent", maxCount: 1 }]), controller.save);
router.put("/:id", uploads.fields([{ name: "mediaCover", maxCount: 1 }, { name: "categoryContent", maxCount: 1 }]), controller.update);

// save user content for publication
router.post("/user-content", middleware.authenticateUser, controller.saveUserPublication);
router.put("/user-content/:id", middleware.authenticateUser, controller.updateUserPublication);

// bookmark publication for user
router.post("/publication-bookmark", middleware.authenticateUser, controller.saveBookMark);
router.put("/publication-bookmark/:id", middleware.authenticateUser, controller.updateBookMark);

// like publication for user
router.post("/publication-like", middleware.authenticateUser, controller.saveLike);
router.put("/publication-like/:id", middleware.authenticateUser, controller.updateLike);

module.exports = router;
