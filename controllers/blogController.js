const mongoose = require("mongoose");
const Blog = require("../models/blogsModel");
const BlogLike = require("../models/blogLikesModel");

exports.save = (async (req, res) => {
  try {
    req.body.media = `${req.file.filename}`;
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
exports.getAll = (async (req, res) => {
  try {
    const query = req.query || { };
    const sort = { createdAt: -1 };
    const now = new Date();

    if (query.isPublished === "today") {
      query.isPublished = true;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      query.createdAt = { $gte: today };
    } else if (query.isPublished === "yesterday") {
      query.isPublished = true;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      query.createdAt = { $lte: today };
    }
    console.log(query);
    const result = await Blog.find(query).sort(sort);
    if (result) {
      return res.status(200).json({
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
exports.getOne = (async (req, res) => {
  try {
    const { id: _id } = req.params;
    const query = {
      _id,
    };

    // fetch single blog
    const result = await Blog.find(query).populate("bloglikes");
    if (result) {
      // fetch blog by like count
      const likeResult = await BlogLike.find({
        blogId: _id,
      }).count();

      // fetch user's like post - user who like or not
      const userLikeResult = await BlogLike.find({
        blogId: _id,
        user: req.user,
      });

      result[0].likeCount = likeResult;
      const data = result[0].toJSON();
      data.userDetail = userLikeResult;

      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        data,
      });
    }

    // console.log("req", req.params);
    // const finalQuery = [];

    // finalQuery.push(
    //   {
    //     $lookup: {
    //       from: "bloglikes",
    //       localField: "_id",
    //       foreignField: "blogId",
    //       as: "bloglikes",
    //     },
    //   },
    //   {
    //     $match: {
    //       $or: [
    //         { _id: mongoose.Types.ObjectId(id) },
    //       ],
    //     }
    //     ,
    //   },
    // );
    // console.log(finalQuery);

    // const result = await Blog.aggregate(finalQuery);
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: "Failure",
    });
  }
});
exports.delete = (async (req, res) => {
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

exports.update = (async (req, res) => {
  try {
    // const query = { _id: mongoose.Types.ObjectId(req.params.id) };
    const result = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Blog Updated",
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
