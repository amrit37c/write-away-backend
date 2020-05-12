const Publication = require("../models/publishcationModel");

exports.save = (async (req, res) => {
  try {
    console.log('req' , req.files);
    
    req.body.mediaCover = `${req.files.mediaCover[0]['filename']}`;
    
    const { category } = req.body;
    if(category !== "1"){
        req.body.categoryContent = `${req.files.categoryContent[0]['filename']}`;
    }
    
    const result = await Publication(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Publication Created",
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

    const result = await Publication.find(query).sort(sort);
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
    const result = await Publication.find(query);
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
    const result = await Publication.update(query, update);
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
    
    req.body.mediaCover = `${req.files.mediaCover[0]['filename']}`;
    
    const { category } = req.body;
    if(category !== "1"){
        req.body.categoryContent = `${req.files.categoryContent[0]['filename']}`;
    }
    const result = await Publication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Publication Updated",
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
