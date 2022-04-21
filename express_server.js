const express = require("express");
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { users, urlDatabase } = require('./objects');
const { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid, isUserLoggedIn, urlsForUser, shortURLExists, userError, hashPassword } = require('./helper');

app.set("view engine", "ejs");

app.get("/", (req,res) => {
  res.redirect("/urls");
});

//catch errors in the user specified long URL
app.get('/u/undefined', (req, res) => {
  res.send("Custom error landing page.");
});

//catch requests for the login page
app.get("/login", (req, res) => {
  let uID = '';
  let email = '';
  const templateVars = { "user_id": uID, "email": email };
  res.render("login", templateVars);
});

//catch when user clicks on the login button - logging in with email address and password
app.post("/login", (req, res) => {
  //get user id from email
  const uID = getUserIDFromEmail(req.body.email, users);

  //Return error if user ID doesn't exist
  if (uID === undefined) {
    const errMessage = 'A user with that e-mail cannot be found.';
    userError(res, 403, errMessage);
    return;
  }
  //Make sure the password is valid
  if (!isPasswordValid(uID, req.body.password, users)) {
    const errMessage = 'Please enter a valid password.';
    userError(res, 403, errMessage);
    return;
  }
  //make sure user exists
  if (!userEmailExists(req.body.email, users)) {
    const errMessage = 'Please enter a valid email address.';
    userError(res, 403, errMessage);
    return;
  }

  if (uID) {
    res.cookie("user_id", uID);
  }
  res.redirect("/urls");
});

//catch when user logs out - clear their login cookie and redirect
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//catch when a user wants to register
app.get('/register', (req, res) => {
  let uID = '';
  let email = '';

  //set uID and email of current user for templateVars if they exist
  if (getUserID(req) !== "" && Object.keys(users).indexOf(getUserID(req)) >= 0) {
    uID = getUserID(req);
    email = users[getUserID(req)].email;
  }
  const templateVars = { "user_id": uID, "email": email };
  res.render("registration", templateVars);
  
});
//catch when a user wants to register
app.post('/register', (req, res) => {
  //check to make sure the user entered an email and password and that the email hasn't already been used
  if (req.body.email === '' || req.body.password === '') {
    //res.status(400).send('Please enter valid email and password.');
    const errMessage = "Please enter a valid email and password.";
    userError(res, 400, errMessage);
    return;
  }
  if (userEmailExists(req.body.email, users)) {
    const errMessage = "The specified email address has already been registered.";
    userError(res, 400, errMessage);
    return;
  }
  let uID;
  //generate a random user ID, is it already exists try again, and again...
  do {
    uID = '';
    uID = generateRandomString();
  } while (users[uID]);
  
  //create a new user in the "database"
  users[uID] = { };
  users[uID].id = uID;
  users[uID].email = req.body.email;
  users[uID].password = hashPassword(req.body.password);

  //set a cookie with the user ID
  res.cookie("user_id", uID);
  res.redirect("/urls");
});

//Catch when user clicks on "Create New URL"
app.get("/urls/new", (req, res) => {
  //make sure a user is logged in before  allowing them to edit
  if (!isUserLoggedIn(req)) {
    const errMessage = "Please <a href='/login'>log in</a> to create new URLs.";
    userError(res, 403, errMessage);
    return;
  }

  let uID = '';
  let email = '';

  if (getUserID(req) !== "") {
    uID = getUserID(req);
    email = users[getUserID(req)].email;
  }
  const templateVars = { "user_id": uID, "email": email  };
  res.render("urls_new", templateVars);
});

//catch when user clicks on the edit button
app.post("/urls/:id", (req, res) => {
  if (!isUserLoggedIn(req)) {
    const errMessage = "Please <a href='/login'>log in</a> to update URLs.";
    userError(res, 403, errMessage);
    return;
  }

  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  urlDatabase[id].userID = getUserID(req);
  res.redirect("/urls");

});

