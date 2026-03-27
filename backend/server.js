const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const seedDatabase = require('./src/services/seedDatabase');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();

    if ((process.env.SEED_ON_START || 'true').toLowerCase() === 'true') {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`Local Event Micro-Planner API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
