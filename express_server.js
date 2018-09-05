"use strict";
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {

  let objectKey = generateRandomString();
  let longURL = req.body.longURL; // TODO what is we dont have a long url
  urlDatabase[objectKey] = longURL;
  console.log("base: ",  );
  console.log(urlDatabase);
  res.redirect(req.protocol + "://" + req.get('host') + "/urls/" + objectKey);      
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {};
  if( urlDatabase[req.params.id] === undefined ) {
    console.log(req.params.id);
    console.log(urlDatabase[req.params.id]);
    templateVars = { shortURL: "Not found", longURL: "Not found" };
    templateVars = { error: "URL was not found" };
  } else {
    console.log(req.params.id);
    console.log(urlDatabase[req.params.id]);
    templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send("oh lordy, why are you like this?  why you do?", req.params.shortURL);
  } else {
    console.log(req.params.shortURL);
    console.log(urlDatabase[req.params.shortURL]);
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});