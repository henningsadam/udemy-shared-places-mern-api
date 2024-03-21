const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/users-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
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

  // Hash the password before saving to the database
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    console.log(error);
    const err = new HttpError('Could not create user.', 500);
    return next(err);
  }

  const newUser = new User({
    name,
    email,
    imageUrl: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError('Failed to save user to the database.', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Unable to create user. Please try again later.',
      500
    );
    return next(error);
  }

  const userData = {
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    imageUrl: newUser.imageUrl,
    places: newUser.places,
  };

  res.status(201).json({
    message: 'Successfully created new user.',
    user: userData,
    token: token,
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

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    console.log(error);
    const err = new HttpError('Unable to log in.', 500);
    return next(err);
  }

  if (!isValidPassword) {
    const err = new HttpError('Invalid password.', 403);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Unable to login user. Please try again later.',
      500
    );
    return next(error);
  }

  const userData = {
    userId: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    imageUrl: existingUser.imageUrl,
    places: existingUser.places,
  };

  res.status(200).json({
    message: 'Successfully logged in.',
    user: userData,
    token: token,
  });
};
