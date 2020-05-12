const express = require("express");

const app = express();
const userRouter = require("./routes/userRoutes");
const blogRouter = require("./routes/blogRoutes");
const genreRouter = require("./routes/genreRouter");
const ageGroupRouter = require("./routes/ageGroupRouter");
const publicationRouter = require("./routes/publicationRouter");


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
app.use("/api/v1/genre", genreRouter);
app.use("/api/v1/age-group", ageGroupRouter);
app.use("/api/v1/publication", publicationRouter);

// 404 - NOT FOUND ROUTE
app.all("*", (req, res, next) => {
// next(new AppError(`Reuested resource, ${req.originalUrl} not found!`, 404));
  next(new Error("App error"));
  res.status(404).json({
    message: "Page Not Found",
    status: "Failure",
  });
});

module.exports = app;
