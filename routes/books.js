const express = require("express");
const path = require("path");

const BookModel = require("../models/book");
const AuthorModel = require("../models/author");
const router = express.Router();

router.use(express.static("public"));
router.use("/javascripts", express.static(__dirname + "public/javascripts"));

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];

// All book route
router.get("/", async (req, res) => {
  let query = BookModel.find({});

  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishBefore != null && req.query.publishBefore != "") {
    query = query.lte("publishDate", req.query.publishBefore);
  }
  if (req.query.publishAfter != null && req.query.publishAfter != "") {
    query = query.gte("publishDate", req.query.publishAfter);
  }

  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New book route
router.get("/new", async (req, res) => {
  renderNewPage(res, new BookModel());
});

// Create book route
router.post("/", async (req, res) => {
  const book = new BookModel({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`);
  } catch (err) {
    renderNewPage(res, book, err);
  }
});

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

async function renderNewPage(res, book, err) {
  try {
    const authors = await AuthorModel.find({});
    const params = { authors: authors, book: book };
    // if (hasErr) params.errorMessage = "Error Creating Book";
    res.render("books/new", params);
  } catch (err) {
    console.log(err);
    res.redirect("books");
  }
}

module.exports = router;
