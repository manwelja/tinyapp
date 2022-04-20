const { users, urlDatabase } = require("./objects");

const getUserID = function(req) {
  //If not using parse-cookies
  return (!req.cookies["user_id"]) ? "" : req.cookies["user_id"];
};

//Retrieve the user id associated witth the given email
const getUserIDFromEmail = function(email) {
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

//Determines if the password matches the given user name
const isPasswordValid = function(id, password) {
  if (users[id].password === password) {
    return true;
  }
  return false;
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
module.exports = { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid, isUserLoggedIn, urlsForUser, shortURLExists, userError };