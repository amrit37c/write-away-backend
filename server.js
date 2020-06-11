const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

dotenv.config({ path: "./config/.env" });
// Connect to db
// const DB = `mongodb://localhost:27017/${process.env.DB_NAME}`; // DEV
const DB = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}`; // production
// const DB = process.env.PROD_DB.replace("<PASSWORD>", process.env.PROD_DB_PASS); // PROD
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


app.listen(process.env.PORT || 3000, () => {
  console.log("server is running", process.env.PORT);
});
