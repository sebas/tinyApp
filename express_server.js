"use strict";
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

let urlDatabase = {
  "7sm5xK":  {
    id: "7sm5xK",
    longURL: "http://www.canada.com",
    userID: "user2RandomID"
  },  
  "8sm5xK":  {
    id: "8sm5xK",
    longURL: "http://www.facebook.com",
    userID: "userRandomID"
  },
  "b2xVn2": {
    id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "user3RandomID"
  },
  "9sm5xK":  {
    id: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user3RandomID"
  }
};

let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "a@s.com", 
    password: "$2b$10$r1Q6HZOa8XTW7VqbpNYoNe5S3y2/mgjCdqbTVabv38nPCWS34qBYG"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "b@s.com", 
    password: "$2b$10$BVBXJdNruKkc3dSpgJs0.Od/sVZXzDTLq/kPI3NY2JrNK5mGbfkA2"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "s@s.com", 
    password: "$2b$10$pXUSDyMv8w9Qy/lP2GLvtuEFfhSiTv0SJDpIfkMwWEFAvr34MsVXC"
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

function userEmailAlreadyExists(email) {
  let found = false;
  for (const userKey in users) {
    const user = users[userKey];
    console.log(`${email} vs ${user.id}: ${user.email} - ${user.password} loop`);
    if(user.email === email) {
      console.log(`True ${email} - ${user.email} all`);
      found=true;
    }
  }

  return found;
}

function userPasswordMatches(password) {
  let found = false;
  for (const userKey in users) {
    const user = users[userKey];
    console.log(`${password} vs ${user.id}: ${user.email} - ${user.password} loop`);
    // bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)
    if(bcrypt.compareSync(password, user.password)) {
      found=true;
    }
  }

  return found;
}

function userGetUserIDFromEmail(email){
  let user_id = '';
  for (const userKey in users) {
    const user = users[userKey];
    console.log(`${email} vs ${user.id}: ${user.email} - ${user.password} loop`);
    if(user.email === email) {
      console.log(`True ${email} - ${user.email} all`);
      user_id=user.id;
    }
  }

  return user_id;
}

const owns = function userOwnsURL(user_id, urlGiven) {
  let ownsIt = false;
  for (const urlKey in urlDatabase) {
    const url = urlDatabase[urlKey];
    console.log(`${user_id} vs ${urlGiven}: ${url.id} - ${url.longURL} loop`);
    if(user_id === url.userID && urlGiven === url.id) {
      console.log(`True ${user_id} - ${url.userID} and ${urlGiven} - ${url.id} all`);
      ownsIt=true;
    }
  }

  return ownsIt;  
};

const uURLs = function urlsForUser(user_id) {
  let ownsIt = {};
  for (const urlKey in urlDatabase) {
    const url = urlDatabase[urlKey];
    console.log(`${user_id} loop`);
    if(user_id === url.userID) {
      console.log(`True ${user_id} - ${url.userID} all`);
      ownsIt[urlKey] = { id: url.id, longURL: url.longURL, userID: url.userID};
    }
  }

  console.log(`${ownsIt} return`);
  console.log(ownsIt);
  return ownsIt;
};

// The home page, it redirects depending on a user being logged or not. 
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

// The form to register as a new user
app.get("/register", (req, res) => {
  res.render("register");
});

// Add a new user to our database.
app.post("/register", (req, res) => {
  console.log(`${req.body.email} - ${req.body.password} register post`);
  if(req.body.email === "" || req.body.password === "" ) {
    console.log("empty something... redirecting back");
    res.status(400).send('Sorry, you forgot to fill something, please go back and try again!');
  } else if (userEmailAlreadyExists(req.body.email) ) {
    // email already on the database... redirect
    res.status(400).send('Sorry, you are already registered, please go back and use your credentials!');
  } else {
    let userKey = generateRandomString();
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, 10);;
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
  }
});

app.get("/notFound", (req, res) => {
  const user = users[req.cookies.user_id];  
  res.render("url_notFound", {user: user});
});

app.get("/login", (req, res) => {
  console.log("login cookie user_id", req.body.user_id);
  res.render("login");
});

app.post("/login", (req, res) => {
  if (!userEmailAlreadyExists(req.body.email) ) {
    res.redirect(403, req.protocol + "://" + req.get('host') + "/login");
  } else if (userPasswordMatches(req.body.password) ) {
    const user_id = userGetUserIDFromEmail(req.body.email);
    console.log("login(post) cookie user_id and user_id", req.body.user_id, user_id);
    res.cookie('user_id', user_id);
    res.redirect(req.protocol + "://" + req.get('host') + "/urls");
  } else {
    res.redirect(req.protocol + "://" + req.get('host') + "/login");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(req.protocol + "://" + req.get('host') + "/");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  console.log('user', user);
  const templateVars = { user: user, urls: uURLs(req.cookies.user_id) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log('user_id', req.cookies.user_id);
  if(req.cookies.user_id === undefined) {
    console.log("going for the login form");
    res.redirect(req.protocol + "://" + req.get('host') + "/login");
  } else {
    const user = users[req.cookies.user_id];
    let templateVars = { user: user };
    console.log('id and user', req.cookies.user_id, user);
    res.render("urls_new", templateVars);
  }
});

// Delete an URL from the database if conditions are met. 
app.post("/urls/:id/delete", (req, res) => {
  if( urlDatabase[req.params.id] === undefined ) {
    console.log(req.params.id);
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
    if(owns(req.cookies.user_id, req.params.id)) {
      console.log(req.params.id);
      delete urlDatabase[req.params.id];
      console.log(urlDatabase);
      res.redirect(req.protocol + "://" + req.get('host') + "/urls");
    } else {
      res.status(403).send('Sorry, only the owner can delete a URL!');
    }
  }
});

// Edit an URL in the database if conditions are met.
app.post("/urls/:id", (req, res) => {
  if(owns(req.cookies.user_id, req.params.id)) {
    let longURL = req.body.longURL;
    if( longURL === '') {
      res.status(400).send('Sorry, long URL should not be empty!');
    } else {
      console.log("Updating longURL", longURL);
      urlDatabase[req.params.id].longURL = longURL;
      res.redirect("/urls");
    }
  } else {
    res.status(403).send('Sorry, only the owner can edit a URL!');
  }
});

app.get("/urls/:id", (req, res) => {
  if(owns(req.cookies.user_id, req.params.id)) {
    const user = users[req.cookies.user_id];
    const templateVars = { user: user, shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Sorry, only the owner can edit a URL!');
  }
});

app.post("/urls", (req, res) => {
  // Add a new url to the database
  console.log("Add a new url to the database");
  let objectKey = generateRandomString();
  let longURL = req.body.longURL; // TODO what is we don't have a long url
  let newURL = {id: objectKey, longURL: longURL, userID: req.cookies.user_id};
  urlDatabase[objectKey] = newURL;
  console.log("URL database: ",  urlDatabase);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls/" + objectKey);      
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
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
