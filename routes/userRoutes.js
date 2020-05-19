const router = require("express").Router();
const userController = require("../controllers/userController");

// router.post("/register", (req, res, next) => userController.saveUser);
router.route("/register")
  .post(userController.saveUser);

router.route("/login").post(userController.loginUser);

router.post('/', userController.update)
module.exports = router;
