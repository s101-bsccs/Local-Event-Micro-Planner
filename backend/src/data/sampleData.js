const demoAccount = {
  name: 'Demo Organizer',
  email: 'demo@planner.com',
  password: 'Password@123'
};

const sampleEvents = [
  {
    title: 'Sunset Yoga Circle',
    description: 'An open-air yoga session in the neighborhood park followed by herbal tea and introductions.',
    category: 'Wellness',
    date: '2026-03-30',
    time: '18:00',
    location: 'Green Park Amphitheatre',
    city: 'Pune',
    capacity: 20,
    createdByPlannerNumber: 1,
    attendeePlannerNumbers: [1, 2]
  },
  {
    title: 'Street Food Walk',
    description: 'Explore hidden local food stalls, share favorites, and vote for the best snack stop.',
    category: 'Food',
    date: '2026-04-02',
    time: '19:30',
    location: 'Old City Market',
    city: 'Pune',
    capacity: 15,
    createdByPlannerNumber: 2,
    attendeePlannerNumbers: [2, 3]
  },
  {
    title: 'Weekend Makers Meetup',
    description: 'A tiny community meetup for indie makers to demo projects and exchange launch ideas.',
    category: 'Networking',
    date: '2026-04-05',
    time: '11:00',
    location: 'Civic Co-Working Studio',
    city: 'Mumbai',
    capacity: 30,
    createdByPlannerNumber: 3,
    attendeePlannerNumbers: [1, 3, 4]
  },
  {
    title: 'Library Story Swap',
    description: 'Bring a short story or poem, read aloud, and meet readers from around your city.',
    category: 'Community',
    date: '2026-03-20',
    time: '17:00',
    location: 'Riverside Public Library',
    city: 'Pune',
    capacity: 25,
    createdByPlannerNumber: 1,
    attendeePlannerNumbers: [1, 5]
  }
];

module.exports = {
  demoAccount,
  sampleEvents
};
