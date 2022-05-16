const db = require("../db/connection");

exports.fetchArticle = (article_id) => {
  const queryStr = `
  SELECT 
    users.name AS author,
    title,
    article_id,
    body,
    topic,
    created_at,
    votes
  FROM articles
  JOIN users ON articles.author = users.username
  WHERE article_id = $1;`;
  const queryVals = [article_id];

  return db.query(queryStr, queryVals).then((results) => {
    if (results.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found." });
    } else {
      return results.rows[0];
    }
  });
};
