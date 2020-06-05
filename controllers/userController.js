const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const jwtKey = "my_secret_key";

const jwtExpirySeconds = "30d";

const salt = bcrypt.genSaltSync(10);
const nodemailer = require("nodemailer");


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
    return res.status(200).json({
      message: err.message,
      status: "Failure",
    });
  }
});


exports.loginUser = (async (req, res) => {
  try {
    const { email, password } = req.body;
    // const status = { status: 1 };
    // const query = {
    //   email: useremail,
    //   status: "1",
    // };

    const result = await User.find({ email });
    if (result.length) {
      if (result[0].status !== "1") {
        return res.status(200).json({
          message: "Please Contact Administrator ",
          status: "Failure",

        });
      }
      const { password: hashDbPassword } = result[0];

      const check = bcrypt.compareSync(password, hashDbPassword); // true
      if (check) {
        const { firstName, id: _id } = result[0];

        const token = jwt.sign({ id: _id, firstName }, jwtKey, {
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

exports.update = (async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "User Updated",
        status: "Success",
        data: result,
      });
    }
  } catch (error) {
    return res.status(409).json({
      message: error.message,
      status: "Failure",
    });
  }
});


exports.getOne = (async (req, res) => {
  try {
    const query = { _id: req.user };
    const result = await User.find(query);
    if (result) {
      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        data: result,
      });
    }
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: "Failure",
    });
  }
});

exports.sendEmail = (async (req, res) => {
  try {
    const { email } = req.body;
    const query = { email };
    const result = await User.find(query);
    console.log("resul", result);

    if (result.length) {
      // send email here
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "amrit37c@gmail.com",
          pass: "Nishansingh@12345",
        },
      });

      // generate otp here
      const code = getVerificationCode();
      // save otp here
      const saveOtp = await User.findOneAndUpdate(email, { otp: code });

      const mailOptions = {
        from: "amrit37c@gmail.com",
        to: "kumarrohit00294@gmail.com",
        subject: "Your verification Code",
        text: `Your code is ${code}`,
      // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(501).json({
            message: error,
            status: "Success",
          // data: result,
          });
        }
        // console.log(`Email sent: ${info.response}`);
        return res.status(200).json({
          message: `We have sent a password reset link to ${req.body.email}`,
          status: "Success",
          // data: result,
        });
      });
    } else {
      return res.status(200).json({
        message: "Wrong Username: Oops! This Username is not valid. Please try again!",
        status: "Failure",
      // data: result,
      });
    }
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});

exports.verifyOTP = (async (req, res) => {
  try {
    const { email, otp } = req.body;
    const query = { email, otp };
    const result = await User.find(query);
    console.log("resul", result);


    if (result.length) {
      // update password here otp here
      const saveOtp = await User.findOneAndUpdate(email, { otp: "" });
      return res.status(200).json({
        message: "OTP verified",
        status: "Success",
        // data: result,
      });
    }
    return res.status(200).json({
      message: "Invalid OTP",
      status: "Failure",
      // data: result,
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});

exports.updatePassword = (async (req, res) => {
  try {
    const { email, password } = req.body;
    if (password) {
      const encodePassword = bcrypt.hashSync(password, salt);
      req.body.password = encodePassword;
    }

    const result = await User.findOneAndUpdate({ email }, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "User Password Updated",
        status: "Success",
        data: result,
      });
    }
    return res.status(200).json({
      message: "User not found",
      status: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(409).json({
      message: error.message,
      status: "Failure",
    });
  }
});


exports.getAll = (async (req, res) => {
  try {
    const { query } = req;
    const result = await User.find(query);
    if (result) {
      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        data: result,
      });
    }
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: "Failure",
    });
  }
});


function getVerificationCode() {
  const min = Math.ceil(0);
  const max = Math.floor(999999);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
