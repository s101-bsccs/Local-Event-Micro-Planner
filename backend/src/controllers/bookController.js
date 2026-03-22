const asyncHandler = require('../middleware/asyncHandler');
const Book = require('../models/Book');
const Review = require('../models/Review');
const getRequestUser = require('../utils/requestUser');
const { serializeBook, serializeReview } = require('../utils/serialize');

const TYPE_GENRE_MAP = {
  Novel: ['Novel'],
  Historical: ['Historical'],
  Poetry: ['Poetry'],
  Drama: ['Drama'],
  Beautiful: ['Beautiful'],
  Biography: ['Biography'],
  Travelogue: ['Travelogue']
};

const YEAR_RANGE_MAP = {
  '2020-2024': { $gte: 2020, $lte: 2024 },
  '2010-2019': { $gte: 2010, $lte: 2019 },
  '2000-2009': { $gte: 2000, $lte: 2009 },
  '2000 ago': { $lt: 2000 },
  'before-2000': { $lt: 2000 }
};

async function refreshBookRating(bookId) {
  const [summary] = await Review.aggregate([
    { $match: { bookId } },
    {
      $group: {
        _id: '$bookId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  await Book.findByIdAndUpdate(bookId, {
    rating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    totalRatings: summary ? summary.totalRatings : 0
  });
}

function normalizeSingleValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function buildBookQuery(query) {
  const filters = { status: 'published' };
  const type = normalizeSingleValue(query.type);
  const genre = normalizeSingleValue(query.genre);
  const author = normalizeSingleValue(query.author);
  const language = normalizeSingleValue(query.language);
  const rating = normalizeSingleValue(query.rating);
  const search = normalizeSingleValue(query.search);
  const year = normalizeSingleValue(query.year);
  const yearRange = normalizeSingleValue(query.yearRange);

  if (type && type !== 'all') {
    const mappedGenres = TYPE_GENRE_MAP[type];
    if (mappedGenres) {
      filters.genre = { $in: mappedGenres };
    }
  } else if (genre && genre !== 'all') {
    filters.genre = genre;
  }

  if (author && author !== 'all') {
    filters.author = author;
  }

  if (language && language !== 'all') {
    filters.language = language;
  }

  if (rating && rating !== 'all') {
    const numericRating = Number.parseFloat(String(rating).replace('+', ''));
    filters.rating = { $gte: Number.isFinite(numericRating) ? numericRating : 0 };
  }

  if (search) {
    filters.$or = [
      { title: new RegExp(search, 'i') },
      { titleMarathi: new RegExp(search, 'i') },
      { author: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') }
    ];
  }

  const resolvedYearRange = yearRange && yearRange !== 'all' ? yearRange : year;
  if (resolvedYearRange && resolvedYearRange !== 'all') {
    if (YEAR_RANGE_MAP[resolvedYearRange]) {
      filters.publishYear = YEAR_RANGE_MAP[resolvedYearRange];
    } else if (resolvedYearRange.includes('-')) {
      const [start, end] = resolvedYearRange.split('-').map(Number);
      filters.publishYear = { $gte: start, $lte: end };
    } else {
      filters.publishYear = Number(resolvedYearRange);
    }
  }

  return filters;
}

function buildSort(sortBy) {
  switch (sortBy) {
    case 'newest':
      return { publishYear: -1, createdAt: -1 };
    case 'rating':
      return { rating: -1, totalRatings: -1 };
    case 'title-asc':
      return { title: 1 };
    case 'title-desc':
      return { title: -1 };
    case 'popularity':
      return { views: -1, downloadCount: -1, rating: -1 };
    default:
      return { views: -1, rating: -1 };
  }
}

const getBooks = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 20;
  const filters = buildBookQuery(req.query);
  const sort = buildSort(req.query.sortBy);

  const [books, total] = await Promise.all([
    Book.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(filters)
  ]);

  res.json({
    books: books.map(serializeBook),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  book.views += 1;
  await book.save();

  res.json(serializeBook(book));
});

const getBooksByAuthor = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const books = await Book.find({
    authorId: req.params.authorId,
    status: 'published'
  })
    .sort({ rating: -1 })
    .limit(limit);

  res.json(books.map(serializeBook));
});

const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const user = await getRequestUser(req);
  const preferredGenres = user?.preferences?.favoriteGenres || [];
  const query = preferredGenres.length
    ? { genre: { $in: preferredGenres }, status: 'published' }
    : { status: 'published' };

  const books = await Book.find(query).sort({ rating: -1, views: -1 }).limit(limit);
  res.json(books.map(serializeBook));
});

const getTrendingBooks = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const books = await Book.find({ status: 'published' }).sort({ views: -1, rating: -1 }).limit(limit);
  res.json(books.map(serializeBook));
});

const getNewReleases = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const books = await Book.find({ status: 'published' }).sort({ publishYear: -1, createdAt: -1 }).limit(limit);
  res.json(books.map(serializeBook));
});

const getGenres = asyncHandler(async (req, res) => {
  const genres = await Book.distinct('genre', { status: 'published' });
  res.json(genres.sort());
});

