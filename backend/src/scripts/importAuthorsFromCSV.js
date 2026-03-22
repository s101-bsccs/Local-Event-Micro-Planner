const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const Author = require('../models/Author');
const { parseCSVFile, splitPipeList, printProgress } = require('./utils/csv');

dotenv.config();

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createPlaceholderImage(name) {
  const encoded = encodeURIComponent(name || 'Author');
  return `https://ui-avatars.com/api/?background=8B4513&color=fff&name=${encoded}`;
}

function normalizeAuthor(row) {
  const name = row.name || row.name_marathi || 'Unknown Author';
  const works = splitPipeList(row.famous_works);
  const awards = splitPipeList(row.awards);
  const booksCount = Number.parseInt(row.books_count, 10) || Math.floor(Math.random() * 25) + 1;

  const bio = row.bio || `${name} is a Marathi author featured in the GranthMitra catalog.`;
  const details = [];

  if (row.birthplace) {
    details.push(`Birthplace: ${row.birthplace}`);
  }
  if (works.length) {
    details.push(`Famous works: ${works.join(', ')}`);
  }
  if (awards.length) {
    details.push(`Awards: ${awards.join(', ')}`);
  }

  return {
    name,
    slug: slugify(row.author_id || name),
    image: row.image_url || createPlaceholderImage(name),
    bio: `${bio}${details.length ? ` ${details.join('. ')}.` : ''}`,
    totalBooks: booksCount,
    followers: Math.floor(Math.random() * 20000),
    status: row.status || 'approved'
  };
}

async function importAuthors() {
  const file = getArgValue(
    '--file',
    path.join(__dirname, '..', 'data', 'granthmitra_authors_complete.csv')
  );

  const rows = parseCSVFile(file);
  let added = 0;
  let skipped = 0;
  let errors = 0;
  const batch = [];
  const batchSize = 100;

  if (!rows.length) {
    console.log('No author rows found in CSV.');
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Author.collection.createIndex({ name: 1 }, { unique: true });
  await Author.collection.createIndex({ slug: 1 }, { unique: true });

  console.log(`Connected to MongoDB. Importing ${rows.length} authors from ${file}`);

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    try {
      const normalized = normalizeAuthor(row);
      const existing = await Author.findOne({
        $or: [
          { name: normalized.name },
          { slug: normalized.slug }
        ]
      }).lean();

      if (existing) {
        skipped += 1;
      } else {
        batch.push(normalized);

        if (batch.length >= batchSize) {
          try {
            await Author.insertMany(batch, { ordered: false });
            added += batch.length;
          } catch (error) {
            if (error?.writeErrors?.length) {
              errors += error.writeErrors.length;
              added += batch.length - error.writeErrors.length;
            } else {
              throw error;
            }
          }

          batch.length = 0;
        }
      }
    } catch (error) {
      errors += 1;
      console.error(`\nAuthor import error on row ${index + 2}: ${error.message}`);
    }

    if ((index + 1) % 100 === 0 || index === rows.length - 1) {
      printProgress(index + 1, rows.length, 'Authors');
    }
  }

  if (batch.length) {
    try {
      await Author.insertMany(batch, { ordered: false });
      added += batch.length;
    } catch (error) {
      if (error?.writeErrors?.length) {
        errors += error.writeErrors.length;
        added += batch.length - error.writeErrors.length;
      } else {
        throw error;
      }
    }
  }

  const totalAuthors = await Author.countDocuments();

  console.log('\nAuthor import summary');
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Database total: ${totalAuthors}`);
}

importAuthors()
  .catch((error) => {
    console.error('Author import failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
