const Genre = require("../models/genreModel");

exports.save = (async (req, res) => {
  try {
    console.log("req", req.files);
    // req.body.topicMedia.
    const mediaFiles = [];
    if (req.files && req.files.length) {
      req.files.forEach((file) => {
        mediaFiles.push(file.filename);
      });
    }
    req.body.topicMedia = mediaFiles;
    const result = await Genre(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Genre Created",
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
    const query = req.query || {};
    query.isDeleted = false;
    // { isDeleted: false }
    let sort = { createdAt: -1 || req.query.sort };
    if (req.query.sort === "-createdAt") {
      sort = { created: -1 };
    }
    if (req.query.sort === "createdAt") {
      sort = { created: 1 };
    }
    if (req.query.sort === "-title") {
      sort = { title: -1 };
    }
    delete query.sort;
    console.log(query);
    console.log(query);
    const result = await Genre.find(query).sort(sort);
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
    const query = { _id };
    const result = await Genre.find(query);
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
exports.delete = (async (req, res) => {
  try {
    const { id: _id } = req.params;
    const query = { _id };
    const update = { isDeleted: true };

    // console.log("req", req.params);
    const result = await Genre.findOneAndUpdate(query, update, { new: true });
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
    const mediaFiles = [];
    if (req.files && req.files.length) {
      req.files.forEach((file) => {
        mediaFiles.push(file.filename);
      });
    }
    req.body.topicMedia = mediaFiles;
    const data = await Genre.findOne({ _id: req.params.id });

    req.body.topicMedia = data.topicMedia.concat(req.body.topicMedia);
    if (data) {
      const result = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (result) {
        return res.status(200).json({
          message: "Genre Updated",
          status: "Success",
          data: result,
        });
      }
    } else {
      return res.status(200).json({
        message: "No data found",
        status: "Failure",
      });
    }
  } catch (error) {
    return res.status(409).json({
      message: error.message,
      status: "Failure",
    });
  }
});

exports.updateGenreImg = (async (req, res) => {
  try {
    const { img } = req.body;

    const data = await Genre.findOne({ _id: req.params.id }, { topicMedia: 1 });
    //
    // console.log("before", data);
    const index = data.topicMedia.indexOf(img);
    if (index > -1) {
      data.topicMedia.splice(index, 1);
    }

    // console.log("after", data);
    // return;
    req.body.topicMedia = data.topicMedia;
    if (data) {
      const result = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (result) {
        return res.status(200).json({
          message: "Genre Image Deleted",
          status: "Success",
          data: result,
        });
      }
    } else {
      return res.status(200).json({
        message: "No data found",
        status: "Failure",
      });
    }
  } catch (error) {
    return res.status(409).json({
      message: error.message,
      status: "Failure",
    });
  }
});