const getCatalogMeta = asyncHandler(async (req, res) => {
  const [authors, languages, totals] = await Promise.all([
    Book.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$author', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1, avgRating: -1, _id: 1 } }
    ]),
    Book.distinct('language', { status: 'published' }),
    Book.aggregate([
      { $match: { status: 'published' } },
      {
        $facet: {
          totalBooks: [{ $count: 'value' }],
          totalAuthors: [{ $group: { _id: '$author' } }, { $count: 'value' }],
          types: [
            { $unwind: '$genre' },
            {
              $match: {
                genre: { $in: Object.keys(TYPE_GENRE_MAP) }
              }
            },
            { $group: { _id: '$genre', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } }
          ]
        }
      }
    ])
  ]);

  const summary = totals[0] || {};

  res.json({
    totalBooks: summary.totalBooks?.[0]?.value || 0,
    totalAuthors: summary.totalAuthors?.[0]?.value || 0,
    types: summary.types || [],
    authors: authors.map((item) => ({
      name: item._id,
      count: item.count,
      avgRating: Number((item.avgRating || 0).toFixed(1))
    })),
    languages: languages.sort(),
    filters: {
      types: Object.keys(TYPE_GENRE_MAP),
      authors: authors.map((item) => item._id),
      languages: languages.sort(),
      yearRanges: ['2020-2024', '2010-2019', '2000-2009', '2000 ago'],
      ratings: ['4+', '3+', '2+'],
      sortOptions: [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'newest', label: 'Newest' },
        { value: 'popularity', label: 'Popularity' },
        { value: 'title-asc', label: 'Title A-Z' }
      ]
    }
  });
});

const getReviews = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const book = await Book.findById(req.params.bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const [reviews, total] = await Promise.all([
    Review.find({ bookId: book._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ bookId: book._id })
  ]);

  res.json({
    reviews: reviews.map(serializeReview),
    total,
    averageRating: book.rating
  });
});

const addReview = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  const user = await getRequestUser(req);

  if (!book || !user) {
    return res.status(404).json({ message: 'Book or user not found' });
  }

  const review = await Review.create({
    bookId: book._id,
    userId: user._id,
    userName: user.name,
    userAvatar: user.avatar,
    rating: req.body.rating,
    comment: req.body.comment
  });

  await refreshBookRating(book._id);
  res.status(201).json(serializeReview(review));
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.rating = req.body.rating ?? review.rating;
  review.comment = req.body.comment ?? review.comment;
  await review.save();
  await refreshBookRating(review.bookId);

  res.json(serializeReview(review));
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  const bookId = review.bookId;
  await review.deleteOne();
  await refreshBookRating(bookId);

  res.json({ message: 'Review deleted' });
});

const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.likes += 1;
  await review.save();

  res.json({ likes: review.likes });
});

const addToFavorites = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const book = await Book.findById(req.params.bookId);

  if (!user || !book) {
    return res.status(404).json({ message: 'Book or user not found' });
  }

  if (!user.favoriteBooks.some((id) => id.toString() === book._id.toString())) {
    user.favoriteBooks.push(book._id);
    await user.save();
  }

  res.json({ message: 'Added to favorites' });
});

const removeFromFavorites = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.favoriteBooks = user.favoriteBooks.filter((id) => id.toString() !== req.params.bookId);
  await user.save();

  res.json({ message: 'Removed from favorites' });
});

const getFavorites = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.json([]);
  }

  const books = await Book.find({ _id: { $in: user.favoriteBooks } });
  res.json(books.map(serializeBook));
});

const addToReadingList = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const book = await Book.findById(req.params.bookId);

  if (!user || !book) {
    return res.status(404).json({ message: 'Book or user not found' });
  }

  if (!user.readingList.some((id) => id.toString() === book._id.toString())) {
    user.readingList.push(book._id);
    await user.save();
  }

  res.json({ message: 'Added to reading list' });
});

const removeFromReadingList = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.readingList = user.readingList.filter((id) => id.toString() !== req.params.bookId);
  await user.save();

  res.json({ message: 'Removed from reading list' });
});

const getReadingList = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.json([]);
  }

  const books = await Book.find({ _id: { $in: user.readingList } });
  res.json(books.map(serializeBook));
});

const rateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const rating = Number(req.body.rating);
  const combined = (book.rating * book.totalRatings) + rating;
  book.totalRatings += 1;
  book.rating = Number((combined / book.totalRatings).toFixed(1));
  await book.save();

  res.json({ rating: book.rating, totalRatings: book.totalRatings });
});

const addBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json(serializeBook(book));
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json(serializeBook(book));
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  await Review.deleteMany({ bookId: book._id });
  await book.deleteOne();

  res.json({ message: 'Book deleted' });
});

module.exports = {
  addBook,
  addReview,
  addToFavorites,
  addToReadingList,
  deleteBook,
  deleteReview,
  getBookById,
  getBooks,
  getBooksByAuthor,
  getCatalogMeta,
  getFavorites,
  getGenres,
  getNewReleases,
  getReadingList,
  getRecommendations,
  getReviews,
  getTrendingBooks,
  likeReview,
  rateBook,
  removeFromFavorites,
  removeFromReadingList,
  updateBook,
  updateReview
};
