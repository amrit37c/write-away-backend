const mongoose = require("mongoose");
const Publication = require("../models/publishcationModel");
const UserPublication = require("../models/userPublishcationModel");
const BookMarkPublication = require("../models/publicationBookMarkModel");
const PublicationLike = require("../models/publicationLikeModel");
const PublicationShare = require("../models/socialShareBlogModelPublication");
const AgeGroup = require("../models/ageGroupModel");
const Genre = require("../models/genreModel");

exports.save = (async (req, res) => {
  try {
    console.log(">>>>>>>>", req.file);
    // req.body.mediaCover = `${req.files.mediaCover[0].filename}`;
    if (req.file) {
      // req.body.media = `${req.file.filename}`;
      req.body.mediaCover = `${req.file[0]}`;
      req.body.media350 = req.file[0] ? req.file[0] : "";
      req.body.media525 = req.file[1] ? req.file[1] : "";
      req.body.media142 = req.file[2] ? req.file[2] : "";
    }

    const { category } = req.body;
    if (category !== "1") {
      req.body.categoryContent = `${req.files.categoryContent[0].filename}`;
    }

    const genresArr = req.body.genres.split(",");
    const ageGroupArr = req.body.ageGroup.split(",");


    const genres = {
      $push: genresArr,
    };
    const age = {
      $push: ageGroupArr,
    };


    req.body.genres = genresArr;
    req.body.ageGroup = ageGroupArr;


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

    // console.log("req.user.id", req.user);

    const finalQuery = [];
    if (query.isPublished) {
      query.isPublished = (query.isPublished === "true");
    }


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
      // { $unwind: "$genres" },
      // { $unwind: "$ageGroup" },
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
      { $sort: { createdAt: -1 } },
      {
        $project: {
          title: 1,
          mediaCover: 1,
          brief: 1,
          gender: 1,
          genreDescription: 1,
          closingDate: 1,
          ageGroup: 1,
          kickstarter: 1,
          kickbookDesc: 1,
          isActive: 1,
          isPublished: 1,
          publicationStatus: 1,
          publicationRights: 1,
          wordCount: 1,
          commercials: 1,
          language: 1,
          category: 1,
          categoryContent: 1,
          followers: 1,
          createdAt: 1,
          media142: 1,
          media350: 1,
          media525: 1,
          genres: "$genres",
          userPublication: "$userPublication",
          bookmark: "$bookmark",
        },
      },
      {
        $match: {
          $or: [query],
        },
      },
    );

    const result = await Publication.aggregate(finalQuery);
    // console.log("final", finalQuery);

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
    const result = await Publication.find(query)
      .populate({ path: "ageGroup", select: { _id: 1, ageRange: 1 }, model: AgeGroup })
      .populate({ path: "genres", model: Genre })
      .populate({ path: "bookmarks", model: Genre })
      .sort({ createdAt: -1 });

    const { user } = req;

    const userPublication = await UserPublication.find({ publicationId: _id, publishedBy: user }).lean();
    const bookmark = await BookMarkPublication.find({ publicationId: _id, user }).lean();
    console.log("Boomarks");

    if (result) {
      const data = result[0].toJSON();
      result[0] = data;
      result[0].userPublication = userPublication;
      result[0].bookmark = bookmark;
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
    if (req.files && req.files.mediaCover) {
      req.body.mediaCover = `${req.files.mediaCover[0].filename}`;
    }

    const { category } = req.body;
    if (category !== "1") {
      if (req.files && req.files.categoryContent) {
        req.body.categoryContent = `${req.files.categoryContent[0].filename}`;
      }
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


exports.getAllPublictionAd = (async (req, res) => {
  try {
    const query = req.query || { };
    const sort = { createdAt: -1 };

    console.log("req.user.id", req.user);

    const finalQuery = [];
    if (query.isPublished) {
      query.isPublished = (query.isPublished === "true");
    }


    finalQuery.push(
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

      { $sort: { createdAt: -1 } },
      {
        $project: {
          title: 1,
          mediaCover: 1,
          brief: 1,
          gender: 1,
          genreDescription: 1,
          closingDate: 1,
          ageGroup: 1,
          kickstarter: 1,
          kickbookDesc: 1,
          isActive: 1,
          isPublished: 1,
          publicationStatus: 1,
          publicationRights: 1,
          wordCount: 1,
          commercials: 1,
          language: 1,
          category: 1,
          categoryContent: 1,
          followers: 1,
          createdAt: 1,
          media142: 1,
          media350: 1,
          media525: 1,
          // media142: 1,
          genres: "$genres",
          agegroups: "$agegroups",
          //  userPublication: "$userPublication", bookmark: "$bookmark",
        },
      },
      {
        $match: {
          $or: [query],
        },
      },
    );

    const result = await Publication.aggregate(finalQuery);
    console.log("final", finalQuery);

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


exports.getAllPublicationStatAdmin = (async (req, res) => {
  try {
    const closedPublication = await Publication.find({
      publicationStatus: 3,
    }).countDocuments();
    const openPublication = await Publication.find({
      publicationStatus: 2,
    }).countDocuments();
    const savedPublication = await Publication.find({
      publicationStatus: 1,
    }).countDocuments();

    // closed pub stats for admin
    const closedPubGenreCount = await Publication.aggregate([
      { $match: { publicationStatus: "3" } },
      { $unwind: "$genres" },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const closedPubAgeGroups = await Publication.aggregate([
      { $match: { publicationStatus: "3" } },
      { $unwind: "$ageGroup" },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const closedPubCate = await Publication.aggregate([
      { $match: { publicationStatus: "3", categoryContent: { $ne: "" } } },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const closedPubLanguages = await Publication.aggregate([
      { $match: { publicationStatus: "3", languages: { $ne: "" } } },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    // open pub stats for admin
    const openPubGenreCount = await Publication.aggregate([
      { $match: { publicationStatus: "2" } },
      { $unwind: "$genres" },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const openPubAgeGroups = await Publication.aggregate([
      { $match: { publicationStatus: "2" } },
      { $unwind: "$ageGroup" },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const openPubCate = await Publication.aggregate([
      { $match: { publicationStatus: "2", categoryContent: { $ne: "" } } },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const openPubLanguages = await Publication.aggregate([
      { $match: { publicationStatus: "2", languages: { $ne: "" } } },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    // saved pub stats for admin
    const savedPubGenreCount = await Publication.aggregate([
      { $match: { publicationStatus: "1" } },
      { $unwind: "$genres" },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const savedPubAgeGroups = await Publication.aggregate([
      { $match: { publicationStatus: "1" } },
      { $unwind: "$ageGroup" },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const savedPubCate = await Publication.aggregate([
      { $match: { publicationStatus: "1", categoryContent: { $ne: "" } } },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);

    const savedPubLanguages = await Publication.aggregate([
      { $match: { publicationStatus: "1", languages: { $ne: "" } } },
      { $group: { _id: "$_id", sum: { $sum: 1 } } },
      { $group: { _id: null, sum: { $sum: "$sum" } } },
    ]);


    return res.status(200).json({
      message: "Data Found",
      status: "Success",
      closed: closedPublication,
      open: openPublication,
      saved: savedPublication,
      data: {
        closedPub: {
          genre: closedPubGenreCount,
          ageGroup: closedPubAgeGroups,
          categoryCon: closedPubCate,
          languages: closedPubLanguages,
        },
        openPub: {
          genre: openPubGenreCount,
          ageGroup: openPubAgeGroups,
          categoryCon: openPubCate,
          languages: openPubLanguages,
        },
        savedPub: {
          genre: savedPubGenreCount,
          ageGroup: savedPubAgeGroups,
          categoryCon: savedPubCate,
          languages: savedPubLanguages,
        },
      },
    });
  } catch (err) {
    return res.status(409).json({
      message: err.message,
      status: "Failure",
    });
  }
});

// Update Share
exports.updateShare = (async (req, res) => {
  try {
    req.body.user = req.user;
    req.body.publicationId = req.params.id;


    const result = await PublicationShare(req.body).save();

    if (result) {
      return res.status(200).json({
        message: "User Share Updated",
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
