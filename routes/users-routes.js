const express = require('express')
const userController = require('../controllers/users-controller')

const router = express.Router()

router.get('/', userController.getUsers)
router.get('/:userId', userController.getUserById)
router.post('/signup', userController.createUser)
router.post('/login', userController.login)

module.exports = router