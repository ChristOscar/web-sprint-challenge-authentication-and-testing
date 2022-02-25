const db = require('../data/dbConfig');

test('sanity', () => {
  expect(false).toBe(false)
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

