const mongoose = require('mongoose');

const readingGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    achieved: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      enum: ['books', 'pages', 'hours'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ReadingGoal', readingGoalSchema);
