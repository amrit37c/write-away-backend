const router = require("express").Router();
const controller = require("../controllers/ageGroupController");

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", controller.save);
router.put("/:id", controller.update);


module.exports = router;
