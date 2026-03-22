const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { printProgress } = require('./utils/csv');

dotenv.config();

const FIRST_NAMES = [
  'Rajesh', 'Sneha', 'Amol', 'Priya', 'Manohar', 'Sunil', 'Anuradha', 'Vishwas',
  'Milind', 'Shrikant', 'Sandeep', 'Madhuri', 'Nilesh', 'Archana', 'Hemant',
  'Vaishali', 'Prasad', 'Supriya', 'Ganesh', 'Rohini', 'Karthik', 'Asha',
  'Deepak', 'Neha', 'Harshad', 'Tejas', 'Kavya', 'Meera'
];

const LAST_NAMES = [
  'Patil', 'Joshi', 'Deshmukh', 'Shinde', 'Kulkarni', 'Gawde', 'Sonawane', 'Pawar',
  'More', 'Chaudhari', 'Shete', 'Bhosale', 'Mali', 'Jadhav', 'Chavan', 'Nikam',
  'Kulal', 'Rao', 'Iyer', 'Shah', 'Mehta'
];

const CITIES = [
  'Pune', 'Mumbai', 'Nagpur', 'Kolhapur', 'Aurangabad', 'Nashik', 'Sangli',
  'Solapur', 'Bengaluru', 'Hyderabad', 'Chennai', 'Ahmedabad'
];

const GENRES = [
  'कादंबरी', 'ऐतिहासिक', 'कविता', 'नाटक', 'विज्ञान', 'धार्मिक',
  'बालसाहित्य', 'विनोदी', 'लघुकथा', 'चरित्र', 'प्रवासवर्णन', 'तत्त्वज्ञान'
];

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomGenres() {
  const picks = new Set();
  const count = Math.floor(Math.random() * 3) + 1;

  while (picks.size < count) {
    picks.add(randomFrom(GENRES));
  }

  return [...picks];
}

function buildUser(index, passwordHash) {
  const firstName = randomFrom(FIRST_NAMES);
  const lastName = randomFrom(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName}.${lastName}.${Date.now()}${index}@example.com`.toLowerCase();
  const role = Math.random() < 0.08 ? 'moderator' : 'user';
  const daysAgo = Math.floor(Math.random() * 1460);
  const joinedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    name,
    email,
    password: passwordHash,
    role,
    avatar: `https://ui-avatars.com/api/?background=8B4513&color=fff&name=${encodeURIComponent(name)}`,
    joinedDate,
    preferences: {
      favoriteGenres: randomGenres(),
      language: 'marathi',
      emailNotifications: true,
      darkMode: false,
      readingReminders: true
    },
    profileMetadata: {
      location: randomFrom(CITIES),
      age: Math.floor(Math.random() * 53) + 18
    }
  };
}

async function generateUsers() {
  const total = Number.parseInt(getArgValue('--count', '5000'), 10);
  const batchSize = 500;
  let added = 0;
  const passwordHash = await bcrypt.hash('reader123', 10);

  await mongoose.connect(process.env.MONGODB_URI);
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ name: 'text' });
  await User.collection.createIndex({ role: 1 });
  await User.collection.createIndex({ joinedDate: -1 });

  for (let start = 0; start < total; start += batchSize) {
    const batch = [];
    const currentSize = Math.min(batchSize, total - start);

    for (let offset = 0; offset < currentSize; offset += 1) {
      batch.push(buildUser(start + offset, passwordHash));
    }

    await User.insertMany(batch, { ordered: false });
    added += batch.length;
    printProgress(added, total, 'Users');
  }

  console.log(`\nGenerated ${added} sample users. Default password: reader123`);
}

generateUsers()
  .catch((error) => {
    console.error('User generation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
