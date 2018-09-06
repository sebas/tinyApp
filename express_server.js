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
  console.log("cookie user_id", req.body.user_id);
  if(req.body.user_id === undefined) {
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
  const user = users[req.cookies.user_id];
  console.log('user', user);
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user: user };
  console.log('id and user', req.cookies.user_id, user);
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
  res.cookie('user_id', userKey);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls");
});

app.get("/notFound", (req, res) => {
  res.render("url_notFound");
});

app.get("/login", (req, res) => {
  console.log("login cookie user_id", req.body.user_id);
  // TODO we need to validate usename and password
  res.render("login");
});

app.post("/login", (req, res) => {
  console.log("login(post) cookie user_id", req.body.user_id);
  res.cookie('user_id', req.body.user_id);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
    const user = users[req.cookies.user_id];
    const templateVars = { user: user, shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
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
    const user = users[req.cookies.user_id];
    templateVars = { user: user, shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
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