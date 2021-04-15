const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { generateRandomString,
  urlsForUser,
  findUserbyEmail,
} = require('./helpers');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID1" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID2" }
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
app.get('/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});
app.get("/urls/new", (req, res) => {
  let user = '';
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user, userId: req.session.user_id };
  res.render("urls_new", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const errorMessage = 'Error: this url does not exist.';
    res.status(404).render('urls_error', { user: users[req.session.userID], errorMessage });
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  let user = '';
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, userId: req.session.user_id, user };
  if (!urlDatabase[shortURL]) {
    const errorMessage = 'Error: this url does not exist.';
    res.status(404).render('urls_error', { user, errorMessage });
  }
  const user_id = req.session.user_id;
  const userUrls = urlsForUser(user_id, urlDatabase);
  if (!user_id || !userUrls[shortURL]) {
    const errorMessage = 'You are not authorized to see this URL.';
    res.status(401).render('urls_error', { user, errorMessage });
  }
  res.render("urls_show", templateVars);
});
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  let urlObj = urlsForUser(req.session.user_id, urlDatabase);
  // console.log('urlDatabse', urlDatabase);
  let user = '';
  if (req.session.user_id) {
    user = users[req.session.user_id];
  }
  const templateVars = { urls: urlObj, userId: req.session.user_id, user };
  if (!user_id) {
    res.statusCode = 401;
  }
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    const errorMessage = 'Error: You must be logged in to do that.';
    res.status(401).render('urls_error', { user: users[req.session.userID], errorMessage });
    return;
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  // console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  //
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (req.session.user_id && !req.session.user_id === urlDatabase[shortURL].user_id) {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).render('urls_error', { user: users[req.session.user_id], errorMessage });
  }
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect('/urls');
});
app.post('/logout', function(req, res) {
  req.session['user_id'] = null;
  res.redirect('/urls');
});
app.get('/register', (req, res) => {
  let user = null;
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  const templateVars = { user };
  res.render('urls_register', templateVars);
});
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    const errorMessage = 'Error: your imput field was empty';
    res.status(400).render('urls_error', { user: users[req.session.user_id], errorMessage });
    return;
  }
  for (const lookup in users) {
    if (req.body.email === users[lookup].email) {
      const errorMessage = 'Error: this email adress already has an account';
      res.status(400).render('urls_error', { user: users[req.session.user_id], errorMessage });
      return;
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
  const templateVars = { user };
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.render('urls_login', templateVars);
});
app.post('/login', (req, res) => {
  let testEmail = req.body.email;
  let testPassword = req.body.password;
  let user = findUserbyEmail(testEmail, users);
  console.log(user);
  if (user === undefined) {
    const errorMessage = 'Error: this email adress does not have an account';
    res.status(403).render('urls_error', { user: users[req.session.user_id], errorMessage });
  } else if (user.password && bcrypt.compareSync(testPassword, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else if ((user.password && !bcrypt.compareSync(testPassword, user.password))) {
    const errorMessage = 'Error: incorrect password';
    res.status(403).render('urls_error', { user: users[req.session.user_id], errorMessage });
  }
  // console.log(users);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//test route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



