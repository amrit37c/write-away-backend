
const Publication = require("../models/publishcationModel");
const UserPublication = require("../models/userPublishcationModel");
const BookMarkPublication = require("../models/publicationBookMarkModel");

const AgeGroup = require("../models/ageGroupModel");
const Genre = require("../models/genreModel");
const User = require("../models/userModel");

const PubVolume = require("../models/publicationVolumesModel");
const ReadVolume = require("../models/publicationReadVolumesModel");

exports.save = (async (req, res) => {
  try {
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
    const { publicationId } = req.params;

    const query = req.query || { };
    const sort = { createdAt: -1 };

    const match = {
      publicationId,
    };

    const finalQuery = [];

    finalQuery.push(
      {
        $lookup: {
          from: "publications",
          localField: "publicationId",
          foreignField: "_id",
          as: "publications",
        },
      },
      {
        $unwind: {
          path: "$publications",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "genres",
          localField: "publications.genres",
          foreignField: "_id",
          as: "publications.genres",
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
          from: "publicationreadvolumes",
          localField: "_id",
          foreignField: "volumeId",
          as: "readvolumes",
        },
      },
      {
        $unwind: {
          path: "$readvolumes",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          publicationsId: "$publications._id",
          publicationsTitle: "$publications.title",
          publicationsCreateAt: "$publications.createdAt",
          publicationsGenres: "$publications.genres",
          volume: "$readvolumes",
        },
      },
      {
        $group: {
          _id: "from",
          name: { $first: "$name" },
          publicationsId: { $first: "$publicationsId" },
          publicationsTitle: { $first: "$publicationsTitle" },
          publicationsCreateAt: { $first: "$publicationsCreateAt" },
          publicationsGenres: { $first: "$publicationsGenres" },
          volume: { $push: "$volume" },
        },
      },

      // {
      //   $match: {
      //     $or: [match],
      //   },
      // },
    );

    const result = await PubVolume.aggregate(finalQuery);
    // const result = await ReadVolume.find()
    //   .populate({ path: "user", select: { _id: 1, firstName: 1, lastName: 1 }, model: User })
    //   .populate({
    //     path: "volumeId",
    //     model: PubVolume,
    //     populate: {
    //       path: "publicationId",
    //       model: Publication,
    //       select: {
    //         _id: 1, title: 1, createdAt: 1, genres: 1,
    //       },
    //       populate: {
    //         path: "genres",
    //         model: Genre,
    //         select: { _id: 1, title: 1 },
    //       },
    //     },
    //   });

    // const result = await PubVolume.find({ publicationId })
    //   .populate({
    //     path: "publicationId",
    //     model: Publication,
    //     select: {
    //       _id: 1, title: 1, createdAt: 1, genres: 1,
    //     },
    //     populate: {
    //       path: "genres",
    //       model: Genre,
    //       select: { _id: 1, title: 1 },
    //     },
    //   })
    //   .virtual("publicationReadVolume", {
    //     ref: "volumeId",
    //     localField: "_id",
    //     foreignField: "volumeId",
    //   });
    // .populate({ path: "user", select: { _id: 1, firstName: 1, lastName: 1 }, model: User });
    // .populate({
    //   path: "volumeId",
    //   model: PubVolume,
    //   populate: {
    //     path: "publicationId",
    //     model: Publication,
    //     select: {
    //       _id: 1, title: 1, createdAt: 1, genres: 1,
    //     },
    //     populate: {
    //       path: "genres",
    //       model: Genre,
    //       select: { _id: 1, title: 1 },
    //     },
    //   },
    // });

    // {path: "genres", model: Genre},
    // console.log("final", finalQuery);

    if (result) {
      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        data: result,
      });
    }
    return res.status(200).json({
      message: "No Data Found",
      status: "Success",
    });
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
