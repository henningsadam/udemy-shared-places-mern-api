const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Adam Hennings',
    email: 'adam@something.com',
    password: 'hello',
  },
  {
    id: 'u2',
    name: 'Alondra Santos',
    email: 'alondra@something.com',
    password: 'hello',
  },
];

exports.getUsers = (req, res, next) => {
  const users = DUMMY_USERS;
  if (!users) {
    const error = new HttpError('No users found.', 404);
    return next(error);
  }
  res.status(200).json({ users });
};

exports.getUserById = (req, res, next) => {
  const userId = req.params.userId;
  const user = DUMMY_USERS.find((u) => u.id === userId);
  if (!user) {
    const error = new HttpError('No user found.', 404);
    return next(error);
  }
  res.status(200).json({ user });
};

exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(newUser);

  res
    .status(201)
    .json({ message: 'Successfully created new user.', user: newUser });
};

exports.login = (req, res, next) => {
  const { id, email, password } = req.body;

  const existingUser = DUMMY_USERS.find(u => u.email === email)

  if (!existingUser) {
    const error = new HttpError('No user found.', 401)
    return next(error)
  }

  if (existingUser.password !== password) {
    const error = new HttpError('Invalid password.', 403)
    return next(error)
  }
  
  res.status(200).json({ message: 'Successfully logged in.' });
};
