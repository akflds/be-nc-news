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

exports.insertComment = (article_id, comment) => {
  if (
    comment.username &&
    comment.body &&
    typeof comment.username === "string" &&
    typeof comment.body === "string"
  ) {
    const queryStr = `
    INSERT INTO comments
      (article_id, author, body)
    VALUES
      ($1, $2, $3)
    RETURNING *;
    `;
    const queryVals = [article_id, comment.username, comment.body];

    return db.query(queryStr, queryVals).then((results) => {
      return results.rows[0];
    });
  } else {
    return Promise.reject({ status: 400, msg: "Bad request." });
  }
};

exports.removeComment = (comment_id) => {
  const queryStr = `
  DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *
  `;

  const queryVals = [comment_id];
  return db.query(queryStr, queryVals);
};
