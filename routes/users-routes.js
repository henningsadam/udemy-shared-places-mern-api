const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/users-controller');

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:userId', userController.getUserById);
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').not().isEmpty().normalizeEmail().isEmail(),
    check('password').isLength({ min: 5 }),
  ],
  userController.createUser
);
router.post('/login', userController.login);

module.exports = router;
