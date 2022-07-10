const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BookModel = require("../models/book");
const AuthorModel = require("../models/author");
const router = express.Router();

router.use(express.static("public"));
router.use("/javascripts", express.static(__dirname + "public/javascripts"));

const uploadPath = path.join("public", BookModel.coverImageBasePath);

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

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
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new BookModel({
    title: req.body.title,
    author: req.body.author,
    coverImageName: fileName,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`);
  } catch (err) {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

async function renderNewPage(res, book, hasErr = false) {
  try {
    const authors = await AuthorModel.find({});
    const params = { authors: authors, book: book };
    if (hasErr) params.errorMessage = "Error Creating Book";
    res.render("books/new", params);
  } catch (error) {
    res.redirect("books");
  }
}

module.exports = router;
