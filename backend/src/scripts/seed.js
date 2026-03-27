const dotenv = require('dotenv');

dotenv.config();

const connectDatabase = require('../config/database');
const seedDatabase = require('../services/seedDatabase');

async function run() {
  try {
    await connectDatabase();
    await seedDatabase();
    console.log('Seed script completed.');
    process.exit(0);
  } catch (error) {
    console.error(`Seed script failed: ${error.message}`);
    process.exit(1);
  }
}

run();
