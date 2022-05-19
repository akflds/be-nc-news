const db = require("../db/connection");

exports.fetchUsers = () => {
  const queryStr = `SELECT username FROM users;`;
  return db.query(queryStr).then((results) => {
    return results.rows;
  });
};

exports.fetchUser = (username) => {
  const queryStr = `
  SELECT * 
  FROM users
  WHERE username = $1`;
  const queryVals = [username];

  return db.query(queryStr, queryVals).then((results) => {
    if (results.rows.length) {
      return results.rows[0];
    } else {
      return Promise.reject({ status: 404, msg: "Not found." });
    }
  });
};
