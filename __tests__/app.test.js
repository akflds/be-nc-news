const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
require("jest-sorted");
const endpoints = require("../endpoints.json");
const testData = require("../db/data/test-data");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("Status 200: returns a JSON object representing the endpoints", async () => {
    const { type, body } = await request(app).get("/api").expect(200);
    expect(body).toEqual(endpoints);
    expect(type).toEqual("application/json");
  });

  test("Status 404: indicates resource has not been found", async () => {
    const { body } = await request(app).get("/api/notARoute").expect(404);
    expect(body.msg).toBe("Not found");
  });
});

describe("GET /api/topics", () => {
  test("Status 200: returns an array of topic objects with a slug and description", async () => {
    const { body } = await request(app).get("/api/topics").expect(200);
    expect(body.topics).toHaveLength(3);
    body.topics.forEach((topic) => {
      expect.objectContaining({
        description: expect.any(String),
        slug: expect.any(String),
      });
    });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Status 200: returns an individual article", async () => {
    const { body } = await request(app).get(`/api/articles/1`).expect(200);
    expect(body.article).toEqual(
      expect.objectContaining({
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "jonny",
        body: "I find this existence challenging",
        created_at: expect.any(String),
        votes: 100,
      })
    );
  });

  test("Status 200: returns an individual article with comment count", async () => {
    const { body } = await request(app).get(`/api/articles/1`).expect(200);
    expect(body.article).toEqual(
      expect.objectContaining({
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "jonny",
        body: "I find this existence challenging",
        created_at: expect.any(String),
        votes: 100,
        comment_count: 11,
      })
    );
  });

  test("Status 200: returns an article with 0 comments", async () => {
    const { body } = await request(app).get(`/api/articles/2`).expect(200);
    expect(body.article.comment_count).toBe(0);
  });

  test("Status 400: indicates a bad request has been sent", async () => {
    const { body } = await request(app).get("/api/articles/seven").expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: indicates an id is not found", async () => {
    const { body } = await request(app)
      .get("/api/articles/9000000")
      .expect(404);
    expect(body.msg).toBe("Article not found");
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("Status 200: updates vote count by a positive value", async () => {
    const { body } = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 100 })
      .expect(200);
    expect(body.article.votes).toBe(200);
  });

  test("Status 200: updates vote count by a negative value", async () => {
    const { body } = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -100 })
      .expect(200);
    expect(body.article.votes).toBe(0);
  });

  test("Status 400: indicates a bad request when there is an incorrect key in the body", async () => {
    const { body } = await request(app)
      .patch("/api/articles/1")
      .send({ votes: 100 })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: indicates a bad request when the wrong type of value is sent in the body ", async () => {
    const { body } = await request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "one" })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: indicates a bad request when an incorrect article_id is given", async () => {
    const { body } = await request(app)
      .patch("/api/articles/seven")
      .send({ inc_votes: 1 })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: indicates an id is not found", async () => {
    const { body } = await request(app)
      .patch("/api/articles/9000000")
      .send({ inc_votes: 1 })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });
});

describe("GET /api/users", () => {
  test("Status 200: returns a list of users, including their usernames", async () => {
    const { body } = await request(app).get("/api/users").expect(200);
    expect(body.users).toHaveLength(4);
    expect(body.users.every((user) => user.username)).toBe(true);
  });
});

describe("GET /api/users/:username", () => {
  test("Status 200: returns a user with the specified username", async () => {
    const { body } = await request(app)
      .get("/api/users/butter_bridge")
      .expect(200);
    expect(body.user).toEqual(
      expect.objectContaining({
        username: "butter_bridge",
        avatar_url:
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        name: "jonny",
      })
    );
  });

  test("Status 404: not found if the user is not present in the database", async () => {
    const { body } = await request(app)
      .get("/api/users/not_in_the_db")
      .expect(404);
    expect(body.msg).toBe("User not found");
  });
});

