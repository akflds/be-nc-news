const apiRouter = require("express").Router();
const {
  topicsRouter,
  articlesRouter,
  usersRouter,
  commentsRouter,
} = require("./index.js");

const { getEndpoints } = require("../controllers/api.controller");

apiRouter.route("/").get(getEndpoints);

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
