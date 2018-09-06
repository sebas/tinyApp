"use strict";
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = { 
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generateRandomString(howMany = 6) {
  let rndStr = "";
  const charset = '0123456789ABCDEFGHIJLKNOPQRSTVYXZabcdefghiklmnopqrstvyzx';

  for (let i = 0; i < howMany; i++) {
    const index = getRandomInt(charset.length);
    rndStr += charset.charAt(index);
  }

  return rndStr;
}

app.get("/", (req, res) => {
  console.log("cookie username", req.body.username);
  if(req.body.username === undefined) {
    console.log("going for the login form");
    res.redirect(req.protocol + "://" + req.get('host') + "/login");
  } else {
    console.log("going for the URLs list");
    res.redirect(req.protocol + "://" + req.get('host') + "/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let userKey = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  // Adding an object to an object
  let newUser = { 
    id: userKey,
    email: email,
    password: password
  };
  users[userKey] = newUser;

  console.log("New users looks like: ", userKey, email, password );
  console.log("Users database: ",  users);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls");
});

app.get("/notFound", (req, res) => {
  res.render("url_notFound");
});

app.get("/login", (req, res) => {
  console.log("login cookie username", req.body.username);
  // TODO we need to validate usename and password
  res.render("login");
});

app.post("/login", (req, res) => {
  console.log("login(post) cookie username", req.body.username);
  res.cookie('username', req.body.username);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(req.protocol + "://" + req.get('host') + "/");
});

app.post("/urls/:id/delete", (req, res) => {
  if( urlDatabase[req.params.id] === undefined ) {
    console.log(req.params.id);
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
    console.log(req.params.id);
    delete urlDatabase[req.params.id];
    console.log(urlDatabase);
    res.redirect(req.protocol + "://" + req.get('host') + "/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  console.log("Updating longURL", longURL);
  urlDatabase[req.params.id] = longURL;
  if( urlDatabase[req.params.id] === undefined ) {
    console.log(req.params.id);
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
    let templateVars = { username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let objectKey = generateRandomString();
  let longURL = req.body.longURL; // TODO what is we don't have a long url
  urlDatabase[objectKey] = longURL;
  console.log("URL database: ",  urlDatabase);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls/" + objectKey);      
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {};
  if( urlDatabase[req.params.id] === undefined ) {
    console.log(req.params.id);
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
    templateVars = { username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    // res.send("oh lordy, why are you like this?  why you do?", req.params.shortURL);
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
    console.log(req.params.shortURL);
    console.log(urlDatabase[req.params.shortURL]);
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});