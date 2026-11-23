const models = require('../models');
const { FREE_ACTIVE_LIMIT } = require('../limits.js');

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

// username, plan and application cap for the logged in user
const getAccountInfo = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).lean().exec();
    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    return res.json({
      username: account.username,
      isPremium: account.isPremium,
      activeLimit: account.isPremium ? null : FREE_ACTIVE_LIMIT,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving account!' });
  }
};

// check the current password, then store a new hash
const changePassword = (req, res) => {
  const pass = cleanString(req.body.pass);
  const newPass = cleanString(req.body.newPass);
  const newPass2 = cleanString(req.body.newPass2);

  if (!pass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  if (newPass === pass) {
    return res.status(400).json({ error: 'New password must be different!' });
  }

  return Account.authenticate(req.session.account.username, pass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Current password is wrong!' });
    }

    try {
      account.password = await Account.generateHash(newPass);
      await account.save();
      return res.json({ message: 'Password changed!' });
    } catch (saveErr) {
      console.log(saveErr);
      return res.status(500).json({ error: 'An error occured changing password!' });
    }
  });
};

// demo upgrade, flips the premium flag and never touches payment info
const togglePremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();
    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    account.isPremium = !account.isPremium;
    await account.save();
    return res.json({ isPremium: account.isPremium });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured updating plan!' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  getAccountInfo,
  changePassword,
  togglePremium,
};
