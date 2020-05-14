const router = require("express").Router();
const controller = require("../controllers/publicationController");
const multer = require('multer');

// SET STORAGE
const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "media/");
    },
    filename(req, file, cb) {
        console.log('file', file);
      const ext = file.originalname.split(".").pop();
      cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
  });
  
const uploads = multer({ storage });

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", uploads.fields([{ name: "mediaCover" , maxCount: 1}, {name: "categoryContent" , maxCount: 1}]), controller.save);
router.put("/:id",uploads.fields([{ name: "mediaCover" , maxCount: 1}, {name: "categoryContent" , maxCount: 1}]), controller.update);
router.post("/user-content", controller.saveUserPublication);

module.exports = router;
