const fs = require("fs/promises");

exports.getEndpoints = (req, res, err) => {
  console.log(__dirname);
  return fs
    .readFile("./endpoints.json", "utf8")
    .then((endpoints) => {
      return res.status(200).send(JSON.parse(endpoints));
    })
    .catch((err) => {
      next(err);
    });
};
