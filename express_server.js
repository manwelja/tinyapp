const express = require("express");
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { users, urlDatabase } = require('./objects');
const { getUserID, getUserIDFromEmail, userEmailExists, isPasswordValid } = require('./helperFunctions');


app.set("view engine", "ejs");

app.get("/", (req,res) => {
  res.send("Hello!");
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
  const uID = getUserIDFromEmail(req.body.email);

  //Return error if user ID doesn't exist
  if (uID === undefined) {
    res.status(403).send('A user with that e-mail cannot be found.');
    return;
  }
  //Make sure the passowrd is valid
  if (!isPasswordValid(uID, req.body.password)) {
    res.status(403).send('Please enter a valid password.');
    return;
  }
  //make sure user exists
  if (!userEmailExists(req.body.email)) {
    res.status(400).send('Please enter a valid email address.');
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
    res.status(400).send('Please enter valid email and password.');
    return;
  }
  if (userEmailExists(req.body.email)) {
    res.status(400).send('Email has already been registered.');
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
  users[uID].password = req.body.password;

  //set a cookie with the user ID
  res.cookie("user_id", uID);
  res.redirect("/urls");
});

//Catch when user clicks on "Create New URL"
app.get("/urls/new", (req, res) => {
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
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");

});

//catch when user clicks on the delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//catch when user clicks on the edit button
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  let uID = '';
  let email = '';
  if (getUserID(req) !== "") {
    uID = getUserID(req);
    email = users[getUserID(req)].email;
  }
  
  const templateVars = { longURL: urlDatabase[shortURL], shortURL: shortURL, "user_id": uID, "email": email  };
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
  const templateVars = { longURL: urlDatabase[shortURL], shortURL: shortURL, "user_id": uID, "email": email  };
  res.render("urls_show", templateVars);
});

//Redirect to the long URL specified by the user
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //need to catch error if page not found
  res.redirect(longURL);
});

//Load main page with contents of URL "Database"
app.get("/urls", (req, res) => {
  let uID = '';
  let email = '';

  if (getUserID(req) !== "") {
    uID = getUserID(req);
    email = users[getUserID(req)].email;
  }
  const templateVars = { urls: urlDatabase, "user_id": uID, "email": email };
  res.render("urls_index", templateVars);
});

//Catch when user Submits a new url
app.post("/urls", (req, res) => {
  const sURL = generateRandomString();
  urlDatabase[sURL] = req.body.longURL;
  res.redirect("/urls/" + sURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
