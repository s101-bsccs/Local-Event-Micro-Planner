const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/granthmitra';

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_URI;

  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(mongoUri, {
      autoIndex: true
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

module.exports = connectDatabase;
