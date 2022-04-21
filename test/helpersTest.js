const { assert } = require('chai');
const bcrypt = require('bcryptjs');
const {salt} = require('../variables');
const { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid, urlsForUser, shortURLExists, hashPassword } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
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

describe('#getUserIDFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIDFromEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
});

describe('#getUserID', function() {
  it('should return a valid ID from a cookie', function() {
    const testUser = {session: { userID: "userRandomID" }};
    const user = getUserID(testUser);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
});

describe('#userEmailExists', function() {
  it('should return false if a user email does not exist', function() {
    const expectedResult = userEmailExists("user3@example.com", testUsers);
    assert.equal(expectedResult, false);
  });
  it('should return true if a user email exists', function() {
    const expectedResult = userEmailExists("user@example.com", testUsers);
    assert.equal(expectedResult, true);
  });
});

describe('#isPasswordValid', function() {
  it('should return false if a user\'s password is invalid', function() {
    const expectedResult = isPasswordValid("userRandomID", "purple-monkey-dinosaur123", testUsers);
    assert.equal(expectedResult, false);
  });
});

describe('#urlsForUser', function() {
  it('should return a valid single url belonging to the current user', function() {
    const actualResult = urlsForUser("userRandomID", testDatabase);
    const expectedResult = { "b2xVn2": "http://www.lighthouselabs.ca"};
    assert.deepEqual(actualResult, expectedResult);
  });
  it('should return valid multiple urls belonging to the current user', function() {
    const actualResult = urlsForUser("user2RandomID", testDatabase);
    const expectedResult = { "9sm5xk": "http://www.google.ca", "9sm5xl": "http://www.costco.ca"};
    assert.deepEqual(actualResult, expectedResult);
  });
});

describe('#shortURLExists', function() {
  it('should return false when a short URL exists', function() {
    const expectedResult = shortURLExists("9sm5xlxxx", testDatabase);
    assert.equal(expectedResult, false);
  });
  it('should return true when a short URL exists', function() {
    const expectedResult = shortURLExists("b2xVn2", testDatabase);
    assert.equal(expectedResult, true);
  });
});


describe('#hashPassword', function() {
  it('should return a hash value for the given password', function() {
    const expectedResult = bcrypt.hashSync("purple-monkey-dinosaur", salt);
    const actualResult = hashPassword("purple-monkey-dinosaur");
    assert.equal(expectedResult, actualResult);
  });
});
