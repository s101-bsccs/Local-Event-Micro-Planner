const Book = require('../models/Book');
const Author = require('../models/Author');
const User = require('../models/User');
const Review = require('../models/Review');

function getStartOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function getRecentActivityDate(user) {
  return user.updatedAt || user.joinedDate || user.createdAt || new Date(0);
}

function toUserStatus(user) {
  const recentThreshold = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  return getRecentActivityDate(user) >= recentThreshold ? 'active' : 'pending';
}

async function getAdminSummary(req, res) {
  try {
    const startOfToday = getStartOfToday();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalBooks,
      totalAuthors,
      totalReviews,
      newUsersToday,
      newBooksToday,
      pendingReviews,
      pendingBooks,
      pendingAuthors,
      activeUsers,
      recentUsers,
      recentBooks,
      recentAuthors,
      recentReviews,
      userGrowth,
      genreDistribution
    ] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Author.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ joinedDate: { $gte: startOfToday } }),
      Book.countDocuments({ createdAt: { $gte: startOfToday } }),
      Review.countDocuments({ status: 'pending' }),
      Book.countDocuments({ status: 'pending' }),
      Author.countDocuments({ status: 'pending' }),
      User.countDocuments({
        $or: [
          { updatedAt: { $gte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) } },
          { joinedDate: { $gte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) } }
        ]
      }),
      User.find()
        .sort({ joinedDate: -1, createdAt: -1 })
        .limit(25)
        .lean(),
      Book.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .lean(),
      Author.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .lean(),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .lean(),
      User.aggregate([
        { $match: { joinedDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$joinedDate' },
              month: { $month: '$joinedDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Book.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$genre' },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
    const monthBuckets = [];
    for (let index = 5; index >= 0; index -= 1) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - index);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;
      const found = userGrowth.find((item) => item._id.year === year && item._id.month === month);

      monthBuckets.push({
        label: monthFormatter.format(monthDate),
        count: found ? found.count : 0
      });
    }

    const totalGenreBooks = genreDistribution.reduce((sum, item) => sum + item.count, 0) || 1;

    res.json({
      stats: {
        totalUsers,
        totalBooks,
        totalAuthors,
        totalReviews,
        newUsersToday,
        newBooksToday,
        activeUsers,
        pendingReviews,
        pendingApprovals: pendingBooks + pendingAuthors
      },
      userGrowth: {
        labels: monthBuckets.map((item) => item.label),
        data: monthBuckets.map((item) => item.count)
      },
      bookCategories: {
        labels: genreDistribution.map((item) => item._id),
        data: genreDistribution.map((item) => Math.round((item.count / totalGenreBooks) * 100))
      },
      users: recentUsers.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: toUserStatus(user),
        joinedDate: (user.joinedDate || user.createdAt || new Date()).toISOString().slice(0, 10),
        lastActive: getRecentActivityDate(user).toISOString().slice(0, 10),
        booksRead: 0,
        reviews: 0
      })),
      books: recentBooks.map((book) => ({
        id: book._id.toString(),
        title: book.title,
        author: book.author,
        genre: book.genre || [],
        language: book.language || 'marathi',
        status: book.status,
        addedBy: book.addedBy || 'system',
        addedDate: (book.createdAt || new Date()).toISOString().slice(0, 10),
        publishYear: book.publishYear || new Date().getFullYear(),
        views: book.views || 0,
        ratings: book.rating || 0
      })),
      authors: recentAuthors.map((author) => ({
        id: author._id.toString(),
        name: author.name,
        image: author.image,
        booksCount: author.totalBooks || 0,
        status: author.status,
        addedBy: 'system',
        addedDate: (author.createdAt || new Date()).toISOString().slice(0, 10),
        bio: author.bio || ''
      })),
      reviews: recentReviews.map((review) => ({
        id: review._id.toString(),
        userName: review.userName,
        bookTitle: review.bookTitle || 'Book Review',
        rating: review.rating,
        comment: review.comment,
        date: (review.createdAt || new Date()).toISOString().slice(0, 10),
        status: review.status
      })),
      reports: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAdminSummary
};
