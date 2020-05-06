const Blog = require("../models/blogsModel");


exports.save = (async (req, res, next) => {
  try {
    const ext = req.file.originalname.split(".")[1];
    req.body.media = `${req.file.filename}.${ext}`;
    const result = await Blog(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Blog Created",
        status: "Success",
        data: result,
      });
    }
  } catch (err) {
    return res.status(409).json({
      message: err.message,
      status: "Failure",
    });
  }
});
exports.getAll = (async (req, res, next) => {
  try {
    const query = req.query || {};
    const result = await Blog.find(query);
    if (result) {
      return res.status(201).json({
        message: "Data Found",
        status: "Success",
        data: result,
      });
    }
  } catch (err) {
    return res.status(409).json({
      message: err.message,
      status: "Failure",
    });
  }
});
exports.getOne = (async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const query = { _id };
    // console.log("req", req.params);
    const result = await Blog.find(query);
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
exports.delete = (async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const query = { _id };
    const update = { isDeleted: true };

    // console.log("req", req.params);
    const result = await Blog.update(query, update);
    if (result) {
      return res.status(200).json({
        message: "Data Deleted",
        status: "Success",
      });
    }
    return res.status(200).json({
      message: "No Data Found",
      status: "Failure",
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: "Failure",
    });
  }
});
