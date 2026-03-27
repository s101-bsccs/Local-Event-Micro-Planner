const Event = require('../models/Event');
const RSVP = require('../models/RSVP');

async function getAnalytics() {
  const [totalEvents, totalRsvps] = await Promise.all([
    Event.countDocuments(),
    RSVP.countDocuments({ status: 'going' })
  ]);

  return {
    totalEvents,
    totalRsvps
  };
}

module.exports = {
  getAnalytics
};
