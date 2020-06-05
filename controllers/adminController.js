const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Publishings = require("../models/publishcationModel");
const Blogs = require("../models/blogsModel");
const BlogBookMark = require("../models/blogBookMarkModel");
const BlogLikes = require("../models/blogLikeModel");


exports.getStats = (async (req, res) => {
  try {
    const query = { isDeleted: false };
    const customers = await User.find(query);
    const publishings = await Publishings.find({ isPublished: "true" }).countDocuments();
    const blogsRead = await Blogs.find({ readCount: { $exists: true, $ne: [] } });
    const shareCount = await Blogs.find({ shareCount: { $exists: true, $ne: [] } }).countDocuments();
    const reviews = 0;
    // const shareCount = 0;
    const blogLikeCount = await BlogLikes.find({ likeStatus: "1" }).countDocuments();

    if (customers) {
      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        data: {
          customers,
          publishings,
          blogsRead,
          reviews,
          shareCount,
          blogLikeCount,
        },
      });
    }
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: "Failure",
    });
  }
});


// exports.getAllBlogs = (async (req, res) => {
//   try {
//     const query = req.query || { };
//     const sort = { createdAt: -1 };
//     const now = new Date();

//     const finalQuery = [];

//     if (query.isPublished === "today") {
//       query.isPublished = true;

//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
//       query.createdAt = { $gte: today };
//     } else if (query.isPublished === "yesterday") {
//       query.isPublished = true;

//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
//       query.createdAt = { $lte: today };
//     } else if (query.isPublished === "true") {
//       query.isPublished = true;
//     } else if (query.isPublished === "false") {
//       query.isPublished = false;
//     }
//     // if (query.isPublished) {
//     //   query.isPublished = (query.isPublished === "true");
//     // }
//     query.isDeleted = false;

//     const aggregateSort = { $sort: { createdAt: -1 } };

//     if (req.user) {
//       const bmLookUp = {
//         $lookup: {
//           from: "blogbookmarks",
//           let: { blogId: "$_id" },
//           pipeline: [
//             {
//               $addFields:
//                 {
//                   blogId: { $toObjectId: "$blogId" },
//                 },
//             },
//             {
//               $match:
//                 {
//                   $expr:
//                   { $eq: ["$blogId", "$$blogId"] },
//                   user: mongoose.Types.ObjectId(req.user),
//                 },
//             },
//           ],
//           as: "bookmark",
//         },
//       };
//       const blogLikeLookUp = {
//         $lookup: {
//           from: "bloglikes",
//           let: { blogId: "$_id" },
//           pipeline: [
//             {
//               $addFields:
//                 {
//                   blogId: { $toObjectId: "$blogId" },
//                 },
//             },
//             {
//               $match:
//                 {
//                   $expr:
//                   { $eq: ["$blogId", "$$blogId"] },
//                   user: mongoose.Types.ObjectId(req.user),
//                 },
//             },
//           ],
//           as: "like",
//         },
//       };

//       const bmunwind = {
//         $unwind: {
//           path: "$bookmark",
//           preserveNullAndEmptyArrays: true,
//         },
//       };

//       const unwindLike = {
//         $unwind: {
//           path: "$like",
//           preserveNullAndEmptyArrays: true,
//         },
//       };
//       finalQuery.push(bmLookUp, blogLikeLookUp, bmunwind, aggregateSort, unwindLike);
//     }
//     // console.log("query", query);
//     // console.log("final Quer", finalQuery);

//     finalQuery.push(
//       aggregateSort,
//       {
//         $match: {
//           $or: [query],
//         },
//       },
//     );

//     const result = await Blogs.aggregate(finalQuery);
//     // const result = await Blog.aggregate([
//     //   { $sort: { createdAt: -1 } },
//     //   {
//     //     $match:
//     //     {
//     //       $or: [
//     //         {
//     //           isPublished: false,
//     //         },
//     //       ],
//     //     },
//     //   },
//     // ]);

//     if (result) {
//       return res.status(200).json({
//         message: "Data Found",
//         status: "Success",
//         data: result,
//       });
//     }
//   } catch (err) {
//     return res.status(409).json({
//       message: err.message,
//       status: "Failure",
//     });
//   }
// });
// exports.getOneBlog = (async (req, res) => {
//   try {
//     const { id: _id } = req.params;
//     const query = {
//       _id,
//     };

//     // fetch single blog
//     const result = await Blogs.find(query).populate("blogbookmarks");
//     if (result) {
//       // fetch blog by like count
//       const likeResult = await BlogBookMark.find({
//         blogId: _id,
//       }).count();

//       // fetch user's like post - user who like or not
//       const userLikeResult = await BlogBookMark.find({
//         blogId: _id,
//         user: req.user,
//       });

//       result[0].likeCount = likeResult;
//       const data = result[0].toJSON();
//       data.userDetail = userLikeResult;

//       return res.status(200).json({
//         message: "Data Found",
//         status: "Success",
//         data,
//       });
//     }
//   } catch (err) {
//     return res.status(404).json({
//       message: "No Data Found",
//       status: "Failure",
//     });
//   }
// });


// exports.saveBlog = (async (req, res) => {
//   try {
//     req.body.media = `${req.file.filename}`;
//     const result = await Blogs(req.body).save();
//     if (result) {
//       return res.status(201).json({
//         message: "Blog Created",
//         status: "Success",
//         data: result,
//       });
//     }

//   } catch (err) {
//     return res.status(409).json({
//       message: err.message,
//       status: "Failure",
//     });
//   }
// });
// exports.deleteBlog = (async (req, res) => {
//   try {
//     const { id: _id } = req.params;
//     const query = { _id };
//     const update = { isDeleted: true };
//     const result = await Blogs.update(query, update);
//     if (result) {
//       return res.status(200).json({
//         message: "Data Deleted",
//         status: "Success",
//       });
//     }
//     return res.status(200).json({
//       message: "No Data Found",
//       status: "Failure",
//     });
//   } catch (err) {
//     return res.status(404).json({
//       message: "No Data Found",
//       status: "Failure",
//     });
//   }
// });
// exports.updateBlog = (async (req, res) => {
//   try {
//     // const query = { _id: mongoose.Types.ObjectId(req.params.id) };
//     const result = await Blogs.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (result) {
//       return res.status(200).json({
//         message: "Blog Updated",
//         status: "Success",
//         data: result,
//       });
//     }
//   } catch (error) {
//     return res.status(409).json({
//       message: error.message,
//       status: "Failure",
//     });
//   }
// });
