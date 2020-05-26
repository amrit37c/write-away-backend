const mongoose = require("mongoose");
const Publication = require("../models/publishcationModel");
const UserPublication = require("../models/userPublishcationModel");
const BookMarkPublication = require("../models/publicationBookMarkModel");
const PublicationLike = require("../models/publicationLikeModel");

exports.save = (async (req, res) => {
  try {
    req.body.mediaCover = `${req.files.mediaCover[0].filename}`;

    const { category } = req.body;
    if (category !== "1") {
      req.body.categoryContent = `${req.files.categoryContent[0].filename}`;
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

    console.log("req.user.id", req.user);

    // PREVIOUS QUERY WITH USER PUBLICATION
    // let result = await Publication.find(query).populate('ageGroup', 'ageRange').populate('genres', 'title')
    // .populate('userPublication.publicationId')
    const finalQuery = [];


    finalQuery.push(
      {
        $lookup: {
          from: "userpublications",
          let: { publicationId: "$_id" },
          pipeline: [
            {
              $addFields:
                {
                  publicationId: { $toObjectId: "$publicationId" },
                },
            },
            {
              $match:
                {
                  $expr:
                  { $eq: ["$publicationId", "$$publicationId"] },
                  publishedBy: mongoose.Types.ObjectId(req.user),
                },
            },
          ],
          as: "userPublication",
        },
      },

      {
        $lookup: {
          from: "publicationbookmarks",
          let: { publicationId: "$_id" },
          pipeline: [
            {
              $addFields:
                {
                  publicationId: { $toObjectId: "$publicationId" },
                },
            },
            {
              $match:
                {
                  $expr:
                  { $eq: ["$publicationId", "$$publicationId"] },
                  user: mongoose.Types.ObjectId(req.user),
                },
            },
          ],
          as: "bookmark",
        },
      },
      {
        $lookup: {
          from: "publicationlikes",
          let: { publicationId: "$_id" },
          pipeline: [
            {
              $addFields:
                {
                  publicationId: { $toObjectId: "$publicationId" },
                },
            },
            {
              $match:
                {
                  $expr:
                  { $eq: ["$publicationId", "$$publicationId"] },
                  user: mongoose.Types.ObjectId(req.user),
                },
            },
          ],
          as: "like",
        },
      },
      {
        $lookup: {
          from: "genres",
          localField: "genres",
          foreignField: "_id",
          as: "genres",
        },
      },
      {
        $lookup: {
          from: "agegroups",
          localField: "ageGroup",
          foreignField: "_id",
          as: "ageGroup",
        },
      },
      { $unwind: "$genres" },
      { $unwind: "$ageGroup" },
      {
        $unwind: {
          path: "$userPublication",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$bookmark",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1, mediaCover: 1, brief: 1, gender: 1, genreDescription: 1, closingDate: 1, ageGroup: 1, kickstarter: 1, kickbookDesc: 1, isActive: 1, isPublished: 1, publicationStatus: 1, publicationRights: 1, wordCount: 1, commercials: 1, language: 1, category: 1, categoryContent: 1, followers: 1, genres: "$genres", userPublication: "$userPublication", bookmark: "$bookmark",
        },
      },
      {
        $match: {
          $or: [query],
        },
      },
    );

    const result = await Publication.aggregate(finalQuery);


    if (result) {
      // const response =  result.map()
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
    const result = await Publication.find(query).populate("ageGroup", "ageRange").populate("genres").lean();
    const userPublication = await UserPublication.find({ publicationId: _id }).lean();
    if (result) {
      result[0].userPublication = userPublication;
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
    req.body.mediaCover = `${req.files.mediaCover[0].filename}`;

    const { category } = req.body;
    if (category !== "1") {
      req.body.categoryContent = `${req.files.categoryContent[0].filename}`;
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

exports.saveUserPublication = (async (req, res) => {
  try {
    req.body.publishedBy = req.user;
    const result = await UserPublication(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "User Publication Created",
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


exports.updateUserPublication = (async (req, res) => {
  try {
    req.body.publishedBy = req.user;
    console.log("", req.body);
    const result = await UserPublication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "User Publication Updated",
        status: "Success",
        data: result,
      });
    }
    console.log(">>", result);
  } catch (error) {
    return res.status(409).json({
      message: error.message,
      status: "Failure",
    });
  }
});

exports.saveBookMark = (async (req, res) => {
  try {
    req.body.user = req.user;

    const result = await BookMarkPublication(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Publication Bookmark Done",
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

exports.updateBookMark = (async (req, res) => {
  try {
    req.body.publishedBy = req.user;
    const result = await BookMarkPublication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Publication Bookmark Update",
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


exports.saveLike = (async (req, res) => {
  try {
    req.body.user = req.user;

    const result = await PublicationLike(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Publication Like Done",
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

exports.updateLike = (async (req, res) => {
  try {
    req.body.publishedBy = req.user;
    const result = await PublicationLike.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Publication Like Update",
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
