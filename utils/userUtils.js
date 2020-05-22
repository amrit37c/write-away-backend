const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const jwtKey = "my_secret_key";
const jwtExpirySeconds = 3000;
const salt = bcrypt.genSaltSync(10);

function getToken(token) {
  const spToken = token.split(" ");
  return spToken[1];
}


exports.authenticateUser = (req, res, next) => {
  const bearerToken = req.header("authorization");
  const token = bearerToken.split(" ")[1];
  console.log("token", token);
  // invalid token - synchronous
  try {
    const { exp } = jwt.verify(token, jwtKey);
    console.log("decoded", exp);
    if (Date.now() >= exp * 1000) {
      return res.status(401).json({
        status: "failure",
        message: "Unauthenticated",
      });
    }
    next();
  } catch (err) {
    // err
  }
};

exports.authenticateUser = (req, res, next) => {
  try {
    const bearerToken = req.header("authorization");
    // if(!bearerToken){
    //     return res.status(401).json({
    //         status: 'failure',
    //         message: 'Unauthenticated user'
    //     })
    // }
    if (bearerToken) {
      const token = getToken(bearerToken);

      const { exp, id } = jwt.verify(token, jwtKey);
      req.user = id;
    }

    next();

    // if (Date.now() >= exp * 1000) {
    //     return res.status(401).json({
    //         status: 'failure',
    //         message: 'Unauthenticated user'
    //     })
    // } else{
    //     req.user = id;
    //     next();
    // }
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      message: err.message,
    });
  }
};

exports.authenticateLoginUser = (req, res, next) => {
  try {
    const bearerToken = req.header("authorization");
    if (!bearerToken) {
      return res.status(401).json({
        status: "failure",
        message: "Unauthenticated user",
      });
    }

    const token = getToken(bearerToken);

    const { exp, id } = jwt.verify(token, jwtKey);

    if (Date.now() >= exp * 1000) {
      return res.status(401).json({
        status: "failure",
        message: "Unauthenticated user",
      });
    }
    req.user = id;
    console.log("req", id);
    next();
  } catch (err) {
    return res.status(401).json({
      status: "failure",
      message: err.message,
    });
  }
};
exports.logout = (req, res) => {
  try {
    const bearerToken = req.header("authorization");
    const token = getToken(bearerToken);

    const expToken = jwt.destroy(token);
    if (expToken) {
      return res.status(200).json({
        status: "success",
        message: "user logout sucessfully",
      });
    }
    return res.status(401).json({
      status: "failure",
      message: "Invalid user token",
    });
  } catch (err) {
    return res.status(500).json({
      status: "failure",
      message: "something went wrong",
    });
  }
};
