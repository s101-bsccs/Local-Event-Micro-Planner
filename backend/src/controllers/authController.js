const bcrypt = require('bcryptjs');
const Account = require('../models/Account');
const User = require('../models/User');
const { validateRequiredFields } = require('../utils/validate');

function buildPlannerSeeds(accountName, email, accountId) {
  const [localPart, domainPart = 'planner.local'] = email.toLowerCase().split('@');

  return Array.from({ length: 5 }, (_, index) => ({
    accountId,
    name: `${accountName.split(' ')[0]} Planner ${index + 1}`,
    email: `${localPart}+planner${index + 1}@${domainPart}`,
    plannerNumber: index + 1
  }));
}

function serializeSession(account, planners) {
  return {
    account: {
      id: account._id,
      name: account.name,
      email: account.email
    },
    planners: planners.map((planner) => ({
      id: planner._id,
      name: planner.name,
      email: planner.email,
      plannerNumber: planner.plannerNumber,
      favoriteEvents: planner.favoriteEvents || []
    }))
  };
}

async function register(req, res, next) {
  try {
    validateRequiredFields(req.body, ['name', 'email', 'password']);

    const email = req.body.email.toLowerCase();
    const existingAccount = await Account.findOne({ email });

    if (existingAccount) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const account = await Account.create({
      name: req.body.name,
      email,
      passwordHash,
      planners: []
    });

    const planners = await User.insertMany(buildPlannerSeeds(req.body.name, email, account._id));
    account.planners = planners.map((planner) => planner._id);
    await account.save();

    res.status(201).json(serializeSession(account, planners));
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    validateRequiredFields(req.body, ['email', 'password']);

    const account = await Account.findOne({ email: req.body.email.toLowerCase() });

    if (!account) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(req.body.password, account.passwordHash);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const planners = await User.find({ accountId: account._id }).sort({ plannerNumber: 1 }).lean();
    res.json(serializeSession(account, planners));
  } catch (error) {
    next(error);
  }
}

async function getAccountSession(req, res, next) {
  try {
    const account = await Account.findById(req.params.accountId).lean();

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    const planners = await User.find({ accountId: account._id }).sort({ plannerNumber: 1 }).lean();
    res.json(serializeSession(account, planners));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getAccountSession,
  buildPlannerSeeds
};
