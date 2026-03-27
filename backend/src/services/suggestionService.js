const Event = require('../models/Event');

function buildDateTime(event) {
  return new Date(`${event.date}T${event.time}:00`);
}

function getEventStatus(event) {
  const start = buildDateTime(event);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const now = new Date();

  if (now < start) {
    return 'Upcoming';
  }

  if (now >= start && now <= end) {
    return 'Ongoing';
  }

  return 'Completed';
}

async function getSuggestions(city) {
  const query = city ? { city: new RegExp(`^${city}$`, 'i') } : {};
  const events = await Event.find(query).lean();

  const hourCounter = new Map();
  const categoryCounter = new Map();

  events.forEach((event) => {
    const [hours] = event.time.split(':').map(Number);
    hourCounter.set(hours, (hourCounter.get(hours) || 0) + 1);
    categoryCounter.set(event.category, (categoryCounter.get(event.category) || 0) + 1);
  });

  const bestHour = [...hourCounter.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 18;
  const popularCategories = [...categoryCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  return {
    recommendedTime: `${String(bestHour).padStart(2, '0')}:00`,
    popularCategories: popularCategories.length ? popularCategories : ['Community', 'Workshop', 'Food']
  };
}

module.exports = {
  buildDateTime,
  getEventStatus,
  getSuggestions
};
