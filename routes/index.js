const express = require("express");
const BookModel = require("../models/book");

const router = express.Router();

router.use(express.static("public"));
router.use("/javascripts", express.static(__dirname + "public/javascripts"));

router.get("/", async (req, res) => {
  let books;
  try {
    books = await BookModel.find().sort({ createdAt: "desc" }).limit(10).exec();
  } catch (error) {
    books = [];
  }
  res.render("index", { books: books });
});

module.exports = router;