describe("GET /api/articles", () => {
  test("Status 200: returns a list of articles", async () => {
    const { body } = await request(app).get(`/api/articles`).expect(200);
    expect(body.articles).toBeTruthy();
    body.articles.forEach((article) => {
      expect(article).toEqual(
        expect.objectContaining({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          comment_count: expect.any(Number),
        })
      );
    });
  });

  test("Status 200: returns articles ordered by date, in descending order", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.articles).toBeSorted({
      key: "created_at",
      descending: true,
    });
  });

  test("Status 200: check the first object against values from the test data", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.articles[0]).toEqual({
      article_id: 3,
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "sam",
      created_at: expect.any(String),
      votes: 0,
      comment_count: 2,
    });
  });

  test("Status 200: returns articles sorted by the given query", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200);
    expect(body.articles).toBeSorted({
      key: "comment_count",
      descending: true,
    });
  });

  test("Status 400: only sorts on permitted columns", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=banana")
      .expect(400);
    expect(body.msg).toBe("Bad request: invalid query");
  });

  test("Status 200: returns articles in the specified order", async () => {
    const { body } = await request(app)
      .get("/api/articles?order=asc")
      .expect(200);
    expect(body.articles).toBeSorted({
      key: "created_at",
      descending: false,
    });
  });

  test("Status: 400: only orders on permitted values", async () => {
    const { body } = await request(app)
      .get("/api/articles?order=banana")
      .expect(400);
    expect(body.msg).toBe("Bad request: invalid query");
  });

  test("Status 200: returns articles on a given topic", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=mitch")
      .expect(200);
    expect(body.articles).toBeTruthy();
    expect(body.articles.every((article) => article.topic === "mitch")).toBe(
      true
    );
  });

  test("Status 200: returns empty array when given topic that exists, but has no articles", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=paper")
      .expect(200);
    expect(body.articles).toHaveLength(0);
  });

  test("Status 404: specified topic does not exist in the db", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=banana")
      .expect(404);
    expect(body.msg).toBe("Topic not found");
  });

  test("Status 200: returns correct results for multiple queries", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=votes&order=asc&topic=mitch")
      .expect(200);
    expect(body.articles.length).toBeTruthy();
    expect(body.articles).toBeSorted({ key: "votes", descending: false });
  });

  test("Status 400: bad request if using a key that isn't sort_by", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort=comment_count")
      .expect(400);
    expect(body.msg).toBe("Bad request: invalid query");
  });

  test("Status 400: bad request if using incorrect key to order", async () => {
    const { body } = await request(app)
      .get("/api/articles?order_by=asc")
      .expect(400);
    expect(body.msg).toBe("Bad request: invalid query");
  });

  test("Status 400: bad request if using an incorrect key for topics", async () => {
    const { body } = await request(app)
      .get("/api/articles?get_topic=mitch")
      .expect(400);
    expect(body.msg).toBe("Bad request: invalid query");
  });

  test("Status 400: bad request if using a key that isn't permitted", async () => {
    const { body } = await request(app)
      .get("/api/articles?article_id=1")
      .expect(400);
    expect(body.msg).toBe("Bad request: invalid query");
  });

  test("Status 200: returns 10 articles by default", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.articles).toHaveLength(10);
  });

  test("Status 200: returns specified number of articles", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=5")
      .expect(200);
    expect(body.articles).toHaveLength(5);
  });

  test("Status 200: returns specified number of articles for a specified topic", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=5&topic=mitch")
      .expect(200);
    expect(body.articles).toHaveLength(5);
  });

  test("Status 400: returns bad request when using an incorrect value for limit", async () => {
    const { body } = await request(app)
      .get("/api/articles?limit=five")
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 200: can specify a page and return articles starting from that value", async () => {
    const { body } = await request(app).get("/api/articles?p=1").expect(200);
    expect(body.articles).toHaveLength(2);
  });

  test("Status 200: offset is calculated when given a custom limit", async () => {
    const { body } = await request(app)
      .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=1")
      .expect(200);
    expect(body.articles).toHaveLength(5);
    expect(body.articles[0].article_id).toBe(6);
  });

  test("Status 400: returns bad request when using an incorrect value for page", async () => {
    const { body } = await request(app).get("/api/articles?p=five").expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: returns not found when accessing a page that does not yet exist", async () => {
    const { body } = await request(app)
      .get("/api/articles?p=900000")
      .expect(404);
    expect(body.msg).toBe("Page not found");
  });

  test("Status 200: returns the total article count alongside the array of articles", async () => {
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body.total_count).toBe(12);
  });

  test("Status 200: returns the total article count alongside the array of articles with topic filters applied", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=mitch")
      .expect(200);
    expect(body.total_count).toBe(11);
  });

  test("Status 200: returns the total article count alongside the array of articles with topic filters applied when there are no articles for a topic", async () => {
    const { body } = await request(app)
      .get("/api/articles?topic=paper")
      .expect(200);
    expect(body.total_count).toBe(0);
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status 200: returns a list of comments for the specified article", async () => {
    const { body } = await request(app)
      .get(`/api/articles/1/comments`)
      .expect(200);
    expect(body.comments.length).toBeTruthy();
    body.comments.forEach((comment) => {
      expect(comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
        })
      );
    });
  });

  test("Status 200: returns an empty array if there are no comments for the specified article", async () => {
    const { body } = await request(app)
      .get(`/api/articles/2/comments`)
      .expect(200);
    expect(body.comments).toEqual([]);
  });

  test("Status 400: should indicate bad request if article_id is invalid value not exist", async () => {
    const { body } = await request(app)
      .get("/api/articles/one/comments")
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: should indicate if an article_id is not found", async () => {
    const { body } = await request(app)
      .get("/api/articles/900000/comments")
      .expect(404);
    expect(body.msg).toBe("Article not found");
  });

  test("Status 200: returns 10 comments by default", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);
    expect(body.comments.length).toBe(10);
  });

  test("Status 200: returns specified number of comments", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200);
    expect(body.comments.length).toBe(5);
  });

  test("Status 400: returns bad request when given an incorrect value for limit", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=five")
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 200: specify a page to start at", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?p=1")
      .expect(200);
    expect(body.comments.length).toBe(1);
  });

  test("Status 200: limit and page calculate correctly", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?limit=5&p=2")
      .expect(200);
    expect(body.comments.length).toBe(1);
  });

  test("Status 400: returns bad request when p is given incorrect value", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?p=two")
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: returns not found when page does not exist", async () => {
    const { body } = await request(app)
      .get("/api/articles/1/comments?p=90000")
      .expect(404);
    expect(body.msg).toBe("Page not found");
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Status 201: adds a new comment", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "a test comment",
      })
      .expect(201);
    expect(body.comment).toEqual(
      expect.objectContaining({
        author: "butter_bridge",
        body: "a test comment",
        article_id: 1,
        created_at: expect.any(String),
        votes: 0,
      })
    );
  });

  test("Status 404: returns unprocessable entity when given an unknown user", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "andy",
        body: "a test comment",
      })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });

  test("Status 400: returns bad request when given incorrect keys", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "sam",
        body: "a test comment",
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: returns bad request when given an incorrect data types", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: 100,
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: returns bad request when given incomplete object", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: returns bad request when given article_id in an invalid format", async () => {
    const { body } = await request(app)
      .post("/api/articles/one/comments")
      .send({
        username: "butter_bridge",
        body: "a test comment",
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: returns not found if the article_id does not exist", async () => {
    const { body } = await request(app)
      .post("/api/articles/90000/comments")
      .send({
        username: "butter_bridge",
        body: "a test comment",
      })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Status 204: removes the specified comment", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("Status 400: returns bad request when sending invalid option for comment_id", async () => {
    const { body } = await request(app)
      .delete("/api/comments/notAnId")
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: returns not found when trying to delete a comment that isn't present in the db", async () => {
    const { body } = await request(app)
      .delete("/api/comments/900000")
      .expect(404);
    expect(body.msg).toBe("Comment not found");
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("Status 200: updates vote count by a positive value", async () => {
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 100 })
      .expect(200);
    expect(body.comment).toEqual(
      expect.objectContaining({
        comment_id: 1,
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 116,
        author: "butter_bridge",
        article_id: 9,
        created_at: expect.any(String),
      })
    );
  });

  test("Status 200: updates vote count by a negative value", async () => {
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -16 })
      .expect(200);
    expect(body.comment.votes).toBe(0);
  });

  test("Status 400: indicates a bad request when there is an incorrect key in the body", async () => {
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ votes: 100 })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: indicates a bad request when the wrong type of value is sent in the body ", async () => {
    const { body } = await request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "one" })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: indicates a bad request when an incorrect comment_id is given", async () => {
    const { body } = await request(app)
      .patch("/api/comments/seven")
      .send({ inc_votes: 1 })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 404: indicates an id is not found", async () => {
    const { body } = await request(app)
      .patch("/api/comments/9000000")
      .send({ inc_votes: 1 })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });
});

