const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const seedDatabase = require('./src/services/seedService');

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`GranthMitra backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start backend: ${error.message}`);
    process.exit(1);
  }
}

startServer();
