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
  test("Status 200: returns a JSON object representing the endpoints", () => {
    return request(app)
      .get("/api")
      .then(({ type, body }) => {
        expect(body).toEqual(endpoints);
        expect(type).toEqual("application/json");
      });
  });

  test("Status 404: indicates resource has not been found", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found.");
      });
  });
});

describe("GET /api/topics", () => {
  test("Status 200: returns an array of topic objects with a slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect.objectContaining({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Status 200: returns an individual article", () => {
    return request(app)
      .get(`/api/articles/1`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "jonny",
            body: "I find this existence challenging",
            created_at: expect.any(String), // ignore GMT/BST conversion
            votes: 100,
          })
        );
      });
  });

  test("Status 200: returns an individual article with comment count", () => {
    return request(app)
      .get(`/api/articles/1`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "jonny",
            body: "I find this existence challenging",
            created_at: expect.any(String), // ignore GMT/BST conversion
            votes: 100,
            comment_count: 11,
          })
        );
      });
  });

  test("Status 200: returns an article with 0 comments", () => {
    return request(app)
      .get(`/api/articles/2`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe(0);
      });
  });

  test("Status 400: indicates a bad request has been sent", () => {
    return request(app)
      .get("/api/articles/seven")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 404: indicates an id is not found", () => {
    return request(app)
      .get("/api/articles/9000000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("Status 200: updates vote count by a positive value", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 100 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(200);
      });
  });

  test("Status 200: updates vote count by a negative value", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -100 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(0);
      });
  });

  test("Status 400: indicates a bad request when there is an incorrect key in the body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ votes: 100 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: indicates a bad request when the wrong type of value is sent in the body ", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "one" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: indicates a bad request when an incorrect article_id is given", () => {
    return request(app)
      .patch("/api/articles/seven")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 404: indicates an id is not found", () => {
    return request(app)
      .patch("/api/articles/9000000")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("GET /api/users", () => {
  test("Status 200: returns a list of users, including their usernames", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        expect(body.users.every((user) => user.username)).toBe(true);
      });
  });
});

describe("GET /api/users/:username", () => {
  test("Status 200: returns a user with the specified username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual(
          expect.objectContaining({
            username: "butter_bridge",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
            name: "jonny",
          })
        );
      });
  });

  test("Status 404: not found if the user is not present in the database", () => {
    return request(app)
      .get("/api/users/not_in_the_db")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("GET /api/articles", () => {
  test("Status 200: returns a list of articles", () => {
    return request(app)
      .get(`/api/articles`)
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(12);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String), // ignore GMT/BST conversion
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  test("Status 200: returns articles ordered by date, in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSorted({
          key: "created_at",
          descending: true,
        });
      });
  });

  test("Status 200: Kev's bonus test to check the first object against values from the test data", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0]).toEqual({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "sam",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 0,
          comment_count: 2,
        });
      });
  });

  test("Status 200: returns articles sorted by the given query", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSorted({
          key: "comment_count",
          descending: true,
        });
      });
  });

  test("Status 400: only sorts on permitted columns", () => {
    return request(app)
      .get("/api/articles?sort_by=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 200: returns articles in the specified order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSorted({
          key: "created_at",
          descending: false,
        });
      });
  });

  test("Status: 400: only orders on permitted values", () => {
    return request(app)
      .get("/api/articles?order=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 200: returns articles on a given topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(11);
        expect(
          body.articles.every((article) => article.topic === "mitch")
        ).toBe(true);
      });
  });

  test("Status 200: returns empty array when given topic that exists, but has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(0);
      });
  });

  test("Status 404: specified topic does not exist in the db", () => {
    return request(app)
      .get("/api/articles?topic=banana")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });

  test("Status 200: returns correct results for multiple queries", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc&topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(11);
        expect(body.articles).toBeSorted({ key: "votes", descending: false });
      });
  });

  test("Status 400: bad request if using a key that isn't sort_by", () => {
    return request(app)
      .get("/api/articles?sort=comment_count")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: bad request if using incorrect key to order", () => {
    return request(app)
      .get("/api/articles?order_by=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: bad request if using an incorrect key for topics", () => {
    return request(app)
      .get("/api/articles?get_topic=mitch")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: bad request if using a key that isn't permitted", () => {
    return request(app)
      .get("/api/articles?article_id=1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status 200: returns a list of comments for the specified article", () => {
    return request(app)
      .get(`/api/articles/1/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(11);
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
  });

  test("Status 200: returns an empty array if there are no comments for the specified article", () => {
    return request(app)
      .get(`/api/articles/2/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test("Status 400: should indicate bad request if article_id is invalid value not exist", () => {
    return request(app)
      .get("/api/articles/one/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 404: should indicate if an article_id is not found", () => {
    return request(app)
      .get("/api/articles/900000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Status 201: adds a new comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "a test comment",
      })
      .expect(201)
      .then(({ body }) => {
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
  });

  test("Status 404: returns unprocessable entity when given an unknown user", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "andy",
        body: "a test comment",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });

  test("Status 400: returns bad request when given incorrect keys", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "sam",
        body: "a test comment",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: returns bad request when given an incorrect data types", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: 100,
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: returns bad request when given incomplete object", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: returns bad request when given article_id in an invalid format", () => {
    return request(app)
      .post("/api/articles/one/comments")
      .send({
        username: "butter_bridge",
        body: "a test comment",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 404: returns bad request when given an non-existant article_id", () => {
    return request(app)
      .post("/api/articles/90000/comments")
      .send({
        username: "butter_bridge",
        body: "a test comment",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Status 204: removes the specified comment", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("Status 400: returns bad request when sending invalid option for comment_id", () => {
    return request(app)
      .delete("/api/comments/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 404: returns not found when trying to delete a comments that isn't present in the db", () => {
    return request(app)
      .delete("/api/comments/900000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("Status 200: updates vote count by a positive value", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 100 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 116,
            author: "butter_bridge",
            article_id: 9,
            created_at: "2020-04-06T12:17:00.000Z",
          })
        );
      });
  });

  test("Status 200: updates vote count by a negative value", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -16 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toBe(0);
      });
  });

  test("Status 400: indicates a bad request when there is an incorrect key in the body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ votes: 100 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: indicates a bad request when the wrong type of value is sent in the body ", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "one" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: indicates a bad request when an incorrect comment_id is given", () => {
    return request(app)
      .patch("/api/comments/seven")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 404: indicates an id is not found", () => {
    return request(app)
      .patch("/api/comments/9000000")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });
});

describe("POST /api/articles", () => {
  test("Status 201: adds a new article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "butter_bridge",
        title: "The best article",
        body: "The best article content",
        topic: "paper",
      })
      .expect(201)
      .then(({ body }) => {
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
  });

  test("Status 404: returns unprocessable entity when given an unknown user", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "andy",
        title: "The best article",
        body: "The best article content",
        topic: "paper",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found.");
      });
  });

  test("Status 400: returns bad request when given incorrect keys", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "sam",
        body: "a test comment",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: returns bad request when given a topic that does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "andy",
        title: "The best article",
        body: "The best article content",
        topic: "dogs",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });

  test("Status 400: returns bad request when given incomplete object", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "andy",
        title: "The best article",
        body: "The best article content",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.");
      });
  });
});
