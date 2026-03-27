const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { validateRequiredFields } = require('../utils/validate');

async function respondToRsvp(req, res, next) {
  try {
    validateRequiredFields(req.body, ['userId', 'eventId', 'status']);

    if (!['going', 'not-going'].includes(req.body.status)) {
      res.status(400);
      throw new Error('RSVP status must be either going or not-going');
    }

    const [user, event] = await Promise.all([
      User.findById(req.body.userId),
      Event.findById(req.body.eventId)
    ]);

    if (!user || !event) {
      res.status(404);
      throw new Error('User or event not found');
    }

    const alreadyGoing = event.attendees.some((id) => id.toString() === user._id.toString());

    if (req.body.status === 'going' && !alreadyGoing && event.attendees.length >= event.capacity) {
      res.status(400);
      throw new Error('This event is already full');
    }

    const existingRsvp = await RSVP.findOne({ userId: user._id, eventId: event._id });

    if (req.body.status === 'going') {
      if (!alreadyGoing) {
        event.attendees.push(user._id);
      }
    } else {
      event.attendees = event.attendees.filter((id) => id.toString() !== user._id.toString());
    }

    await event.save();

    if (existingRsvp) {
      existingRsvp.status = req.body.status;
      await existingRsvp.save();
    } else {
      await RSVP.create({
        userId: user._id,
        eventId: event._id,
        status: req.body.status
      });
    }

    const updatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .lean();

    res.json({
      message: req.body.status === 'going' ? 'RSVP saved as Going' : 'RSVP updated to Not Going',
      event: {
        ...updatedEvent,
        id: updatedEvent._id,
        attendeesCount: updatedEvent.attendees.length,
        availableSpots: Math.max(updatedEvent.capacity - updatedEvent.attendees.length, 0),
        isFull: updatedEvent.attendees.length >= updatedEvent.capacity
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  respondToRsvp
};
