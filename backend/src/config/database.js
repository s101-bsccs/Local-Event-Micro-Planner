const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/local-event-micro-planner';

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_URI;

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  console.log(`MongoDB connected on ${connection.connection.host}`);
  return connection;
}

module.exports = connectDatabase;
