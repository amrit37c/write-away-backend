const mongoose = require("mongoose");
const BlogLike = require("../models/blogLikesModel");

exports.save = (async (req, res) => {
  try {
    req.body.user = req.user;
    req.body.blogId = req.params.id;

    const query = {
      user: mongoose.Types.ObjectId(req.user),
      blogId: mongoose.Types.ObjectId(req.params.id),
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const result = await BlogLike.findOneAndUpdate(query, req.body, options);

    return res.status(201).json({
      message: "Blog Like stutus updated",
      status: "Success",
      data: result,
    });
  } catch (err) {
    return res.status(409).json({
      message: err.message,
      status: "Failure",
    });
  }
});


exports.update = (async (req, res) => {
  try {
    req.body.user = req.user;
    const result = await BlogLike.findByIdAndUpdate(req.body.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Blog Like Updated",
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
