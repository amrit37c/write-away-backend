const Joi = require("@hapi/joi");


exports.validate = (async (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": "Firstname should be a type of 'text'",
        "string.empty": "Firstname cannot be an empty field",
        "string.min": "Firstname should have a minimum length of {#limit}",
        "any.required": "Firstname is a required field",
      }),
    lastName: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        "string.base": "Lastname should be a type of 'text'",
        "string.empty": "Lastname cannot be an empty field",
        "string.min": "Lastname should have a minimum length of {#limit}",
        "any.required": "Lastname is a required field",
      }),
    guardian: Joi.string().allow("").optional(),

    //   .alphanum(),
    guardianFirstName: Joi.string()
      .alphanum().allow("").when("guardian", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),

    guardianLastName: Joi.string()
      .alphanum().allow("").when("guardian", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    guardianPassword: Joi.string()
      .alphanum().allow("").when("guardian", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
    guardianConfirmPassword: Joi.string().allow(""),

    confirmPassword: Joi.string().allow(""),
    password: Joi.string().allow(""),
    adultUser: Joi.boolean().allow(""),
    acceptOffer: Joi.string().allow(""),
    acceptTerms: Joi.boolean().allow(""),
    //   .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    dob: Joi.string(),
    //   .integer()
    //   .min(1900)
    //   .max(new Date().getFullYear()),
    // dob: Joi.date(),

    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    guardianEmail: Joi.string().allow("")
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }).when("guardian", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),

  });


  try {
    const { error } = await schema.validate(req.body);
    if (error && error.details) {
      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }
    next();
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});
