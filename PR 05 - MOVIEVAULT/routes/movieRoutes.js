const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Movie = require("../models/movie");

// ------------------ Multer Config ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp, gif) are allowed!"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ------------------ Routes ------------------

// GET all movies - listing page
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.render("index", { movies });
  } catch (err) {
    res.status(500).send("Error fetching movies: " + err.message);
  }
});

// GET form to add a new movie
router.get("/add", (req, res) => {
  res.render("add");
});

// POST create a new movie
router.post("/add", upload.single("poster"), async (req, res) => {
  try {
    const { title, genre, releaseYear } = req.body;
    const poster = req.file ? "/uploads/" + req.file.filename : "";

    await Movie.create({ title, genre, releaseYear, poster });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error adding movie: " + err.message);
  }
});

// GET form to edit an existing movie
router.get("/edit/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie not found");
    res.render("edit", { movie });
  } catch (err) {
    res.status(500).send("Error fetching movie: " + err.message);
  }
});

// PUT update an existing movie
router.put("/edit/:id", upload.single("poster"), async (req, res) => {
  try {
    const { title, genre, releaseYear } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie not found");

    movie.title = title;
    movie.genre = genre;
    movie.releaseYear = releaseYear;

    if (req.file) {
      // remove old poster file if it exists
      if (movie.poster) {
        const oldPath = path.join(__dirname, "..", "public", movie.poster);
        fs.unlink(oldPath, () => {});
      }
      movie.poster = "/uploads/" + req.file.filename;
    }

    await movie.save();
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error updating movie: " + err.message);
  }
});

// DELETE a movie
router.delete("/delete/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (movie && movie.poster) {
      const posterPath = path.join(__dirname, "..", "public", movie.poster);
      fs.unlink(posterPath, () => {});
    }
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error deleting movie: " + err.message);
  }
});

module.exports = router;
