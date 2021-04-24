const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 2000 || process.env.PORT;
const mongoose = require("mongoose");
const multer = require("multer");
//const upload = multer({dest: 'uploads/'});
const User = require("./model/user");
const mongoUrl = "mongodb://localhost/test";

//Middleware
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
//app.use(methodOverride("_method"));

//Mongo connection
const conn = mongoose.createConnection(mongoUrl);
(async function () {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return console.log(`Successfully connected to database..`);
  } catch (error) {
    console.log(`Error connecting to DB`, error);
    return process.exit(1);
  }
})();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

//file storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("uploadForm");
});

app.post("/upload", uploadOptions.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

  const person = new User.userModel();
  const { name } = req.body;

  person.image = `${basePath}${fileName}`;
  person.name = name;
  user = person.save((err, savedObject) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    }
    res.send(savedObject);
  });
});

app.listen(PORT, () => {
  console.log(`Your app is running on port ${PORT}..`);
});
