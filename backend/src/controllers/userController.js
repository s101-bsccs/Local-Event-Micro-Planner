const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { getAnalytics } = require('../services/analyticsService');
const { getEventStatus } = require('../services/suggestionService');

function mapEvent(event, currentUserId) {
  const attendeeIds = (event.attendees || []).map((attendee) => attendee._id ? attendee._id.toString() : attendee.toString());

  return {
    ...event,
    id: event._id,
    attendeesCount: attendeeIds.length,
    status: getEventStatus(event),
    canEdit: event.createdBy?._id?.toString?.() === currentUserId || event.createdBy?.toString?.() === currentUserId,
    isBookmarked: false
  };
}

async function getDashboard(req, res, next) {
  try {
    const user = await User.findById(req.params.userId).lean();

    if (!user) {
      res.status(404);
      throw new Error('Planner not found');
    }

    const [myEvents, joinedEvents, analytics] = await Promise.all([
      Event.find({ createdBy: user._id }).populate('createdBy', 'name email plannerNumber').populate('attendees', 'name email plannerNumber').sort({ date: 1, time: 1 }).lean(),
      Event.find({ attendees: user._id, createdBy: { $ne: user._id } }).populate('createdBy', 'name email plannerNumber').populate('attendees', 'name email plannerNumber').sort({ date: 1, time: 1 }).lean(),
      getAnalytics()
    ]);

    const favoriteEvents = await Event.find({ _id: { $in: user.favoriteEvents } })
      .populate('createdBy', 'name email plannerNumber')
      .populate('attendees', 'name email plannerNumber')
      .lean();

    const rsvpCount = await RSVP.countDocuments({ userId: user._id, status: 'going' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plannerNumber: user.plannerNumber,
        favoriteEvents: user.favoriteEvents
      },
      myEvents: myEvents.map((event) => ({ ...mapEvent(event, user._id.toString()), isBookmarked: user.favoriteEvents.some((id) => id.toString() === event._id.toString()) })),
      joinedEvents: joinedEvents.map((event) => ({ ...mapEvent(event, user._id.toString()), isBookmarked: user.favoriteEvents.some((id) => id.toString() === event._id.toString()) })),
      favoriteEvents: favoriteEvents.map((event) => ({ ...mapEvent(event, user._id.toString()), isBookmarked: true })),
      personalStats: {
        totalEventsCreated: myEvents.length,
        totalJoinedEvents: joinedEvents.length,
        totalRsvps: rsvpCount,
        totalBookmarks: user.favoriteEvents.length
      },
      globalStats: analytics
    });
  } catch (error) {
    next(error);
  }
}

async function toggleBookmark(req, res, next) {
  try {
    const user = await User.findById(req.params.userId);
    const event = await Event.findById(req.params.eventId);

    if (!user || !event) {
      res.status(404);
      throw new Error('Planner or event not found');
    }

    const isBookmarked = user.favoriteEvents.some((id) => id.toString() === event._id.toString());

    if (isBookmarked) {
      user.favoriteEvents = user.favoriteEvents.filter((id) => id.toString() !== event._id.toString());
    } else {
      user.favoriteEvents.push(event._id);
    }

    await user.save();

    res.json({
      message: isBookmarked ? 'Bookmark removed' : 'Event bookmarked',
      favoriteEvents: user.favoriteEvents
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  toggleBookmark
};
