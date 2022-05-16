const db = require("../db/connection");

exports.fetchUsers = () => {
  const queryStr = `SELECT username FROM users;`;
  return db.query(queryStr).then((results) => {
    return results.rows;
  });
};
