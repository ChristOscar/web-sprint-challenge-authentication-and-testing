const db = require("../../data/dbConfig");
module.exports = { find, findBy, findById, add };
function find() {
  return db("users").select("id", "username");
}
function findBy(filter) {
  return db("users").where(filter).select("id", "username", "password");
}
function findById(id) {
  return db("users").select("id", "username").where({ id }).first();
}
async function add(user) {
  const [id] = await db("users").insert(user);
  return findById(id);
}
