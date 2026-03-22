const express = require('express');
const { optionalAuth } = require('../middleware/authMiddleware');
const controller = require('../controllers/bookController');

const router = express.Router();

router.get('/catalog-meta', controller.getCatalogMeta);
router.get('/genres', controller.getGenres);
router.get('/trending', controller.getTrendingBooks);
router.get('/new-releases', controller.getNewReleases);
router.get('/author/:authorId', controller.getBooksByAuthor);
router.get('/recommendations/:userId', optionalAuth, controller.getRecommendations);
router.get('/favorites/:userId', optionalAuth, controller.getFavorites);
router.get('/reading-list/:userId', optionalAuth, controller.getReadingList);

router.get('/', controller.getBooks);
router.post('/', controller.addBook);

router.get('/:id', controller.getBookById);
router.put('/:id', controller.updateBook);
router.delete('/:id', controller.deleteBook);

router.get('/:bookId/reviews', controller.getReviews);
router.post('/:bookId/reviews', optionalAuth, controller.addReview);
router.put('/:bookId/reviews/:reviewId', controller.updateReview);
router.delete('/:bookId/reviews/:reviewId', controller.deleteReview);
router.post('/:bookId/reviews/:reviewId/like', controller.likeReview);

router.post('/:bookId/favorite', optionalAuth, controller.addToFavorites);
router.delete('/:bookId/favorite', optionalAuth, controller.removeFromFavorites);
router.post('/:bookId/reading-list', optionalAuth, controller.addToReadingList);
router.delete('/:bookId/reading-list', optionalAuth, controller.removeFromReadingList);
router.post('/:bookId/rate', controller.rateBook);

module.exports = router;
