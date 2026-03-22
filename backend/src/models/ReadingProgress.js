const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema(
  {
    page: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    note: String,
    color: {
      type: String,
      default: 'yellow'
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    bookTitle: {
      type: String,
      required: true
    },
    bookAuthor: {
      type: String,
      required: true
    },
    bookCover: String,
    currentPage: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    lastReadDate: {
      type: Date,
      default: Date.now
    },
    completedDate: Date,
    status: {
      type: String,
      enum: ['reading', 'completed', 'abandoned'],
      default: 'reading'
    },
    notes: {
      type: String,
      default: ''
    },
    highlights: {
      type: [highlightSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
