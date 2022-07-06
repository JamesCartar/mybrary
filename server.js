// Database connection
const connectDB = require("./db/connect");
// Database connection

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// routes
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connect to mongoose"));

app.use("/", indexRouter);
app.use("/authors", authorRouter);

const start = async () => {
  try {
    // database connection
    // await connectDB(process.env.MONGO_URI);
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is listening on port http://www.localhost:3000");
    });
  } catch (error) {
    console.log(error);
  }
};

start();
