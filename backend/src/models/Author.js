const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    image: String,
    bio: {
      type: String,
      default: ''
    },
    totalBooks: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Author', authorSchema);
