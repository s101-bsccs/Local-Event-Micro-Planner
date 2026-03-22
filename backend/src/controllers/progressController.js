const asyncHandler = require('../middleware/asyncHandler');
const Book = require('../models/Book');
const ReadingGoal = require('../models/ReadingGoal');
const ReadingProgress = require('../models/ReadingProgress');
const getRequestUser = require('../utils/requestUser');
const { serializeGoal, serializeProgress } = require('../utils/serialize');

const sampleChallenges = [
  {
    id: 'spring-reading-marathon',
    title: 'Spring Reading Marathon',
    description: 'Finish 2 books this month.',
    target: 2,
    unit: 'books'
  },
  {
    id: 'page-power-500',
    title: 'Page Power 500',
    description: 'Read 500 pages in the next 30 days.',
    target: 500,
    unit: 'pages'
  }
];

async function getUserProgress(req) {
  const user = await getRequestUser(req);
  return user
    ? ReadingProgress.find({ userId: user._id }).sort({ lastReadDate: -1 })
    : [];
}

const getCurrentReadings = asyncHandler(async (req, res) => {
  const progress = await getUserProgress(req);
  res.json(progress.filter((item) => item.status === 'reading').map(serializeProgress));
});

const getReadingProgress = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const progress = await ReadingProgress.findOne({
    userId: user._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  res.json(serializeProgress(progress));
});

const startReading = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const book = await Book.findById(req.body.bookId);

  if (!user || !book) {
    return res.status(404).json({ message: 'Book or user not found' });
  }

  const progress = await ReadingProgress.findOneAndUpdate(
    { userId: user._id, bookId: book._id },
    {
      userId: user._id,
      bookId: book._id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverImage,
      totalPages: req.body.totalPages || book.pages,
      status: 'reading',
      lastReadDate: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(serializeProgress(progress));
});

const updateProgress = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const progress = await ReadingProgress.findOne({
    userId: user._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  progress.currentPage = Number(req.body.currentPage) || progress.currentPage;
  progress.lastReadDate = new Date();
  if (progress.currentPage >= progress.totalPages) {
    progress.status = 'completed';
    progress.completedDate = new Date();
  }

  await progress.save();
  res.json(serializeProgress(progress));
});

const markAsCompleted = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  progress.currentPage = progress.totalPages;
  progress.status = 'completed';
  progress.completedDate = new Date();
  progress.lastReadDate = new Date();
  await progress.save();

  res.json(serializeProgress(progress));
});

const abandonBook = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  progress.status = 'abandoned';
  progress.lastReadDate = new Date();
  await progress.save();

  res.json(serializeProgress(progress));
});

const deleteProgress = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  await ReadingProgress.findOneAndDelete({
    userId: user?._id,
    bookId: req.params.bookId
  });

  res.json({ message: 'Reading progress deleted' });
});

const getHighlights = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  res.json(
    (progress?.highlights || []).map((highlight) => ({
      id: highlight._id.toString(),
      page: highlight.page,
      text: highlight.text,
      note: highlight.note,
      color: highlight.color,
      date: highlight.date.toISOString()
    }))
  );
});

const addHighlight = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  progress.highlights.push(req.body);
  await progress.save();

  const highlight = progress.highlights[progress.highlights.length - 1];
  res.status(201).json({
    id: highlight._id.toString(),
    page: highlight.page,
    text: highlight.text,
    note: highlight.note,
    color: highlight.color,
    date: highlight.date.toISOString()
  });
});

const updateHighlight = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  const highlight = progress.highlights.id(req.params.highlightId);
  if (!highlight) {
    return res.status(404).json({ message: 'Highlight not found' });
  }

  highlight.page = req.body.page ?? highlight.page;
  highlight.text = req.body.text ?? highlight.text;
  highlight.note = req.body.note ?? highlight.note;
  highlight.color = req.body.color ?? highlight.color;
  await progress.save();

  res.json({
    id: highlight._id.toString(),
    page: highlight.page,
    text: highlight.text,
    note: highlight.note,
    color: highlight.color,
    date: highlight.date.toISOString()
  });
});

const deleteHighlight = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  progress.highlights.pull({ _id: req.params.highlightId });
  await progress.save();

  res.json({ message: 'Highlight deleted' });
});

const updateNotes = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const progress = await ReadingProgress.findOne({
    userId: user?._id,
    bookId: req.params.bookId
  });

  if (!progress) {
    return res.status(404).json({ message: 'Reading progress not found' });
  }

  progress.notes = req.body.notes || '';
  await progress.save();

  res.json(serializeProgress(progress));
});

