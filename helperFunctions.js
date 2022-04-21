const { users, urlDatabase } = require("./objects");
const bcrypt = require('bcryptjs');

const getUserID = function(req) {
  //If not using parse-cookies
  return (!req.cookies["user_id"]) ? "" : req.cookies["user_id"];
};

//Retrieve the user id associated witth the given email
const getUserIDFromEmail = function(email) {
  console.log(users)
  for (let key in users) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
  return undefined;
};

//Determine if the given email exists
const userEmailExists = function(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

//Determines if the password matches hashed password for the given user name
const isPasswordValid = function(id, password) {
  if (bcrypt.compareSync(password, users[id].password)) {
    return true;
  };
};

//Determines if current useris logged in
const isUserLoggedIn = function(req) {
  if (getUserID(req)  === "") {
    return false;
  }
  return true;
};

//Return an object containing all short/long URLs belonging to the current user
const urlsForUser = function(id) {
  let result = {};
  
  for (let key in urlDatabase) {

    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key].longURL;
    }
  }
  return result;
};

//Given a short URL, determines if it exists in the database
const shortURLExists = function(sURL) {
  if (urlDatabase[sURL] === undefined) {
    return false;
  }
  return true;
};

//Function to take in an error code and message and alert the user accordingly
const userError = function(res, returnCode, message) {
  res.status(returnCode);
  const templateVars = { "user_id": "", "email": "", "message": message };
  res.render("error_page", templateVars);
  return;
};

//Function to take in an error code and message and alert the user accordingly
const hashPassword = function(password) {
  //const password = "purple-monkey-dinosaur"; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
};

//temp code to hash hard coded passwords in user object
users.userRandomID.password = bcrypt.hashSync(users.userRandomID.password);
users.user2RandomID.password = bcrypt.hashSync(users.user2RandomID.password);

module.exports = { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid, isUserLoggedIn, urlsForUser, shortURLExists, userError, hashPassword };