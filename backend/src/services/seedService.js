const Author = require('../models/Author');
const Book = require('../models/Book');
const Quote = require('../models/Quote');
const ReadingGoal = require('../models/ReadingGoal');
const ReadingProgress = require('../models/ReadingProgress');
const Review = require('../models/Review');
const User = require('../models/User');
const { authors, books, quotes, users } = require('../data/seedData');

async function seedDatabase() {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    return;
  }

  const createdUsers = await User.insertMany(users);
  await Author.insertMany(authors);
  const createdBooks = await Book.insertMany(books);
  await Quote.insertMany(
    quotes.map((quote, index) => ({
      ...quote,
      bookId: createdBooks[index] ? createdBooks[index]._id.toString() : undefined
    }))
  );

  const primaryUser = createdUsers[1] || createdUsers[0];
  const mainBook = createdBooks[0];

  if (primaryUser && mainBook) {
    primaryUser.favoriteBooks = [mainBook._id];
    primaryUser.readingList = [mainBook._id];
    await primaryUser.save();

    await ReadingProgress.create({
      userId: primaryUser._id,
      bookId: mainBook._id,
      bookTitle: mainBook.title,
      bookAuthor: mainBook.author,
      bookCover: mainBook.coverImage,
      currentPage: 250,
      totalPages: mainBook.pages,
      status: 'reading',
      notes: 'Strong start with memorable character work.',
      highlights: [
        {
          page: 44,
          text: 'A turning point worth revisiting.',
          note: 'Need to reference this in review.',
          color: 'yellow'
        }
      ]
    });

    await ReadingGoal.create([
      {
        userId: primaryUser._id,
        title: 'Read 12 books this year',
        target: 12,
        achieved: 4,
        unit: 'books',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active'
      },
      {
        userId: primaryUser._id,
        title: 'Read 3000 pages',
        target: 3000,
        achieved: 980,
        unit: 'pages',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active'
      }
    ]);

    await Review.create([
      {
        bookId: mainBook._id,
        userId: primaryUser._id,
        userName: primaryUser.name,
        userAvatar: primaryUser.avatar,
        rating: 5,
        comment: 'Strong storytelling and memorable characters.',
        likes: 24,
        status: 'approved'
      },
      {
        bookId: mainBook._id,
        userId: createdUsers[0]._id,
        userName: createdUsers[0].name,
        userAvatar: createdUsers[0].avatar,
        rating: 4,
        comment: 'Very engaging read with emotional depth.',
        likes: 18,
        status: 'approved'
      }
    ]);
  }
}

module.exports = seedDatabase;
