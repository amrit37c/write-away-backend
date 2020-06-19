const express = require("express");

const app = express();

// ROUTES
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const genreRouter = require("./routes/genreRouter");
const ageGroupRouter = require("./routes/ageGroupRouter");
const publicationRouter = require("./routes/publicationRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const adminRouter = require("./routes/adminRouter");
const volumeRouter = require("./routes/volumeRouter");

app.get("/", (req, res) => res.send("Welcome to Write Away app"));

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: "5Mb" }));
// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

// Serving images folder
// app.use("/images", express.static("/media/"));
// view engine setup
// app.use(express.static("media"));
app.use("/images", express.static(`${__dirname}/media`));

// Routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/admin/genre", genreRouter);
app.use("/api/v1/admin/age-group", ageGroupRouter);
app.use("/api/v1/publication", publicationRouter);
app.use("/api/v1/admin-dashboard", dashboardRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/volume", volumeRouter);
// 404 - NOT FOUND ROUTE
app.all("*", (req, res, next, err) => {
// next(new AppError(`Reuested resource, ${req.originalUrl} not found!`, 404));
  console.log(">>", err);
  next(new Error("App error"));
  res.status(404).json({
    message: "Page Not Found",
    status: "Failure",
  });
});

module.exports = app;
