const db = require("../db/connection");

exports.fetchCommentsByArticle = (article_id) => {
  const queryStr = `
    SELECT 
      users.name AS author,
      c.comment_id, 
      c.votes, c.created_at, 
      c.body 
    FROM comments AS c 
    JOIN users ON c.author = users.username 
    WHERE article_id = $1;
  `;

  const queryVals = [article_id];

  return db.query(queryStr, queryVals).then((results) => {
    return results.rows;
  });
};

exports.insertComment = (article_id, body) => {
  const queryStr = `
  INSERT INTO comments
    (article_id, author, body)
  VALUES
    ($1, $2, $3)
  RETURNING *;
  `;
  const queryVals = [article_id, body.username, body.body];

  return db.query(queryStr, queryVals).then((results) => {
    return results.rows[0];
  });
};
