const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const Book = require('../models/Book');
const { parseCSVFile, printProgress, splitPipeList } = require('./utils/csv');

dotenv.config();

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function normalizeLanguage(value) {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized || normalized === 'मराठी' || normalized === 'marathi') {
    return 'marathi';
  }

  if (normalized === 'english' || normalized === 'इंग्रजी') {
    return 'english';
  }

  return 'marathi';
}

function normalizeBook(row) {
  const formats = splitPipeList(row.format);
  const genre = splitPipeList(row.genre);
  const tags = splitPipeList(row.tags);

  return {
    title: row.title || row.title_marathi || 'Untitled',
    author: row.author || 'Unknown Author',
    authorId: row.author_id || (row.author || 'unknown-author').replace(/\s+/g, '_'),
    description: row.description || 'No description available.',
    longDescription: row.description || 'No description available.',
    coverImage: row.cover_image || 'https://placehold.co/400x600?text=Book',
    genre,
    language: normalizeLanguage(row.language),
    publishYear: Number.parseInt(row.publish_year, 10) || undefined,
    publisher: row.publisher || 'Unknown Publisher',
    pages: Number.parseInt(row.pages, 10) || 100,
    isbn: row.isbn || undefined,
    rating: Number.parseFloat(row.rating) || 0,
    totalRatings: Number.parseInt(row.total_ratings, 10) || 0,
    views: Number.parseInt(row.views, 10) || 0,
    status: row.status || 'published',
    pdfUrl: row.pdf_url || undefined,
    tags,
    downloadCount: Number.parseInt(row.download_count, 10) || 0,
    license: row.license || 'Copyright',
    format: formats[0] || 'Paperback',
    formats,
    price: {
      paperback: Number.parseInt(row.price_paperback, 10) || 0,
      hardcover: Number.parseInt(row.price_hardcover, 10) || 0,
      ebook: Number.parseInt(row.price_ebook, 10) || 0
    },
    addedBy: 'csv-import'
  };
}

async function importBooks() {
  const file = getArgValue(
    '--file',
    path.join(__dirname, '..', 'data', 'granthmitra_books_complete.csv')
  );

  const rows = parseCSVFile(file);
  let added = 0;
  let skipped = 0;
  let errors = 0;

  if (!rows.length) {
    console.log('No book rows found in CSV.');
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB. Importing ${rows.length} books from ${file}`);

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    try {
      const normalized = normalizeBook(row);
      const existing = await Book.findOne({
        title: normalized.title,
        author: normalized.author
      }).lean();

      if (existing) {
        skipped += 1;
      } else {
        await Book.create(normalized);
        added += 1;
      }
    } catch (error) {
      errors += 1;
      console.error(`\nBook import error on row ${index + 2}: ${error.message}`);
    }

    printProgress(index + 1, rows.length, 'Books');
  }

  const totalBooks = await Book.countDocuments();

  console.log('\nBook import summary');
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Database total: ${totalBooks}`);
}

importBooks()
  .catch((error) => {
    console.error('Book import failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
