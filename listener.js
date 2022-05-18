const app = require("./app");

const { PORT = 8000 } = process.env;
console.log(PORT, "<<<<<< PORT");

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
