const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const jwtKey = "my_secret_key";

const jwtExpirySeconds = 3000;

const salt = bcrypt.genSaltSync(10);

exports.saveUser = (async (req, res) => {
  try {
    // encrypt password
    const { password } = req.body;
    const encodePassword = bcrypt.hashSync(password, salt);
    req.body.password = encodePassword;

    const result = await User(req.body).save(); // save result


    if (result) {
      return res.status(201).json({
        message: "User Created",
        status: "Success",
      });
    }
    return res.status(409).json({
      message: "Duplicate Email",
      status: "failure",
    });
  } catch (err) {
    console.log("err", err.message);
    return res.status(501).json({
      message: err.message,
      status: "Failure",
    });
  }
});


exports.loginUser = (async (req, res) => {
  try {
    const { email, password } = req.body;
    // const user = new UserModel();

    const result = await User.find({ email });
    if (result) {
      const { password: hashDbPassword } = result[0];

      const check = bcrypt.compareSync(password, hashDbPassword); // true
      if (check) {
        const { firstName } = result[0];
        const token = jwt.sign({ firstName }, jwtKey, {
          algorithm: "HS256",
          expiresIn: jwtExpirySeconds,
        });

        return res.status(200).json({
          message: "User Login SuccessFully",
          status: "Success",
          data: {
            token,
            result: result[0],
          },

        });
      }
      return res.status(401).json({
        message: "Invalid password",
        status: "Failure",
      });
    }
    return res.status(404).json({
      message: "Data not found",
      status: "Failure",
    });
  } catch (err) {
    console.log("err", err.message);
    return res.status(501).json({
      message: err.message,
      status: "Failure",
    });
  }
});
