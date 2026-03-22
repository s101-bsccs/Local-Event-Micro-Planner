const Book = require('../models/Book');
const User = require('../models/User');

async function getDashboardStats(req, res) {
  try {
    const [totalBooks, totalUsers, authorCount, genres, booksWithPDF, activeUsers] = await Promise.all([
      Book.countDocuments({ status: 'published' }),
      User.countDocuments(),
      Book.distinct('author', { status: 'published' }),
      Book.distinct('genre', { status: 'published' }),
      Book.countDocuments({ status: 'published', pdfUrl: { $exists: true, $ne: null } }),
      User.countDocuments({
        $or: [
          { updatedAt: { $gte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) } },
          { joinedDate: { $gte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) } }
        ]
      })
    ]);

    res.json({
      totalBooks,
      totalAuthors: authorCount.length,
      totalUsers,
      totalGenres: genres.length,
      booksWithPDF,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getGenreDistribution(req, res) {
  try {
    const distribution = await Book.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getTopAuthors(req, res) {
  try {
    const topAuthors = await Book.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1, avgRating: -1 } },
      { $limit: 20 }
    ]);

    res.json(topAuthors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getDashboardStats,
  getGenreDistribution,
  getTopAuthors
};
