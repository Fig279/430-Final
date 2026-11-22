const models = require('../models');
const { FREE_ACTIVE_LIMIT } = require('../limits.js');

const { Application, Account } = models;

const LIMIT_MESSAGE = `Free plan is limited to ${FREE_ACTIVE_LIMIT} active applications, upgrade to premium for unlimited`;

// true when a free account already has the max active applications
const isAtFreeLimit = async (ownerId) => {
  const account = await Account.findById(ownerId).lean().exec();
  if (account && account.isPremium) {
    return false;
  }

  // rejected cards do not count toward the cap
  const activeCount = await Application.countDocuments({
    owner: ownerId,
    status: { $ne: 'Rejected' },
  });
  return activeCount >= FREE_ACTIVE_LIMIT;
};

// render the tracker page, react loads the applications
const trackerPage = (req, res) => {
  return res.render('app');
};

// create an application owned by the logged in user
const makeApplication = async (req, res) => {
  const { company, role } = req.body;
  const status = req.body.status || 'Wishlist';
  const owner = req.session.account._id;

  if (!company || !role) {
    return res.status(400).json({ error: 'Company and role are required!' });
  }

  if (!Application.STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status!' });
  }

  try {
    if (status !== 'Rejected' && await isAtFreeLimit(owner)) {
      return res.status(403).json({ error: LIMIT_MESSAGE });
    }

    const newApplication = new Application({
      company,
      role,
      status,
      owner,
    });
    await newApplication.save();
    return res.status(201).json(Application.toAPI(newApplication));
  } catch (err) {
    console.log(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid application data!' });
    }
    return res.status(500).json({ error: 'An error occured adding application!' });
  }
};

// json list of the logged in user's applications
const getApplications = async (req, res) => {
  try {
    // owner in the query so users only see their own cards
    const query = { owner: req.session.account._id };
    const docs = await Application.find(query).sort({ createdDate: 1 }).lean().exec();

    return res.json({ applications: docs.map(Application.toAPI) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving applications!' });
  }
};

// change fields on one application, only fields that were sent
const updateApplication = async (req, res) => {
  const { id, company, role, status, notes } = req.body;
  const owner = req.session.account._id;

  if (!id) {
    return res.status(400).json({ error: 'Application id is required!' });
  }

  if (status !== undefined && !Application.STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status!' });
  }

  try {
    const application = await Application.findOne({ _id: id, owner }).exec();
    if (!application) {
      return res.status(404).json({ error: 'Application not found!' });
    }

    // moving a rejected card back into the pipeline makes it active again
    const reactivating = application.status === 'Rejected' && status && status !== 'Rejected';
    if (reactivating && await isAtFreeLimit(owner)) {
      return res.status(403).json({ error: LIMIT_MESSAGE });
    }

    if (company !== undefined) application.company = company;
    if (role !== undefined) application.role = role;
    if (status !== undefined) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();
    return res.json(Application.toAPI(application));
  } catch (err) {
    console.log(err);
    // bad id format or empty required field
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid application data!' });
    }
    return res.status(500).json({ error: 'An error occured updating application!' });
  }
};

// delete one application, owner in the query so users only delete their own
const deleteApplication = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'Application id is required!' });
  }

  try {
    const query = { _id: req.body.id, owner: req.session.account._id };
    const deleted = await Application.findOneAndDelete(query).lean().exec();

    if (!deleted) {
      return res.status(404).json({ error: 'Application not found!' });
    }
    return res.status(200).json({ message: 'Application deleted!' });
  } catch (err) {
    console.log(err);
    // bad id format fails the cast
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid application id!' });
    }
    return res.status(500).json({ error: 'An error occured deleting application!' });
  }
};

module.exports = {
  trackerPage,
  makeApplication,
  getApplications,
  updateApplication,
  deleteApplication,
};