describe("POST /api/articles", () => {
  test("Status 201: adds a new article", async () => {
    const { body } = await request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "The best article",
        body: "The best article content",
        topic: "paper",
      })
      .expect(201);
    expect(body.article).toEqual(
      expect.objectContaining({
        article_id: expect.any(Number),
        author: "butter_bridge",
        title: "The best article",
        body: "The best article content",
        topic: "paper",
        created_at: expect.any(String),
        votes: 0,
        comment_count: 0,
      })
    );
  });

  test("Status 404: returns unprocessable entity when given an unknown user", async () => {
    const { body } = await request(app)
      .post("/api/articles")
      .send({
        author: "andy",
        title: "The best article",
        body: "The best article content",
        topic: "paper",
      })
      .expect(404);
    expect(body.msg).toBe("Not found");
  });

  test("Status 400: returns bad request when given incorrect keys", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "andy",
        title: "The best article",
        content: "The best article content",
        topic: "paper",
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: returns bad request when given a topic that does not exist", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "butter_bridge",
        title: "The best article",
        body: "The best article content",
        topic: "dogs",
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });

  test("Status 400: returns bad request when given incomplete object", async () => {
    const { body } = await request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "butter_bridge",
        title: "The best article",
        body: "The best article content",
      })
      .expect(400);
    expect(body.msg).toBe("Bad request");
  });
});