//catch when user clicks on the delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  const uID = getUserID(req);
  const shortURL = req.params.shortURL;
  const errMessage = "You do not have access to delete this URL.  Please <a href='/login'>log in</a> to continue";
  
  if (!isUserLoggedIn(req)) {
    userError(res, 403, errMessage);
    return;
  }
  if (urlDatabase[shortURL].userID === uID) {
    delete urlDatabase[req.params.shortURL];
  } else {
    userError(res, 403, errMessage);
    return;
  }
  res.redirect("/urls");
});

//catch when user clicks on the edit button
app.post("/urls/:shortURL/edit", (req, res) => {
  const errMessage = "You do not have access to edit this URL.  Please <a href='/login'>log in</a> to continue";
  const shortURL = req.params.shortURL;
  let uID = '';
  let email = '';
  if (getUserID(req) !== "") {
    uID = getUserID(req);
    email = users[getUserID(req)].email;
  }

  //return an error message if the user is not logged in, or the specified short url doesn't exist
  if (!isUserLoggedIn(req)) {
    userError(res, 403, errMessage);
    return;
  }
  if (!urlDatabase[shortURL].userID === uID) {
    userError(res, 403, errMessage);
    return;
  }
  const templateVars = { longURL: urlDatabase[shortURL].longURL, shortURL: shortURL, "user_id": uID, "email": email  };
  res.render("urls_show", templateVars);
});

//catch when a shortURL is included in the URL and launch the "show" page for it
app.get("/urls/:shortURL", (req, res) => {
  //get the short URL from the URL string parameter and use it to retrieve the long URL
  const shortURL = req.params.shortURL;
  let uID = '';
  let email = '';
  if (getUserID(req) !== "") {
    uID = getUserID(req);
    email = users[getUserID(req)].email;
  }
  if (!shortURLExists(shortURL, urlDatabase)) {
    const errMessage = "The specified URL does not exist.";
    userError(res, 404, errMessage);
    return;
  }
  const templateVars = { longURL: urlDatabase[shortURL].longURL, shortURL: shortURL, "user_id": uID, "email": email  };
  res.render("urls_show", templateVars);
});

//Redirect to the long URL specified by the user
app.get("/u/:shortURL", (req, res) => {
  try {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    //need to catch error if page not found
    res.redirect(longURL);
  } catch (err) {
    const errMessage = "An error was encountered with the specified URL.";
    userError(res, 404, errMessage);
  }
  return;
});

//Load main page with contents of URL "Database"
app.get("/urls", (req, res) => {
  let uID = '';
  let email = '';
  let errMessage = '';
  let urlDB = '';

  if (!isUserLoggedIn(req)) {
    errMessage = "Please <a href='/login'>log in</a> to see your list of URLs";
    userError(res, 403, errMessage);
    return;
  } else {
    uID = getUserID(req);
    email = users[uID].email;
    urlDB = urlsForUser(uID, urlDatabase);
  }

  const templateVars = { urls: urlDB, "user_id": uID, "email": email, "message": errMessage };
  res.render("urls_index", templateVars);
});

//Catch when user Submits a new url
app.post("/urls", (req, res) => {

  if (!isUserLoggedIn(req)) {
    res.status(404);
    const errMessage = "Please <a href='/login'>log in</a> to add new URLs to the database";
    userError(res, 404, errMessage);
    return;
  }
  const sURL = generateRandomString();
  urlDatabase[sURL] = { };
  urlDatabase[sURL].longURL = req.body.longURL;
  urlDatabase[sURL].userID = getUserID(req);

  res.redirect("/urls/" + sURL);
});

//Redirect to the long URL specified by the user
app.get("/urls/error_page", (req, res) => {
  res.render("error_page");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//temp code to hash hard coded passwords in user object
const bcrypt = require('bcryptjs');
users.userRandomID.password = bcrypt.hashSync(users.userRandomID.password);
users.user2RandomID.password = bcrypt.hashSync(users.user2RandomID.password);