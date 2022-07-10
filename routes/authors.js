const express = require("express");
const AuthorModel = require("../models/author");
const BookModel = require("../models/book");

const router = express.Router();

// Create author route
router.post("/", async (req, res) => {
  const author = new AuthorModel({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor._id}`);
  } catch (error) {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});

// Show All authors route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name !== null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await AuthorModel.find(searchOptions);
    res.render("authors/index", { authors: authors, searchOptions: req.query });
  } catch (error) {
    res.redirect("/");
  }
});

// New author route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new AuthorModel() });
});

// Show A Author route
router.get("/:id", async (req, res) => {
  try {
    const author = await AuthorModel.findById(req.params.id);
    const books = await BookModel.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", { author: author, booksByAuthor: books });
  } catch (error) {
    res.redirect("/");
  }
});

// Update A Author route
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await AuthorModel.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch (error) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating Author",
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await AuthorModel.findById(req.params.id);
    await author.remove();
    res.redirect(`/authors`);
  } catch (error) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await AuthorModel.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch (error) {
    console.log(error);
    res.redirect("/authors");
  }
});

module.exports = router;
