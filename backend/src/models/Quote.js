const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    bookId: String,
    bookTitle: String,
    category: String,
    tags: {
      type: [String],
      default: []
    },
    likes: {
      type: Number,
      default: 0
    },
    language: {
      type: String,
      enum: ['marathi', 'hindi', 'english'],
      default: 'marathi'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quote', quoteSchema);
