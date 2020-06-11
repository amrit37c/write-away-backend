const mongoose = require("mongoose");
const Blog = require("../models/blogsModel");
const User = require("../models/userModel");
const BlogBookMark = require("../models/blogBookMarkModel");
const BlogLike = require("../models/blogLikeModel");
const BlogShre = require("../models/socialShareBlogModel");

exports.save = (async (req, res) => {
  try {
    req.body.media = `${req.file[0]}`;
    req.body.media520 = req.file[0] ? req.file[0] : "";
    req.body.media690 = req.file[1] ? req.file[1] : "";
    req.body.media138 = req.file[2] ? req.file[2] : "";
    if (req.body.activeBlog) {
      const disableActiveBlog = await Blog.findOneAndUpdate({ activeBlog: true }, { activeBlog: false }, { new: true });
    }
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

    console.log("req.query", req.query);
    const finalQuery = [];

    if (query.isPublished === "today") {
      query.isPublished = true;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      // query.createdAt = { $gte: today };
    } else if (query.isPublished === "yesterday") {
      query.isPublished = true;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (query.isPublished === "true") {
      query.isPublished = true;
    } else if (query.isPublished === "false") {
      query.isPublished = false;
    }
    if (query.activeBlog === "true") {
      query.activeBlog = true;
    }
    if (query.activeBlog === "false") {
      query.activeBlog = false;
    }


    query.isDeleted = false;

    const aggregateSort = { $sort: { updatedAt: -1 } };


    if (req.user) {
      const likeCountLookUp = {
        $lookup: {
          from: "bloglikes",
          let: { blogId: "$_id" },
          pipeline: [
            {
              $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
            },
            {
              $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },
                  likeStatus: "1",
                },
            },
          ],
          as: "likeCount",
        },
      };
      const bmLookUp = {
        $lookup: {
          from: "blogbookmarks",
          let: { blogId: "$_id" },
          pipeline: [
            {
              $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
            },
            {
              $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },
                  user: mongoose.Types.ObjectId(req.user),
                },
            },
          ],
          as: "bookmark",
        },
      };
      const blogLikeLookUp = {
        $lookup: {
          from: "bloglikes",
          let: { blogId: "$_id" },
          pipeline: [
            {
              $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
            },
            {
              $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },
                  user: mongoose.Types.ObjectId(req.user),
                },
            },
          ],
          as: "like",
        },
      };

      const bmunwind = {
        $unwind: {
          path: "$bookmark",
          preserveNullAndEmptyArrays: true,
        },
      };
      const likeCountunwind = {
        $unwind: {
          path: "$likeCount",
          preserveNullAndEmptyArrays: true,
        },
      };

      const unwindLike = {
        $unwind: {
          path: "$like",
          preserveNullAndEmptyArrays: true,
        },
      };

      finalQuery.push(bmLookUp, blogLikeLookUp, likeCountunwind, likeCountLookUp, bmunwind, aggregateSort, unwindLike);
    }


    finalQuery.push(
      aggregateSort,
      {
        $match: {
          $or: [query],
        },
      },
    );

    const result = await Blog.aggregate(finalQuery);


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
    const result = await Blog.find(query);
    if (result) {
      const likeResult = await BlogLike.find({
        blogId: _id,
        likeStatus: "1",
      }).count();

      // fetch user's like post - user who like or not
      const userLikeResult = await BlogLike.findOne({
        blogId: _id,
        user: req.user,
      });


      result[0].likeCount = likeResult;
      const data = result[0].toJSON();
      data.like = userLikeResult;
      // data.like = likeResult;

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
    if (req.file) {
      // req.body.media = `${req.file.filename}`;
      req.body.media = `${req.file[0]}`;
      req.body.media520 = req.file[0] ? req.file[0] : "";
      req.body.media690 = req.file[1] ? req.file[1] : "";
      req.body.media138 = req.file[2] ? req.file[2] : "";
    }
    if (req.body.activeBlog) {
      const disableActiveBlog = await Blog.findOneAndUpdate({ activeBlog: true }, { activeBlog: false }, { new: true });
    }

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


exports.saveBookMark = (async (req, res) => {
  try {
    req.body.user = req.user;


    const result = await BlogBookMark(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Blog Bookmark Done",
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
    const result = await BlogBookMark.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Blog Bookmark Update",
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


    const result = await BlogLike(req.body).save();
    if (result) {
      return res.status(201).json({
        message: "Blog Like Done",
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
    const result = await BlogLike.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (result) {
      return res.status(200).json({
        message: "Blog Like Update",
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

// Update Read
exports.updateRead = (async (req, res) => {
  try {
    req.body.readCount = req.user;

    const user = await Blog.find({ _id: req.params.id, readCount: { $in: [mongoose.Types.ObjectId(req.user)] } }).countDocuments();

    if (!user) {
      const result = await Blog.findByIdAndUpdate(req.params.id, { $push: req.body }, { new: true });

      if (result) {
        return res.status(200).json({
          message: "User Read Updated",
          status: "Success",
          data: result,
        });
      }
    } else {
      return res.status(200).json({
        message: "User Already Read this blg",
        status: "Success",
      });
    }
  } catch (error) {
    return res.status(409).json({
      message: error.message,
      status: "Failure",
    });
  }
});

// Update Share
exports.updateShare = (async (req, res) => {
  try {
    console.log("user", req.user);
    req.body.user = req.user;
    req.body.blogId = req.params.id;


    const result = await BlogShre(req.body).save();

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


exports.getUserBlog = (async (req, res) => {
  try {
    const { user } = req;


    // 1. writing publication
    // 2. Read publication
    // 3. BookMarks
    // 4. submissions
    // 5. published
    // const reads = await Blog.find({ readCount: { $in: [user] } }).populate("blogbookmarks");
    const query = {
      readCount: { $in: [user] },
    };


    const finalQuery = [];
    // publication BookMark Lookup
    const publicationBmLp = {
      $lookup: {
        from: "publicationbookmark",
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
                user: mongoose.Types.ObjectId(user),
              },
          },
        ],
        as: "bookmarkPublication",
      },
    };

    // // publication Like lookup
    // const publicationLp = {
    //   $lookup: {
    //     from: "publicationlike",
    //     let: { publicationId: "$_id" },
    //     pipeline: [
    //       {
    //         $addFields:
    //           {
    //             publicationId: { $toObjectId: "$publicationId" },
    //           },
    //       },
    //       {
    //         $match:
    //           {
    //             $expr:
    //             { $eq: ["$publicationId", "$$publicationId"] },
    //             user: mongoose.Types.ObjectId(req.user),
    //           },
    //       },
    //     ],
    //     as: "publicationLike",
    //   },
    // };

    // // User Publication Lookup
    // const userPublicationLp = {
    //   $lookup: {
    //     from: "userpublication",
    //     let: { publicationId: "$_id" },
    //     pipeline: [
    //       {
    //         $addFields:
    //           {
    //             blogId: { $toObjectId: "$blogId" },
    //           },
    //       },
    //       {
    //         $match:
    //           {
    //             $expr:
    //             { $eq: ["$publicationId", "$$publicationId"] },
    //             user: mongoose.Types.ObjectId(req.user),
    //           },
    //       },
    //     ],
    //     as: "writing",
    //   },
    // };

    // let publicationBmLp = {
    //   $unwind: {
    //     path: "$bookmark",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // };


    finalQuery.push(


      { $sort: { createdAt: -1 } },
      {
        $unwind: {
          path: "$like",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [{ readCount: { $in: [mongoose.Types.ObjectId(user)] } }],
        },
      },
    );


    // const result = await Blog.find(query).populate({ path: "blogbookmarks" }).sort(sort);
    const reads = await Blog.aggregate(finalQuery);

    if (reads) {
      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        reads,
      });
    }
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: "Failure",
    });
  }
});


exports.getAllBlogStatAdmin = (async (req, res) => {
  try {
    const sort = {
      createdAt: -1,
    };
    const query = { activeBlog: true };
    // fetch single blog

    const result = await Blog.find(query).populate({ path: "readCount", select: { _id: 1, email: 1 }, model: User }).sort(sort);


    if (result.length) {
      const likeResult = await BlogLike.find({
        blogId: result[0].id,
        likeStatus: "1",
      }).populate({ path: "user", select: { _id: 1, email: 1 }, model: User });

      const bmResult = await BlogBookMark.find({
        blogId: result[0].id,
        bookMarkStatus: "1",
      }).populate({
        path: "user",
        select: { _id: 1, email: 1 },
        model: User,
      });

      const shareCount = await BlogShre.find({ blogId: result[0].id, platform: { $ne: "site" } }).populate({ path: "user", select: { _id: 1, email: 1 }, model: User });
      const copiesCount = await BlogShre.find({ blogId: result[0].id, platform: "site" }).populate({ path: "user", select: { _id: 1, email: 1 }, model: User });


      const data = result[0].toJSON();
      data.shareCount = shareCount;
      data.copiesCount = copiesCount;
      const blogData = await Blog.find({ isPublished: true, activeBlog: false, isDeleted: false }).sort({ updatedAt: -1 });

      data.likeCount = likeResult;
      data.bookmarkCount = bmResult;

      const allBlog = await Blog.find({ isPublished: true }).countDocuments();
      const totalReads = await Blog.aggregate([
        { $unwind: "$readCount" },
        { $group: { _id: "$_id", sum: { $sum: 1 } } },
        { $group: { _id: null, sum: { $sum: "$sum" } } },
      ]);


      const totalLikes = await BlogLike.aggregate([
        { $match: { likeStatus: "1" } },
        { $group: { _id: "$_id", sum: { $sum: 1 } } },
        { $group: { _id: null, sum: { $sum: "$sum" } } },
      ]);

      const BlogShare = await BlogShre.aggregate([
        { $match: { platform: "site" } },
        { $group: { _id: "$_id", sum: { $sum: 1 } } },
        { $group: { _id: null, sum: { $sum: "$sum" } } },
      ]);

      const BlogShareLink = await BlogShre.aggregate([
        { $match: { platform: { $ne: "site" } } },
        { $group: { _id: "$_id", sum: { $sum: 1 } } },
        { $group: { _id: null, sum: { $sum: "$sum" } } },
      ]);

      console.log(">>>>>>>>>>>>", BlogShare);


      const avrReads = totalReads.length ? (totalReads[0].sum / allBlog).toFixed(2) : 0;
      const avrLikes = totalLikes.length ? (totalLikes[0].sum / allBlog).toFixed(2) : 0;
      const avrShare = BlogShare.length ? (BlogShare[0].sum / allBlog).toFixed(2) : 0;
      const avgCopiesLink = BlogShareLink.length ? (BlogShareLink[0].sum / allBlog).toFixed(2) : 0;
      // if(totalReads.length){
      //   avrReads = (totalReads[0].sum / allBlog).toFixed(2);
      // }

      // const avrLikes = (totalLikes[0].sum / allBlog).toFixed(2);


      return res.status(200).json({
        message: "Data Found",
        status: "Success",
        data,
        blogData,
        allBlog,
        avrReads,
        avrLikes,
        avrShare,
        avgCopiesLink,
      });
    }
    return res.status(200).json({
      message: "No Data Found",
      status: "Failure",
    });
  } catch (err) {
    return res.status(404).json({
      message: "No Data Found",
      status: `Failure${err}`,
    });
  }
});


exports.getFilterBlog = (async (req, res) => {
  try {
    const query = req.query || { };
    const sort = { createdAt: -1 };
    const now = new Date();

    console.log("req.query", req.query);
    const finalQuery = [];

    if (query.isPublished === "today") {
      query.isPublished = true;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      // query.createdAt = { $gte: today };
    } else if (query.isPublished === "yesterday") {
      query.isPublished = true;

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      // query.createdAt = { $lte: today };
    } else if (query.isPublished === "true") {
      query.isPublished = true;
    } else if (query.isPublished === "false") {
      query.isPublished = false;
    }
    if (query.activeBlog === "true") {
      console.log("actuve");
      query.activeBlog = true;
    } else if (query.activeBlog === "false") {
      console.log("actuve");
      query.activeBlog = false;
    }


    query.isDeleted = false;

    const aggregateSort = { $sort: { updatedAt: -1 } };


    const bmLookUp = {
      $lookup: {
        from: "blogbookmarks",
        let: { blogId: "$_id" },
        pipeline: [
          {
            $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
          },
          {
            $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },

                },
          },
          // {
          //   $lookup: {
          //     from: "users",
          //     let: { user: "$user" },
          //     pipeline: [
          //       { $match: { $expr: ["$users", "$$user"] } },
          //     ],
          //     as: "user",
          //   },
          // },
        ],
        as: "bookmark",
      },
    };
    const blogLikeLookUp = {
      $lookup: {
        from: "bloglikes",
        let: { blogId: "$_id" },
        pipeline: [
          {
            $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
          },
          {
            $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },

                },
          },
        ],
        as: "like",
      },
    };

    const blogShareLookUp = {
      $lookup: {
        from: "socialshareblogs",
        let: { blogId: "$_id" },
        pipeline: [
          {
            $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
          },
          {
            $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },
                  platform: { $ne: "site" },

                },
          },
        ],
        as: "shareCount",
      },
    };
    const blogLinkCopyLookUp = {
      $lookup: {
        from: "socialshareblogs",
        let: { blogId: "$_id" },
        pipeline: [
          {
            $addFields:
                {
                  blogId: { $toObjectId: "$blogId" },
                },
          },
          {
            $match:
                {
                  $expr:
                  { $eq: ["$blogId", "$$blogId"] },
                  platform: "site",

                },
          },
        ],
        as: "copiesCount",
      },
    };

    const bmunwind = {
      $unwind: {
        path: "$bookmark",
        preserveNullAndEmptyArrays: true,
      },
    };

    const unwindLike = {
      $unwind: {
        path: "$like",
        preserveNullAndEmptyArrays: true,
      },
    };
    const unwindShare = {
      $unwind: {
        path: "$like",
        preserveNullAndEmptyArrays: true,
      },
    };


    const project = {
      $project: {
        readCount: 1,
        likeCount: 1,
        shareCount: "$shareCount",
        // copiesCount: 1,
        isPublished: 1,
        isActive: 1,
        isDeleted: 1,
        title: 1,
        content: 1,
        media: 1,
        createdAt: 1,
        updatedAt: 1,
        like: "$like",
        bookmark: "$bookmark",
        copiesCount: "$copiesCount",
      },
    };
    const group = {
      $group: {
        _id: "$_id",
        readCount: { $first: "$readCount" },
        likeCount: { $first: "$likeCount" },

        // copiesCount: { $first: "$copiesCount" },
        isPublished: { $first: "$isPublished" },
        isActive: { $first: "$isActive" },
        isDeleted: { $first: "$isDeleted" },
        title: { $first: "$title" },
        content: { $first: "$content" },
        media: { $first: "$media" },
        createdAt: { $first: "$createdAt" },
        like: { $push: "$like" },
        bookmark: { $push: "$bookmark" },
        shareCount: { $first: "$shareCount" },
        copiesCount: { $first: "$copiesCount" },
      },
    };


    finalQuery.push(
      bmLookUp, blogLikeLookUp, blogShareLookUp, blogLinkCopyLookUp, unwindShare, bmunwind, aggregateSort, unwindLike,
      {
        $match: {
          $or: [query],
        },
      },
      project, group,
    );

    const result = await Blog.aggregate(finalQuery);

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
