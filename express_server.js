"use strict";
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')

app.disable('x-powered-by');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession( {secret: 'SuperArchiRecontraSecret$%^&^$#(*&Bullshit'} ));
app.use(methodOverride('_method'));

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

// Returns a random string of 6 characters by default, could receive the number
// of characters to return a string of that size.
function generateRandomString(howMany = 6) {
  let rndStr = "";
  const charset = '0123456789ABCDEFGHIJLKNOPQRSTVYXZabcdefghiklmnopqrstvyzx';

  for (let i = 0; i < howMany; i++) {
    const index = getRandomInt(charset.length);
    rndStr += charset.charAt(index);
  }

  return rndStr;
}

// Returns if an email address is already on the database
// to avoid duplicate users
function userEmailAlreadyExists(email) {
  let found = false;
  for (const userKey in users) {
    const user = users[userKey];
    if(user.email === email) {
      found=true;
    }
  }

  return found;
}

// Returns true if the password from the login form
// matches the one in the database, otherwise returns
// false
function userPasswordMatches(password) {
  let found = false;
  for (const userKey in users) {
    const user = users[userKey];
    if(bcrypt.compareSync(password, user.password)) {
      found=true;
    }
  }

  return found;
}

// Returns the user id from the database given
// an email address, otherwise returns an empty string
function userGetUserIDFromEmail(email){
  let user_id = '';
  for (const userKey in users) {
    const user = users[userKey];
    if(user.email === email) {
      user_id=user.id;
    }
  }

  return user_id;
}

// Returns true if a user is the owner of an URL in
// the database
const owns = function userOwnsURL(user_id, urlGiven) {
  let ownsIt = false;
  for (const urlKey in urlDatabase) {
    const url = urlDatabase[urlKey];
    if(user_id === url.userID && urlGiven === url.id) {
      ownsIt=true;
    }
  }

  return ownsIt;  
};

// Returns a object containg all the URLs
// a user  has in the database otherwise
// an empty object
const uURLs = function urlsForUser(user_id) {
  let ownsIt = {};
  for (const urlKey in urlDatabase) {
    const url = urlDatabase[urlKey];
    if(user_id === url.userID) {
      ownsIt[urlKey] = { id: url.id, longURL: url.longURL, userID: url.userID};
    }
  }

  return ownsIt;
};

// The home page, it redirects depending on a user being logged or not. 
app.get("/", (req, res) => {
  if(req.body.user_id === undefined) {
    res.redirect(req.protocol + "://" + req.get('host') + "/login");
  } else {
    res.redirect(req.protocol + "://" + req.get('host') + "/urls");
  }
});

// The form to register as a new user
app.get("/register", (req, res) => {
  res.render("register");
});

// Add a new user to our database.
// Handles cases as email(user) already exists
// or submited form was missing something.
app.post("/register", (req, res) => {
  if(req.body.email === "" || req.body.password === "" ) {
    res.status(400).send('Sorry, you forgot to fill something, please go back and try again!');
  } else if (userEmailAlreadyExists(req.body.email) ) {
    // email already on the database... redirect
    res.status(400).send('Sorry, you are already registered, please go back and use your credentials!');
  } else {
    let userKey = generateRandomString();
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, 10);;
    // Adding an object to an object (note to self)
    let newUser = { 
      id: userKey,
      email: email,
      password: password
    };
    users[userKey] = newUser;

    req.session.user_id = userKey;
    res.redirect(req.protocol + "://" + req.get('host') + "/urls");
  }
});


app.get("/notFound", (req, res) => {
  const user = users[req.session.user_id];  
  res.render("url_notFound", {user: user});
});

// The form to do a login
app.get("/login", (req, res) => {
  res.render("login");
});

// Validates a user login
// sets cookie and/or redirects accordingly
app.post("/login", (req, res) => {
  if (!userEmailAlreadyExists(req.body.email) ) {
    res.redirect(403, req.protocol + "://" + req.get('host') + "/login");
  } else if (userPasswordMatches(req.body.password) ) {
    const user_id = userGetUserIDFromEmail(req.body.email);
    req.session.user_id = user_id;
    res.redirect(req.protocol + "://" + req.get('host') + "/urls");
  } else {
    res.redirect(req.protocol + "://" + req.get('host') + "/login");
  }
});

// Logs out a user destorying the session (GET version)
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Logs out a user destorying the session (POST version)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(req.protocol + "://" + req.get('host') + "/");
});

// Returns the whole database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Show the list of the URLs in the database
// that belong to the user that is currently in session
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user, urls: uURLs(req.session.user_id) };
  res.render("urls_index", templateVars);
});

// 
app.get("/urls/new", (req, res) => {
  if(req.session.user_id === undefined) {
    res.redirect(req.protocol + "://" + req.get('host') + "/login");
  } else {
    const user = users[req.session.user_id];
    let templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
});

// Delete an URL from the database if conditions are met. 
app.delete("/urls/:id/delete", (req, res) => {
  if( urlDatabase[req.params.id] === undefined ) {
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
    if(owns(req.session.user_id, req.params.id)) {
      delete urlDatabase[req.params.id];
      res.redirect(req.protocol + "://" + req.get('host') + "/urls");
    } else {
      res.status(403).send('Sorry, only the owner can delete a URL!');
    }
  }
});

// Edit an URL in the database if conditions are met.
app.put("/urls/:id", (req, res) => {
  if(owns(req.session.user_id, req.params.id)) {
    let longURL = req.body.longURL;
    if( longURL === '') {
      res.status(400).send('Sorry, long URL should not be empty!');
    } else {
      urlDatabase[req.params.id].longURL = longURL;
      res.redirect("/urls");
    }
  } else {
    res.status(403).send('Sorry, only the owner can edit a URL!');
  }
});

// The form to edit an URL
app.get("/urls/:id", (req, res) => {
  if(owns(req.session.user_id, req.params.id)) {
    const user = users[req.session.user_id];
    const templateVars = { user: user, shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Sorry, only the owner can edit a URL!');
  }
});

// Add a new url to the database
app.post("/urls", (req, res) => {
  let objectKey = generateRandomString();
  let longURL = req.body.longURL; // TODO what is we don't have a long url
  let newURL = {id: objectKey, longURL: longURL, userID: req.session.user_id};
  urlDatabase[objectKey] = newURL;
  res.redirect(req.protocol + "://" + req.get('host') + "/urls/" + objectKey);      
});

// Redirects to the long URL corresponding to the short URL given
app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL] === undefined) { // It is not in the database.
    res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
  } else {
      let longURL = urlDatabase[req.params.shortURL].longURL;
      if (longURL === undefined) {
        res.redirect(req.protocol + "://" + req.get('host') + "/notFound");
      } else {
        res.redirect(longURL);
      }
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});
