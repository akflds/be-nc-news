const db = require("../db/connection");

exports.totalCommentsByArticle = async (article_id) => {
  const queryStr = `
    SELECT
      COUNT(*)::INT as total_count
    FROM comments
    WHERE article_id = $1;
  `;

  const queryVals = [article_id];
  const results = await db.query(queryStr, queryVals);
  return results.rows[0];
};

exports.fetchCommentsByArticle = async (article_id, limit = 10, p = 0) => {
  const queryStr = `
    SELECT 
      users.name AS author,
      c.comment_id, 
      c.votes, c.created_at, 
      c.body 
    FROM comments AS c 
    JOIN users ON c.author = users.username 
    WHERE article_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const queryVals = [article_id, limit, p * limit];

  const results = await db.query(queryStr, queryVals);
  return results.rows;
};

exports.insertComment = async (article_id, comment) => {
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

    const results = await db.query(queryStr, queryVals);
    return results.rows[0];
  } else {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
};

exports.updateComment = async (comment_id, { inc_votes }) => {
  if (inc_votes) {
    const queryStr = `
    UPDATE comments 
    SET votes = votes + $1 
    WHERE comment_id = $2
    RETURNING *;
    `;
    const queryVals = [inc_votes, comment_id];
    const results = await db.query(queryStr, queryVals);
    if (results.rows.length) {
      return results.rows[0];
    } else {
      return Promise.reject({ status: 404, msg: "Not found" });
    }
  } else {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
};

exports.removeComment = async (comment_id) => {
  const queryStr = `
  DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *
  `;

  const queryVals = [comment_id];
  const results = await db.query(queryStr, queryVals);
  if (results.rows.length) {
    return Promise.resolve();
  } else {
    return Promise.reject({ status: 404, msg: "Comment not found" });
  }
};
