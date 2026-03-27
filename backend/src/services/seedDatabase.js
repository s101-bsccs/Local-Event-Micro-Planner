const bcrypt = require('bcryptjs');
const Account = require('../models/Account');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const User = require('../models/User');
const { demoAccount, sampleEvents } = require('../data/sampleData');
const { buildPlannerSeeds } = require('../controllers/authController');

async function seedDatabase() {
  const existingAccounts = await Account.countDocuments();

  if (existingAccounts > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(demoAccount.password, 10);
  const account = await Account.create({
    name: demoAccount.name,
    email: demoAccount.email,
    passwordHash,
    planners: []
  });

  const planners = await User.insertMany(buildPlannerSeeds(demoAccount.name, demoAccount.email, account._id));
  account.planners = planners.map((planner) => planner._id);
  await account.save();

  const plannerMap = new Map(planners.map((planner) => [planner.plannerNumber, planner]));

  for (const eventSeed of sampleEvents) {
    const creator = plannerMap.get(eventSeed.createdByPlannerNumber);
    const attendeeIds = eventSeed.attendeePlannerNumbers.map((plannerNumber) => plannerMap.get(plannerNumber)._id);

    const event = await Event.create({
      title: eventSeed.title,
      description: eventSeed.description,
      category: eventSeed.category,
      date: eventSeed.date,
      time: eventSeed.time,
      location: eventSeed.location,
      city: eventSeed.city,
      capacity: eventSeed.capacity,
      createdBy: creator._id,
      attendees: attendeeIds
    });

    await RSVP.insertMany(
      eventSeed.attendeePlannerNumbers.map((plannerNumber) => ({
        userId: plannerMap.get(plannerNumber)._id,
        eventId: event._id,
        status: 'going'
      }))
    );
  }

  const favoriteEvents = (await Event.find({ city: 'Pune' }).limit(2)).map((event) => event._id);
  await User.updateOne({ _id: plannerMap.get(1)._id }, { $set: { favoriteEvents } });

  console.log('Demo account, planners, and events seeded.');
}

module.exports = seedDatabase;
