const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const VerifyUser = require("../models/verifyUserModel");
const FeedBack = require("../models/userFeedBack");
const Testimonial = require("../models/userTestimonial");
const Contact = require("../models/userContactUs");

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
    const { email, password } = req.body;
    const encodePassword = bcrypt.hashSync(password, salt);
    req.body.password = encodePassword;
    const code = getVerificationCode();
    req.body.otp = code;

    // check if user exist
    const emailExist = await User.find({ email, verified: "false" });
    if (emailExist.length) {
      return res.status(200).send({ succes: "Failure", message: "User already exist!" });
    }

    const result = await User(req.body).save(); // save result

    if (result) {
      const data = req.body;

      // Email Content
      const contentGu = {
        email: req.body.guardianEmail ? data.guardianEmail : data.email,
        subject: "Welcome to Write Awayy",
        text: `Welcome to Write Awayy! Now you can read, write and share stories online in a creative format! To activate your account and gain full access to all Write Awayy functions click here. Please Enter This OTP  ${code}`,
      };

      const sendEmail = utils.sendEmail(contentGu);
      if (sendEmail) {
        console.log("EMAIL SEND DONE");
      }

      const parent = req.body.guardianEmail ? " parent " : "";
      const message = `Thank you for registering with us! A message with
       a confirmation link has been sent to your ${parent} 
       email address. Please follow the link to activate your account.`;

      return res.status(201).json({
        message,
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
        let { id, firstName, lastName } = result[0];
        // let firstName;

        if (result[0].verified === "false") {
          return res.status(200).json({
            message: "Please verify account first",
            status: "Failure",
          });
        }
        firstName = `${firstName} ${lastName}`;
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
    const { id } = req.params;
    console.log("body", req.body);

    const result = await User.findByIdAndUpdate(id, req.body, { new: true, password: 0 });

    if (result) {
      // const updateResult = {};
      // updateResult.result = result;

      // if (req.body.selectDisplayName === "true") {
      //   console.log("token change");
      //   const firstName = result.displayName;
      //   const token = jwt.sign({ id, firstName }, jwtKey, {
      //     algorithm: "HS256",
      //     expiresIn: jwtExpirySeconds,
      //   });
      //   updateResult.token = token;
      //   console.log("before toen", updateResult.token);
      // }
      // console.log("after toen", updateResult);
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
      const saveOtp = await User.findByIdAndUpdate(result[0].id, { otp: code });

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
      const saveOtp = await User.findByIdAndUpdate(result[0].id, { otp: "" });
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
exports.verifySignUpOTP = (async (req, res) => {
  try {
    const { email, otp } = req.body;
    const query = { email, otp };
    const result = await User.find(query);

    if (result.length) {
      // update password here otp here
      const saveOtp = await User.findByIdAndUpdate(result[0].id, { otp: "", verified: "true" }, { new: true });
      if (saveOtp) {
        console.log("save", saveOtp);
      }
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

exports.resendOTP = (async (req, res) => {
  try {
    const { email } = req.body;

    const result = await User.find({ email });

    console.log("result1");
    if (result.length) {
      // generate otp here
      const code = getVerificationCode();
      console.log("result2");
      const userEmail = result[0].guardianEmail ? result[0].guardianEmail : result[0].email;

      // save otp here
      const saveOtp = await User.findByIdAndUpdate(result[0].id, { otp: code }, { new: true });
      if (saveOtp) {
        console.log(">>>", saveOtp);
        console.log("result3");
      }

      const contentGu = {
        email: result[0].guardianEmail ? result[0].guardianEmail : result[0].email,
        subject: "Welcome to Write Awayy",
        text: `Please Enter This OTP  ${code}`,
      };

      const sendEmail = utils.sendEmail(contentGu);
      if (sendEmail) {
        console.log("EMAIL SEND DONE");
        console.log("result4");
        return res.status(200).json({
          status: "Success",
          message: "OTP SEND",
        });
      }
    }
    return res.status(200).json({
      status: "Success",
      message: "User Already Verified",
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});
exports.sendFeedBack = (async (req, res) => {
  try {
    const result = await FeedBack(req.body).save();

    if (result) {
      const { email, feedback } = req.body;
      // user email
      const userEmail = {
        email: req.body.email,
        subject: "Write Awayy",
        text: "Thanks for the feedback",
      };

      const sendEmail = utils.sendEmail(userEmail);

      const message = `${email} has shared feedback<br/> ${feedback}`;

      // writeaway email
      const sysEmail = {
        email: "feedback@writeawayy.com",
        subject: "User Feedback",
        text: message,
      };

      const sendSysEmail = utils.sendEmail(sysEmail);
      if (sendSysEmail) {
        console.log("System EMAIL SEND DONE");
      }

      if (sendEmail) {
        console.log("User EMAIL SEND DONE");
        return res.status(200).json({
          status: "Success",
          message: "Thanks for the feedback",
        });
      }
    }
    return res.status(200).json({
      status: "Success",
      message: "Data Not found",
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});
exports.sendTestimonial = (async (req, res) => {
  try {
    const result = await Testimonial(req.body).save();

    if (result) {
      const { email, testimonial } = req.body;
      // user email
      const userEmail = {
        email: req.body.email,
        subject: "Write Awayy",
        text: "We Will contact you shortly",
      };

      const sendEmail = utils.sendEmail(userEmail);

      const message = `${email} wants to know something: <br/> ${testimonial}`;

      // writeaway email
      const sysEmail = {
        email: "testimonials@writeawayy.com",
        subject: "User Testimonials",
        text: message,
      };

      const sendSysEmail = utils.sendEmail(sysEmail);
      if (sendSysEmail) {
        console.log("System EMAIL SEND DONE");
      }

      if (sendEmail) {
        console.log("User EMAIL SEND DONE");
        return res.status(200).json({
          status: "Success",
          message: "Thanks for the feedback",
        });
      }
    }
    return res.status(200).json({
      status: "Success",
      message: "Data Not found",
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});
exports.sendContactUs = (async (req, res) => {
  try {
    const result = await Contact(req.body).save();

    if (result) {
      const { email, info } = req.body;
      // user email
      const userEmail = {
        email: req.body.email,
        subject: "Write Awayy",
        text: "We will contact You shortly",
      };

      const sendEmail = utils.sendEmail(userEmail);

      const message = `${email} has contacts us: <br/> ${info}`;

      // writeaway email
      const sysEmail = {
        email: "contactus@writeawayy.com",
        subject: "User Contat Us",
        text: message,
      };

      const sendSysEmail = utils.sendEmail(sysEmail);
      if (sendSysEmail) {
        console.log("System EMAIL SEND DONE");
      }

      if (sendEmail) {
        console.log("User EMAIL SEND DONE");
        return res.status(200).json({
          status: "Success",
          message: "Thanks for the feedback",
        });
      }
    }
    return res.status(200).json({
      status: "Success",
      message: "Data Not found",
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});
