const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// File storage configuration with dynamic directories based on route
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `uploads/${req.path.split("/")[1]}`; // Use the route name as the directory name
    fs.access(dir, fs.constants.F_OK, (err) => {
      if (err) {
        // Directory does not exist, so create it with recursive option
        return fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
      }
      return cb(null, dir);
    });
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Serve each HTML file and handle uploads
[
  "first",
  "second",
  "third",
  "final",
  "placement",
  "questionfirst",
  "questionsecond",
  "questionthird",
  "questionfinal",
].forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, "public", `${page}.html`));
  });

  app.post(`/${page}/upload`, upload.single("file"), (req, res) => {
    console.log("Uploaded file to:", `${page}`);
    res.redirect(`/${page}`);
  });

  app.get(`/${page}/files`, (req, res) => {
    const dir = `uploads/${page}`;
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error("Failed to read directory:", err);
        res.sendStatus(500);
        return;
      }
      res.json(files);
    });
  });
});

app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
