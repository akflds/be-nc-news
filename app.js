const express = require("express");
const apiRouter = require("./routes/api-router.js");
const app = express();
app.use(express.json());

app.use("/api", apiRouter);

// Invalid paths
app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "Route not found." });
});

// Database error handler
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request." });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Not found." });
  } else {
    next(err);
  }
});

// Custom error handler
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

// Internal server error
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error." });
});

module.exports = app;
