const db = require('../data/dbConfig');
const server = require("./server");
const request = require("supertest");
const Jokes = require("./jokes/jokes-data"); 

test('sanity', () => {
  expect(true).toBe(true)
})
beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

const papa = {username: 'Daredevil', password: '1234'}
describe("Users Endpoints", () => {
  beforeEach(async () => {
    await request(server).post("/api/auth/register").send(papa);
  });
  it("User is able to register", async () => {
    let users;
    users = await db("users");
    expect(users).toHaveLength(1);
  });

  it("User is able to login", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Daredevil", password: "1234" });
    expect(res.body.message).toMatch('Welcome back Daredevil');
  });
});

describe("joke endpoint", () => {
  test("jokes restricted before login", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.body.message).toMatch(/token required/i);
  });
  test("jokes allowed after login", async () => {
    await request(server).post("/api/auth/register").send(papa);
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Daredevil", password: "1234" });
    const token = res.body.token;
    const jokes = await request(server)
      .get("/api/jokes")
      .set({ Authorization: token });
    expect(jokes.body[0].joke).toEqual(Jokes[0].joke);
  });
});