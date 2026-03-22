const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?background=8B4513&color=fff&name=Reader'
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    preferences: {
      favoriteGenres: {
        type: [String],
        default: []
      },
      language: {
        type: String,
        default: 'marathi'
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      darkMode: {
        type: Boolean,
        default: false
      },
      readingReminders: {
        type: Boolean,
        default: true
      }
    },
    favoriteBooks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }],
    readingList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }]
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
