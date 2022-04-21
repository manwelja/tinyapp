const bcrypt = require('bcryptjs');
const {salt} = require('./variables');

const getUserID = function(req) {
  //If not using parse-cookies
  return (!req.session.userID) ? "" : req.session.userID;
};

//Retrieve the user id associated witth the given email
const getUserIDFromEmail = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key].id;
    }
  }
  return undefined;
};

//Determine if the given email exists
const userEmailExists = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return true;
    }
  }
  return false;
};

//Determines if the password matches hashed password for the given user name
const isPasswordValid = function(id, password, database) {
  if (bcrypt.compareSync(password, database[id].password)) {
    return true;
  }
  return false;
};

//Determines if current user is logged in
const isUserLoggedIn = function(req) {
  if (getUserID(req)  === "") {
    return false;
  }
  return true;
};

//Return an object containing all short/long URLs belonging to the current user
const urlsForUser = function(id, database) {
  let result = {};
  
  for (let key in database) {

    if (database[key].userID === id) {
      result[key] = database[key].longURL;
    }
  }
  return result;
};

//Given a short URL, determines if it exists in the database
const shortURLExists = function(sURL, database) {
  if (database[sURL] === undefined) {
    return false;
  }
  return true;
};

//Function to take in an error code and message and alert the user accordingly
const userError = function(res, returnCode, message) {
  res.status(returnCode);
  const templateVars = { "userID": "", "email": "", "message": message };
  res.render("error_page", templateVars);
  return;
};

//Function to take in a password and returns a hashed password
const hashPassword = function(password) {
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

const generateRandomString = function() {
  //generate a random alpha numeric string, 6 characters long
  //toString with a base of 36 will include 1-9 AND a-z
  return (1 + Math.random().toString(36).substring(2, 7));
};

module.exports = { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid, isUserLoggedIn, urlsForUser, shortURLExists, userError, hashPassword, generateRandomString };