
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

const urlsForUser = (id, urlDatabase) => {
  let filtered = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      filtered[shortURL] = {longURL: urlDatabase[shortURL].longURL};
    }
  }
  return filtered;
};

const findUserbyEmail = (email, users) => {
  for (let lookUp in users) {
    if (users[lookUp].email === email) {
      return users[lookUp];
    }
  }
  return undefined;
};


module.exports = {generateRandomString, 
                  urlsForUser,
                  findUserbyEmail,
                  }