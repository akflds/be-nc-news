const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const app = express();

app.use(express.json());

app.use("/api/topics", getTopics);

app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "Route not found." });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error." });
});

module.exports = app;
