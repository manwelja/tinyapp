//temp code to hash hard coded passwords in user object
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xk": {
    longURL: "http://www.google.ca",
    userID: "user2RandomID"
  },
  "9sm5xl": {
    longURL: "http://www.costco.ca",
    userID: "user2RandomID"
  }
};

module.exports = { users, urlDatabase, salt };