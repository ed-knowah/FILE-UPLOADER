const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 2000 || process.env.PORT;
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const { emitWarning } = require("process");
//const mongoUrl = "mongodb+srv://noah:yrPgJVPF2NkKCJfh@cluster1.u3lma.mongodb.net/fileUpload?retryWrites=true&w=majority"
const mongoUrl = "mongodb://localhost/test";

//Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

//Mongo connection
const conn = mongoose.createConnection(mongoUrl);

//init gfs
let gfs;

//init stream
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//create storage engine

const storage = new GridFsStorage({
  url: mongoUrl,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});


// @route POST /upload
// @desc Uploads file to DB

app.post("/upload", upload.single("file"), (req, res) => {
  const conversion_key = crypto.randomBytes(16).toString("hex");
  res.json({
    file: req.file,
    status: "good",
    encryptionKey: conversion_key,
  });
  //res.redirect('/');
});

app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "true",
      });
    }
    return res.json(files);
  });
});


// @route POST
// @desc Collects data from the User and Sends data to the server

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, password, email);

  if (!email || !name || !password) {
    res.redirect("signup");
  } else {
    res.render("index");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    res.redirect("login");
  } else {
    res.render("index");
  }
});

app.listen(PORT, () => {
  console.log(`Your app is running on port ${PORT}..`);
});
