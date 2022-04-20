const { users } = require("./objects");

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

const userEmailExists = function(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

const isPasswordValid = function(userID, password) {
  if (users[userID].password === password) {
    return true;
  }
  return false;
};

const isUserLoggedIn = function(req) {
  if (getUserID(req)  === "") {
    return false;
  }
  return true;
};

module.exports = { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid, isUserLoggedIn };