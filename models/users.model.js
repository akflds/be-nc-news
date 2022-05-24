const db = require("../db/connection");

exports.fetchUsers = async () => {
  const queryStr = `SELECT username FROM users;`;
  const results = await db.query(queryStr);
  return results.rows;
};

exports.fetchUser = async (username) => {
  const queryStr = `
  SELECT * 
  FROM users
  WHERE username = $1`;
  const queryVals = [username];

  const results = await db.query(queryStr, queryVals);
  if (results.rows.length) {
    return results.rows[0];
  } else {
    return Promise.reject({ status: 404, msg: "Not found." });
  }
};
