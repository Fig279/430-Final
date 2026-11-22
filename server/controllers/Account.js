const models = require('../models');

const Account = models.Account;

// missing fields become empty strings instead of the text "undefined"
const cleanString = (value) => (value ? `${value}`.trim() : '');

// Render the login page.
const loginPage = (req, res) => {
  return res.render('login');
};

// Destroy the session and send the user back to the login page.
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Check the login info and, if it is valid, store the account in the session.
const login = (req, res) => {
  const username = cleanString(req.body.username);
  const pass = cleanString(req.body.pass);

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/tracker' });
  });
};

// Validate the signup info, hash the password, save the account, and log the user in.
const signup = async (req, res) => {
  const username = cleanString(req.body.username);
  const pass = cleanString(req.body.pass);
  const pass2 = cleanString(req.body.pass2);

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/tracker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Username must be 1-16 letters, numbers, _ - or .' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
};
