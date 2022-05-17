const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
require("jest-sorted");

const testData = require("../db/data/test-data");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("GET /api/notARoute", () => {
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

describe("GET /api/articles", () => {
  test("Status 200: returns a list of articles", () => {
    return request(app)
      .get(`/api/articles`)
      .expect(200)
      .then(({ body }) => {
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
});
