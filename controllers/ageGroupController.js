const AgeGroup = require("../models/ageGroupModel");

function getAgeRange(range) {
  const ageRangeArr = range.split(",");
  return ageRangeArr;
}


exports.save = (async (req, res) => {
  try {
    const { ageRange } = req.body;
    const rangeArr = getAgeRange(ageRange);
    req.body.ageRange = rangeArr;
    const result = await AgeGroup(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Age Group Created",
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
    const sort = { createdAt: -1 || req.sort };
    query.isDeleted = false;

    const result = await AgeGroup.find(query).sort(sort);
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
    const result = await AgeGroup.find(query);
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
    const result = await AgeGroup.update(query, update);
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
    const { ageRange } = req.body;
    const rangeArr = getAgeRange(ageRange);
    req.body.ageRange = rangeArr;
    const result = await AgeGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Age Group Updated",
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
