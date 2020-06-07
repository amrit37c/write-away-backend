const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const VerifyUser = require("../models/verifyUserModel");

const jwtKey = "my_secret_key";

const jwtExpirySeconds = "30d";

const utils = require("../utils/utils");

const salt = bcrypt.genSaltSync(10);
const hashNumbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";


function getVerificationCode() {
  const min = Math.ceil(0);
  const max = Math.floor(999999);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandom() {
  const length = 5;
  let result = "";
  const charactersLength = hashNumbers.length;
  for (let i = 0; i < length; i++) {
    result += hashNumbers.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


exports.saveUser = (async (req, res) => {
  try {
    // encrypt password
    const { password } = req.body;
    const encodePassword = bcrypt.hashSync(password, salt);
    req.body.password = encodePassword;

    const result = await User(req.body).save(); // save result

    if (result) {
      // Generate hash for verify link
      let verifyCode = bcrypt.hashSync(generateRandom(hashNumbers), salt);
      verifyCode = verifyCode.replace(/\\/g, "");
      const verifyData = {
        user: result.id,
        verifyCode,
      };

      const saveVerification = await VerifyUser(verifyData).save(); // save verify code
      const link = `<a href=${process.env.URL}/api/v1/user/verify-user/${verifyCode}>VERIFY</a>`;
      // Email Content
      const content = {
        email: req.body.email,
        subject: "Welcome to Write Awayy",
        text: `Please Click the link  ${link}`,
      };

      // send email here
      const userEmail = utils.sendEmail(content);


      if (userEmail) {
        console.log("USER EMAIL SEND");
      }

      if (req.body.guardian) {
        // check if guardian exist
        const guEmail = req.body.guardianEmail;
        const data = req.body;
        const checkGuardian = await User.find({ email: guEmail });
        if (!checkGuardian.length) {
          console.log("guradian not exist");
          // check if not exist save guardian

          const obj = {
            firstName: data.guardianFirstName,
            lastName: data.guardianLastName,
            email: data.guardianEmail,
            password: bcrypt.hashSync(data.guardianPassword, salt),
          };
          const saveGuard = await User(obj).save();

          // Generate hash for verify guardian link
          let verifyGuCode = bcrypt.hashSync(generateRandom(hashNumbers), salt);
          verifyGuCode = verifyGuCode.replace(/\\/g, "");
          const verifyGuData = {
            user: saveGuard.id,
            verifyCode: verifyGuCode,
          };

          const saveGuVerification = await VerifyUser(verifyGuData).save(); // save verify code
          const linkGu = `<a href=${process.env.URL}/api/v1/user/verify-user/${verifyGuCode}>VERIFY</a>`;
          // Email Content
          const contentGu = {
            email: data.guardianEmail,
            subject: "Welcome to Write Awayy",
            text: `Please Click the link  ${linkGu}`,
          };

          // send email here
          // const content = {
          //   email: data.guardianEmail,
          //   subject: "Welcome to Write Awayy",
          //   text: "Please Click the link",
          // };
          const guardianEmail = utils.sendEmail(contentGu);
          if (userEmail) {
            console.log("Guardian EMAIL SEND");
          }
        }
      }


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
    if (err.name === "MongoError" && err.code === 11000) {
      // Duplicate username
      return res.status(422).send({ succes: "Failure", message: "User already exist!" });
    }
    return res.status(200).json({
      message: err.message,
      status: "Failure",
    });
  }
});


exports.loginUser = (async (req, res) => {
  try {
    const { email, password } = req.body;
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
        let { id, firstName } = result[0];
        // let firstName;

        if (result[0].verified === "false") {
          return res.status(401).json({
            message: "Please verify account first",
            status: "Failure",
          });
        }
        if (result[0].selectDisplayName === true) {
          firstName = result[0].displayName;
        }

        const token = jwt.sign({ id, firstName }, jwtKey, {
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
    const result = await User.find(query, { password: 0 });
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
        to: email,
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


exports.verifyUser = (async (req, res) => {
  try {
    const { id: verifyCode } = req.params;

    const result = await VerifyUser.find({ verifyCode, verifyStatus: "0" });

    if (result.length) {
      // update password here otp here
      const updateVerify = await VerifyUser.findByIdAndUpdate(result[0].id, { verifyStatus: "1" }, { new: true });
      console.log(">>>", updateVerify);
      const updateUser = await User.findByIdAndUpdate(updateVerify.user, { verified: "true" });

      if (updateVerify) {
        return res.status(200).send(
          "User Verified! You Can Login",
        );
      }
    }
    return res.status(200).send(
      "User Already Verified",
    );
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});
