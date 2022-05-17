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
    console.log(results.rows);
    return results.rows;
  });
};
