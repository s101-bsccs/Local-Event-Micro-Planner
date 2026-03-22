const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function createIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);

  const booksCollection = mongoose.connection.collection('books');
  const existingIndexes = await booksCollection.indexes();
  const legacyTextIndex = existingIndexes.find(
    (index) => index.name === 'title_text_author_text_description_text_tags_text'
  );

  if (legacyTextIndex) {
    await booksCollection.dropIndex(legacyTextIndex.name);
  }

  await booksCollection.createIndex(
    {
      title: 'text',
      author: 'text',
      description: 'text',
      tags: 'text'
    },
    {
      default_language: 'english',
      language_override: 'searchLanguage'
    }
  );
  await booksCollection.createIndex({ author: 1 });
  await booksCollection.createIndex({ genre: 1 });
  await booksCollection.createIndex({ language: 1 });
  await booksCollection.createIndex({ publishYear: -1 });
  await booksCollection.createIndex({ rating: -1 });
  await booksCollection.createIndex({ views: -1 });
  await booksCollection.createIndex({ status: 1 });

  await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
  await mongoose.connection.collection('users').createIndex({ name: 'text' });
  await mongoose.connection.collection('users').createIndex({ role: 1 });
  await mongoose.connection.collection('users').createIndex({ joinedDate: -1 });

  await mongoose.connection.collection('authors').createIndex({ name: 1 }, { unique: true });
  await mongoose.connection.collection('authors').createIndex({ slug: 'text' });
  await mongoose.connection.collection('authors').createIndex({ status: 1 });

  console.log('All indexes created successfully');
}

createIndexes()
  .catch((error) => {
    console.error('Index creation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
