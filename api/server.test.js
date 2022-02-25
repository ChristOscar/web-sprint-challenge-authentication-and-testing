const db = require('../data/dbConfig');
const server = require("./server");
const request = require("supertest");
const Jokes = require("./jokes/jokes-data"); 
const Users = require('./users/users-model');

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

describe('Testing Users Model', () => {
  it('can find a user by id', async() => {
    await db('users').insert({username: 'Warewolf', password: '1234'});
    await db('users').insert({username: 'Spiderman ', password: '12345'});
    await db('users').insert({username: 'Energizer', password: '123456'});
    let result = await Users.findById(1);
    expect(result.username).toBe('Warewolf');
  });
  it('can find a user by username', async() => {
    await db('users').insert({username: 'Warewolf', password: '1234'});
    await db('users').insert({username: 'Spiderman', password: '12345'});
    await db('users').insert({username: 'Energizer', password: '123456'});
    let [result] = await Users.findBy({username: 'Energizer'});
    expect(result.username).toBe('Energizer');
  });
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

describe("Joke Endpoints", () => {
  it("jokes restricted before login", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token required/i);
    
  });
  it("jokes allowed after login", async () => {
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

describe('[POST] /api/auth/login', () => {
  test('responds with correct status and message on invalid credentials', async() => {
    let result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'Captain Marvel', password: 'foobar' });
    expect(result.status).toBe(401);
    expect(result.body.message).toMatch(/invalid credentials/i);
  });

  test('responds with correct status and message on valid credentials', async() => {
    let result = await request(server)
      .post('/api/auth/register')
      .send(papa);
    result = await request(server)
      .post('/api/auth/login')
      .send(papa);
    expect(result.status).toBe(200);
    expect(result.body.message).toMatch('Welcome back Daredevil');
  });
});

describe('[POST] /api/auth/register', () => {
  test('responds with the correct status and user is added to database', async() => {
    let result = await request(server)
      .post('/api/auth/register')
      .send(papa);
    expect(result.status).toBe(201);
    result = await Users.findById(1);
    expect(result.username).toBe('Daredevil');
  });

  test('responds with the correct status and message without username', async() => {
    let result = await request(server)
      .post('/api/auth/register')
      .send({ password: 'foobar' });
    expect(result.status).toBe(400);
    expect(result.body.message).toMatch('username and password are required');
  });
});