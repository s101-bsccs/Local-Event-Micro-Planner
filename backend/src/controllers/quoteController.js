const asyncHandler = require('../middleware/asyncHandler');
const Quote = require('../models/Quote');
const { serializeQuote } = require('../utils/serialize');

function buildQuoteFilters(query) {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  if (query.author) {
    filters.author = new RegExp(`^${query.author}$`, 'i');
  }

  if (query.language) {
    filters.language = query.language;
  }

  return filters;
}

const getQuotes = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const filters = buildQuoteFilters(req.query);

  const [quotes, total] = await Promise.all([
    Quote.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Quote.countDocuments(filters)
  ]);

  res.json({
    quotes: quotes.map(serializeQuote),
    total
  });
});

const getRandomQuote = asyncHandler(async (req, res) => {
  const language = req.query.language;
  const match = language ? { language } : {};
  const [quote] = await Quote.aggregate([{ $match: match }, { $sample: { size: 1 } }]);

  if (!quote) {
    return res.status(404).json({ message: 'No quote found' });
  }

  res.json(serializeQuote(quote));
});

const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) {
    return res.status(404).json({ message: 'Quote not found' });
  }

  res.json(serializeQuote(quote));
});

const getQuotesByAuthor = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ author: new RegExp(`^${req.params.author}$`, 'i') }).sort({ likes: -1 });
  res.json(quotes.map(serializeQuote));
});

const getQuotesByBook = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ bookId: req.params.bookId }).sort({ likes: -1 });
  res.json(quotes.map(serializeQuote));
});

const getQuotesByCategory = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ category: req.params.category }).sort({ likes: -1 });
  res.json(quotes.map(serializeQuote));
});

const addQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.create(req.body);
  res.status(201).json(serializeQuote(quote));
});

const updateQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!quote) {
    return res.status(404).json({ message: 'Quote not found' });
  }

  res.json(serializeQuote(quote));
});

const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) {
    return res.status(404).json({ message: 'Quote not found' });
  }

  await quote.deleteOne();
  res.json({ message: 'Quote deleted' });
});

const likeQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) {
    return res.status(404).json({ message: 'Quote not found' });
  }

  quote.likes += 1;
  await quote.save();

  res.json({ likes: quote.likes });
});

const unlikeQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) {
    return res.status(404).json({ message: 'Quote not found' });
  }

  quote.likes = Math.max(0, quote.likes - 1);
  await quote.save();

  res.json({ likes: quote.likes });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Quote.distinct('category');
  res.json(categories.filter(Boolean).sort());
});

const getPopularQuotes = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const quotes = await Quote.find().sort({ likes: -1 }).limit(limit);
  res.json(quotes.map(serializeQuote));
});

const searchQuotes = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const quotes = await Quote.find({
    $or: [
      { text: new RegExp(q, 'i') },
      { author: new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') }
    ]
  }).limit(20);

  res.json(quotes.map(serializeQuote));
});

module.exports = {
  addQuote,
  deleteQuote,
  getCategories,
  getPopularQuotes,
  getQuoteById,
  getQuotes,
  getQuotesByAuthor,
  getQuotesByBook,
  getQuotesByCategory,
  getRandomQuote,
  likeQuote,
  searchQuotes,
  unlikeQuote,
  updateQuote
};
