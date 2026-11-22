const mongoose = require('mongoose');
const _ = require('underscore');

// pipeline columns, order matters for the board
const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

// escape and trim text before storing
const cleanText = (text) => _.escape(text).trim();

// contact person tied to one application
const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: cleanText,
  },
  title: {
    type: String,
    trim: true,
    default: '',
    set: cleanText,
  },
  email: {
    type: String,
    trim: true,
    default: '',
    set: cleanText,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    set: cleanText,
  },
});

// one job application card, owner keeps it private to that account
const ApplicationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    set: cleanText,
  },
  role: {
    type: String,
    required: true,
    trim: true,
    set: cleanText,
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'Wishlist',
    required: true,
  },
  // position inside its column for drag and drop
  order: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
    set: cleanText,
  },
  contacts: {
    type: [ContactSchema],
    default: [],
  },
  appliedDate: {
    type: Date,
  },
  followUpDate: {
    type: Date,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// board queries filter by owner and status
ApplicationSchema.index({ owner: 1, status: 1, order: 1 });

ApplicationSchema.statics.STATUSES = STATUSES;

// only the fields the client needs
ApplicationSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  company: doc.company,
  role: doc.role,
  status: doc.status,
  order: doc.order,
  notes: doc.notes,
  contacts: doc.contacts,
  appliedDate: doc.appliedDate,
  followUpDate: doc.followUpDate,
  createdDate: doc.createdDate,
});

const ApplicationModel = mongoose.model('Application', ApplicationSchema);
module.exports = ApplicationModel;
