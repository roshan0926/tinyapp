const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const saltRounds = 10;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "aaa"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
const generateRandomString = () => {
  const stringList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i <= 5; i++) {
    let randomNum = Math.floor(Math.random() * stringList.length);
    let randomLetter = stringList[randomNum];
    randomString += randomLetter;
  }
  return randomString;
};
const urlsForUser = (id) => {
  let filtered = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      filtered[shortURL] = {longURL: urlDatabase[shortURL].longURL};
    }
  }
  return filtered;
};

app.get("/urls/new", (req, res) => {
  let user = '';
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  const templateVars = {user, userId: req.session.user_id};
  res.render("urls_new", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  let user = '';
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[`${shortURL}`];
  const templateVars = {shortURL, longURL, userId: req.session.user_id, user, urls: urlDatabase};
  res.render("urls_show", templateVars);
});
app.get("/urls", (req, res) => {
  let urlObj = urlsForUser(req.session.user_id);
  console.log('urlDatabse', urlDatabase);
  let user = '';
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  const templateVars = { urls: urlObj, userId: req.session.user_id, user};
                        
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/u/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});
app.post('/logout', function(req, res) {
  req.session['user_id'] = null;
  res.redirect('/urls');
});
app.get('/register', (req, res) => {
  let user = null;
  const templateVars = {user};
  res.render('urls_register', templateVars);
});
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Error: your imput field was empty");
  }
  for (const lookup in users) {
    if (req.body.email === users[lookup].email) {
      res.status(400).send("Error: this email adress already has an account");
    }
  }

  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, saltRounds);
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect('/urls');
});
app.get('/login', (req, res) => {
  let user = null;
  const templateVars = {user};
  res.render('urls_login', templateVars);
});
const findUserbyEmail = (email, users) => {
  for (let lookUp in users) {
    if (users[lookUp].email === email) {
      return users[lookUp];
    }
  }
  return undefined;
};
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, saltRounds);
  let user = findUserbyEmail(email, users);
  if (user === undefined) {
    res.status(403).send("Error: this email adress does not have an account");
  } else if (user.password && bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Error: incorrect password");
  }
  console.log(users);
  req.session.user_id = user.id; 
  res.redirect('/urls');
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



