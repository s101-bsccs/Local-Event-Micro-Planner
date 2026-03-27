const express = require('express');
const {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getSuggestionsMeta
} = require('../controllers/eventController');

const router = express.Router();

router.get('/', listEvents);
router.get('/meta/suggestions', getSuggestionsMeta);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