const getReadingStats = asyncHandler(async (req, res) => {
  const progress = await getUserProgress(req);
  const completed = progress.filter((item) => item.status === 'completed');
  const totalPagesRead = progress.reduce((sum, item) => sum + item.currentPage, 0);
  const genreCounter = {};

  for (const entry of progress) {
    const book = await Book.findById(entry.bookId);
    (book?.genre || []).forEach((genre) => {
      genreCounter[genre] = (genreCounter[genre] || 0) + 1;
    });
  }

  const favoriteGenres = Object.entries(genreCounter)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const booksByYearMap = new Map();
  progress.forEach((item) => {
    const year = new Date(item.startDate).getFullYear();
    booksByYearMap.set(year, (booksByYearMap.get(year) || 0) + 1);
  });

  res.json({
    totalBooksRead: completed.length,
    totalPagesRead,
    totalReadingTime: totalPagesRead * 2,
    averageRating: 4.7,
    favoriteGenres,
    readingStreak: 15,
    longestStreak: 37,
    booksByYear: Array.from(booksByYearMap.entries()).map(([year, count]) => ({ year, count })),
    monthlyProgress: [
      { month: 'Jan', pages: 210, books: 1 },
      { month: 'Feb', pages: 320, books: 1 },
      { month: 'Mar', pages: 450, books: 2 }
    ]
  });
});

const getMonthlyStats = asyncHandler(async (req, res) => {
  res.json({
    year: Number(req.params.year),
    months: [
      { month: 'Jan', pages: 210, books: 1 },
      { month: 'Feb', pages: 320, books: 1 },
      { month: 'Mar', pages: 450, books: 2 }
    ]
  });
});

const getGenreStats = asyncHandler(async (req, res) => {
  const books = await Book.find();
  const counts = {};

  books.forEach((book) => {
    book.genre.forEach((genre) => {
      counts[genre] = (counts[genre] || 0) + 1;
    });
  });

  res.json(
    Object.entries(counts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
  );
});

const getReadingStreak = asyncHandler(async (req, res) => {
  res.json({ current: 15, longest: 37 });
});

const getReadingGoals = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  const goals = user ? await ReadingGoal.find({ userId: user._id }).sort({ createdAt: -1 }) : [];
  res.json(goals.map(serializeGoal));
});

const createReadingGoal = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const goal = await ReadingGoal.create({
    ...req.body,
    userId: user._id
  });

  res.status(201).json(serializeGoal(goal));
});

const updateReadingGoal = asyncHandler(async (req, res) => {
  const goal = await ReadingGoal.findByIdAndUpdate(req.params.goalId, req.body, {
    new: true,
    runValidators: true
  });

  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  res.json(serializeGoal(goal));
});

const deleteReadingGoal = asyncHandler(async (req, res) => {
  await ReadingGoal.findByIdAndDelete(req.params.goalId);
  res.json({ message: 'Goal deleted' });
});

const getGoalProgress = asyncHandler(async (req, res) => {
  const goal = await ReadingGoal.findById(req.params.goalId);
  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  const progress = goal.target === 0 ? 0 : Math.min(100, Math.round((goal.achieved / goal.target) * 100));
  res.json(progress);
});

const getChallenges = asyncHandler(async (req, res) => {
  res.json(sampleChallenges);
});

const joinChallenge = asyncHandler(async (req, res) => {
  const challenge = sampleChallenges.find((item) => item.id === req.params.challengeId);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  res.json({ message: 'Challenge joined', challenge });
});

const getChallengeProgress = asyncHandler(async (req, res) => {
  const challenge = sampleChallenges.find((item) => item.id === req.params.challengeId);
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found' });
  }

  res.json({
    challengeId: challenge.id,
    progress: challenge.unit === 'books' ? 50 : 34
  });
});

const exportReadingData = asyncHandler(async (req, res) => {
  const progress = await getUserProgress(req);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=\"reading-data.json\"');
  res.send(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        items: progress.map(serializeProgress)
      },
      null,
      2
    )
  );
});

const importReadingData = asyncHandler(async (req, res) => {
  res.status(501).json({
    message: 'Multipart import is not enabled yet. Use the export endpoint structure to add data programmatically.'
  });
});

module.exports = {
  abandonBook,
  addHighlight,
  createReadingGoal,
  deleteHighlight,
  deleteProgress,
  deleteReadingGoal,
  exportReadingData,
  getChallengeProgress,
  getChallenges,
  getCurrentReadings,
  getGenreStats,
  getGoalProgress,
  getHighlights,
  getMonthlyStats,
  getReadingGoals,
  getReadingProgress,
  getReadingStats,
  getReadingStreak,
  importReadingData,
  joinChallenge,
  markAsCompleted,
  startReading,
  updateHighlight,
  updateNotes,
  updateProgress,
  updateReadingGoal
};
