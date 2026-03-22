const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    hardcover: Number,
    paperback: Number,
    ebook: Number,
    audiobook: Number
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    titleMarathi: {
      type: String,
      trim: true,
      default: ''
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    authorId: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    longDescription: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: 'assets/books/default-book-cover.jpg'
    },
    coverThumbnail: {
      type: String,
      default: 'assets/books/default-book-cover-thumb.jpg'
    },
    coverColor: {
      type: String,
      default: '#8B4513'
    },
    rating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    genre: {
      type: [String],
      default: []
    },
    publishYear: Number,
    publisher: String,
    language: {
      type: String,
      default: 'marathi'
    },
    pages: {
      type: Number,
      required: true
    },
    isbn: String,
    isbn10: String,
    edition: String,
    awards: {
      type: [String],
      default: []
    },
    formats: {
      type: [String],
      default: []
    },
    price: {
      type: priceSchema,
      default: () => ({})
    },
    availability: {
      type: String,
      default: 'In Stock'
    },
    format: String,
    tags: {
      type: [String],
      default: []
    },
    pdfUrl: String,
    pdfLocalPath: String,
    downloadCount: {
      type: Number,
      default: 0
    },
    source: String,
    license: String,
    views: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['published', 'pending', 'rejected', 'draft', 'archived'],
      default: 'published'
    },
    addedBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

bookSchema.index(
  { title: 'text', author: 'text', description: 'text', tags: 'text' },
  { default_language: 'english', language_override: 'searchLanguage' }
);

module.exports = mongoose.model('Book', bookSchema);
