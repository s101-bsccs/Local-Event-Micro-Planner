const Event = require('../models/Event');
const User = require('../models/User');
const RSVP = require('../models/RSVP');
const { validateRequiredFields } = require('../utils/validate');
const { getEventStatus, getSuggestions } = require('../services/suggestionService');
const { getAnalytics } = require('../services/analyticsService');

function decorateEvent(event, currentUserId) {
  const attendees = event.attendees || [];
  const attendeeIds = attendees.map((attendee) => attendee._id ? attendee._id.toString() : attendee.toString());
  const creatorId = event.createdBy?._id ? event.createdBy._id.toString() : event.createdBy.toString();

  return {
    ...event,
    id: event._id,
    createdBy: event.createdBy,
    status: getEventStatus(event),
    attendeesCount: attendeeIds.length,
    availableSpots: Math.max(event.capacity - attendeeIds.length, 0),
    isFull: attendeeIds.length >= event.capacity,
    attendeeIds,
    isBookmarked: currentUserId ? Boolean(event.bookmarkedByCurrentUser) : false,
    canEdit: currentUserId ? creatorId === currentUserId : false
  };
}

async function listEvents(req, res, next) {
  try {
    const { category, city, date, search, status, userId } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (date) {
      query.date = date;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1, time: 1 })
      .lean();

    const currentUser = userId ? await User.findById(userId).lean() : null;
    const favoriteIds = new Set((currentUser?.favoriteEvents || []).map((id) => id.toString()));

    let decorated = events.map((event) => decorateEvent({
      ...event,
      bookmarkedByCurrentUser: favoriteIds.has(event._id.toString())
    }, userId));

    if (status) {
      decorated = decorated.filter((event) => event.status.toLowerCase() === status.toLowerCase());
    }

    const categories = [...new Set(events.map((event) => event.category))].sort();
    const cities = [...new Set(events.map((event) => event.city))].sort();
    const suggestions = await getSuggestions(city || undefined);
    const analytics = await getAnalytics();

    res.json({
      events: decorated,
      filters: {
        categories,
        cities
      },
      suggestions,
      analytics
    });
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .lean();

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    const currentUser = req.query.userId ? await User.findById(req.query.userId).lean() : null;
    const favoriteIds = new Set((currentUser?.favoriteEvents || []).map((id) => id.toString()));

    res.json(decorateEvent({
      ...event,
      bookmarkedByCurrentUser: favoriteIds.has(event._id.toString())
    }, req.query.userId));
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    validateRequiredFields(req.body, ['title', 'description', 'category', 'date', 'time', 'location', 'city', 'capacity', 'createdBy']);

    const creator = await User.findById(req.body.createdBy);

    if (!creator) {
      res.status(404);
      throw new Error('Creator user not found');
    }

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      city: req.body.city,
      capacity: Number(req.body.capacity),
      createdBy: req.body.createdBy,
      attendees: [req.body.createdBy]
    });

    await RSVP.create({
      userId: req.body.createdBy,
      eventId: event._id,
      status: 'going'
    });

    const populated = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .lean();

    res.status(201).json(decorateEvent(populated, req.body.createdBy));
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    validateRequiredFields(req.body, ['title', 'description', 'category', 'date', 'time', 'location', 'city', 'capacity', 'updatedBy']);

    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.createdBy.toString() !== req.body.updatedBy) {
      res.status(403);
      throw new Error('Only the event creator can edit this event');
    }

    event.title = req.body.title;
    event.description = req.body.description;
    event.category = req.body.category;
    event.date = req.body.date;
    event.time = req.body.time;
    event.location = req.body.location;
    event.city = req.body.city;
    event.capacity = Number(req.body.capacity);

    if (event.attendees.length > event.capacity) {
      res.status(400);
      throw new Error('Capacity cannot be lower than the current attendee count');
    }

    await event.save();

    const populated = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .lean();

    res.json(decorateEvent(populated, req.body.updatedBy));
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const { userId } = req.query;
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.createdBy.toString() !== userId) {
      res.status(403);
      throw new Error('Only the event creator can delete this event');
    }

    await RSVP.deleteMany({ eventId: event._id });
    await User.updateMany({}, { $pull: { favoriteEvents: event._id } });
    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getSuggestionsMeta(req, res, next) {
  try {
    const suggestions = await getSuggestions(req.query.city);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getSuggestionsMeta
};
