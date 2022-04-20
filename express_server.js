const express = require("express");
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.ca"
};

const getUserName = function(req) {
  //return (!req.headers.cookie) ? "" : req.headers.cookie.split("=")[1];
  return (!req.cookies["username"]) ? "" : req.cookies["username"];
};

app.get("/", (req,res) => {
  res.send("Hello!");
});

//Catch errors in the user specified long URL
app.get('/u/undefined', (req, res) => {
  res.send("Custom error landing page.");
});

//catch when user clicks on the login button
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//catch when user logs out - clear their login cookie and redirect
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//Catch when user clicks on "Create New URL"
app.get("/urls/new", (req, res) => {
  const templateVars = { "username": getUserName(req) };
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
  const templateVars = { longURL: urlDatabase[shortURL], shortURL: shortURL, "username": getUserName(req) };
  res.render("urls_show", templateVars);
});


//catch when a shortURL is included in the URL and launch the "show" page for it
app.get("/urls/:shortURL", (req, res) => {
  //get the short URL from the URL string parameter and use it to retrieve the long URL
  const shortURL = req.params.shortURL;
  const templateVars = { longURL: urlDatabase[shortURL], shortURL: shortURL, "username": getUserName(req) };
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
  const templateVars = { urls: urlDatabase, "username": getUserName(req)};
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
