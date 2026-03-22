const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const realBooksData = require('../data/realBooksData');

dotenv.config();

async function initDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/granthmitra';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Book.deleteMany({});
    console.log('Cleared existing books');

    const inserted = await Book.insertMany(
      realBooksData.map((book) => ({
        status: 'published',
        addedBy: 'showcase-script',
        ...book
      }))
    );

    console.log(`Added ${inserted.length} showcase books`);

    const typeSummary = inserted.reduce((acc, book) => {
      book.genre.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    console.log('Books by type:');
    Object.entries(typeSummary).forEach(([genre, count]) => {
      console.log(`- ${genre}: ${count}`);
    });

    const languageSummary = inserted.reduce((acc, book) => {
      acc[book.language] = (acc[book.language] || 0) + 1;
      return acc;
    }, {});

    console.log('Books by language:');
    Object.entries(languageSummary).forEach(([language, count]) => {
      console.log(`- ${language}: ${count}`);
    });
  } catch (error) {
    console.error('Failed to initialize showcase books:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

initDatabase();
