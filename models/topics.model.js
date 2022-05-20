const db = require("../db/connection");

exports.fetchTopics = async () => {
  const queryStr = "SELECT * FROM topics;";
  const results = await db.query(queryStr);
  return results.rows;
};
