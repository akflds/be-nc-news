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
    return results.rows[0];
  });
};
