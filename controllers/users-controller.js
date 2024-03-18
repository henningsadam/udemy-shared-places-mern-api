const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/users-model');

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, 'email password');
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Failed to fetch users from the database.',
      500
    );
    return next(error);
  }

  if (!users) {
    const error = new HttpError('No users found.', 404);
    return next(error);
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.getUserById = async (req, res, next) => {
  const userId = req.params.userId;
  let user;
  try {
    user = User.findById(userId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Failed to retrieve user data from the database.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('No user found.', 404);
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid data', 422);
    return next(error);
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Failed to retrieve user data from database.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('Email already in use.', 422);
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    imageUrl: 'https://randomuser.me/api/portraits/men/8.jpg',
    password,
    places: []
  });

  try {
    await newUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Failed to save user to the database.', 500);
    return next(error);
  }

  res.status(201).json({
    message: 'Successfully created new user.',
    user: newUser.toObject({ getters: true }),
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Failed to retrieve user data from database.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('No user found.', 401);
    return next(error);
  }

  if (existingUser.password !== password) {
    const error = new HttpError('Invalid password.', 403);
    return next(error);
  }

  res.status(200).json({ message: 'Successfully logged in.' });
};
