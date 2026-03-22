const express = require('express');
const controller = require('../controllers/quoteController');

const router = express.Router();

router.get('/random', controller.getRandomQuote);
router.get('/categories', controller.getCategories);
router.get('/popular', controller.getPopularQuotes);
router.get('/search', controller.searchQuotes);
router.get('/author/:author', controller.getQuotesByAuthor);
router.get('/book/:bookId', controller.getQuotesByBook);
router.get('/category/:category', controller.getQuotesByCategory);
router.get('/', controller.getQuotes);
router.post('/', controller.addQuote);
router.get('/:id', controller.getQuoteById);
router.put('/:id', controller.updateQuote);
router.delete('/:id', controller.deleteQuote);
router.post('/:id/like', controller.likeQuote);
router.post('/:id/unlike', controller.unlikeQuote);

module.exports = router;
