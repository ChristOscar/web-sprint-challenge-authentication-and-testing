const Auth = require('../users/users-model');
const { findBy } = require('../users/users-model');

const checkUsernameAvailable = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next();
  } else {
    const { username } = req.body;
    const userExists = await Auth.findBy({ username });
    if (userExists.length > 0) {
      res.status(401).json({ message: "username taken" });
    } else {
      next();
    }
  }
};

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const check = await findBy({ username }).first();
  if (!check) {
    res.status(401).json({ message: "username taken" });
  } else {
    next();
  }
};

module.exports = {
    checkUsernameAvailable,
    checkUsernameExists
};