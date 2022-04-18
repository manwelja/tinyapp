const express = require("express");
const { generateRandomString } = require('./generateRandomString');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.ca"
};

app.get("/", (req,res) => {
  res.send("Hello!");
});

//Load main page with contents of URL "Database"
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Catch when user Submits a new url
app.post("/urls", (req, res) => {
  const sURL = generateRandomString();
  urlDatabase[sURL] = req.body.longURL;
  res.redirect("/urls/" + sURL);
});

//Catch when user clicks on "Create New URL"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//catch when user clicks on the delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Redirect to the shortened URL specified by the user
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
