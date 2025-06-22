const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: String,
  details: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
