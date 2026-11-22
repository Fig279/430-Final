const models = require('../models');

const Application = models.Application;

// render the tracker page, react loads the applications
const trackerPage = (req, res) => {
  return res.render('app');
};

// create an application owned by the logged in user
const makeApplication = async (req, res) => {
  const { company, role } = req.body;
  const status = req.body.status || 'Wishlist';

  if (!company || !role) {
    return res.status(400).json({ error: 'Company and role are required!' });
  }

  if (!Application.STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status!' });
  }

  try {
    const newApplication = new Application({
      company,
      role,
      status,
      owner: req.session.account._id,
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
  deleteApplication,
};
