const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
