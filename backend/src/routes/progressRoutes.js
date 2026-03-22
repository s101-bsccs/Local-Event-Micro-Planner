const express = require('express');
const { optionalAuth } = require('../middleware/authMiddleware');
const controller = require('../controllers/progressController');

const router = express.Router();

router.get('/current', optionalAuth, controller.getCurrentReadings);
router.get('/book/:bookId', optionalAuth, controller.getReadingProgress);
router.post('/start', optionalAuth, controller.startReading);
router.put('/update/:bookId', optionalAuth, controller.updateProgress);
router.put('/complete/:bookId', optionalAuth, controller.markAsCompleted);
router.put('/abandon/:bookId', optionalAuth, controller.abandonBook);

router.get('/stats/genres', controller.getGenreStats);
router.get('/stats/monthly/:year', controller.getMonthlyStats);
router.get('/stats/:userId', optionalAuth, controller.getReadingStats);
router.get('/streak', controller.getReadingStreak);

router.get('/goals', optionalAuth, controller.getReadingGoals);
router.post('/goals', optionalAuth, controller.createReadingGoal);
router.put('/goals/:goalId', controller.updateReadingGoal);
router.delete('/goals/:goalId', controller.deleteReadingGoal);
router.get('/goals/:goalId/progress', controller.getGoalProgress);

router.get('/challenges', controller.getChallenges);
router.post('/challenges/:challengeId/join', controller.joinChallenge);
router.get('/challenges/:challengeId/progress', controller.getChallengeProgress);

router.get('/export', optionalAuth, controller.exportReadingData);
router.post('/import', controller.importReadingData);

router.get('/:bookId/highlights', optionalAuth, controller.getHighlights);
router.post('/:bookId/highlights', optionalAuth, controller.addHighlight);
router.put('/:bookId/highlights/:highlightId', optionalAuth, controller.updateHighlight);
router.delete('/:bookId/highlights/:highlightId', optionalAuth, controller.deleteHighlight);
router.put('/:bookId/notes', optionalAuth, controller.updateNotes);
router.delete('/:bookId', optionalAuth, controller.deleteProgress);

module.exports = router;
