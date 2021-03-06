const db = require("../db/connection");

exports.countArticles = async (topic) => {
  let queryStr = `
    SELECT COUNT (*)::INT AS total_count
    FROM articles
  `;

  const queryVals = [];

  if (topic) {
    queryStr += `
      WHERE topic = $1
    `;
    queryVals.push(topic);
  }

  const results = await db.query(queryStr, queryVals);
  return results.rows[0];
};
exports.fetchArticle = async (article_id) => {
  const queryStr = `
    SELECT
    users.name AS author,
    a.title,
    a.article_id,
    a.body,
    a.topic,
    a.created_at,
    a.votes,
    COUNT(comments.comment_id)::INT as comment_count
    FROM articles AS a
      LEFT JOIN users ON users.username = a.author
      LEFT JOIN comments ON comments.article_id = a.article_id
    WHERE a.article_id = $1
    GROUP BY a.article_id, a.title, users.username
  `;
  const queryVals = [article_id];

  const results = await db.query(queryStr, queryVals);
  if (results.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Article not found" });
  } else {
    return results.rows[0];
  }
};

exports.fetchArticles = async (
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 0,
  topic
) => {
  const permittedSortOptions = [
    "created_at",
    "comment_count",
    "votes",
    "article_id",
  ];

  const permittedOrderOptions = ["asc", "desc"];

  const queryVals = [limit, p * limit];

  if (
    !permittedSortOptions.includes(sort_by) ||
    !permittedOrderOptions.includes(order)
  ) {
    return Promise.reject({ status: 400, msg: "Bad request: invalid query" });
  }

  let queryStr = `
  SELECT
    users.name AS author,
    a.title,
    a.article_id,
    a.topic,
    a.created_at,
    a.votes,
    COUNT(comments.comment_id)::INT as comment_count
  FROM articles AS a
    LEFT JOIN users ON users.username = a.author
    LEFT JOIN comments ON comments.article_id = a.article_id
  `;

  if (topic) {
    queryStr += `
      WHERE a.topic = $3
    `;
    queryVals.push(topic);
  }

  queryStr += `
    GROUP BY a.article_id, a.title, users.username
    ORDER BY ${sort_by} ${order}
    LIMIT $1 OFFSET $2
    `;

  const results = await db.query(queryStr, queryVals);
  return results.rows;
};

exports.insertArticle = async ({ author, title, body, topic }) => {
  if (author && title && body && topic) {
    const queryStr = `
      INSERT INTO articles
        (author, title, body, topic)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *, 0 AS comment_count;
    `;
    const queryVals = [author, title, body, topic];

    const results = await db.query(queryStr, queryVals);
    return results.rows[0];
  } else {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
};

exports.updateArticle = async (article_id, { inc_votes }) => {
  if (inc_votes) {
    const queryStr = `
      UPDATE articles 
      SET votes = votes + $1 
      WHERE article_id = $2
      RETURNING *;
    `;
    const queryVals = [inc_votes, article_id];
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
