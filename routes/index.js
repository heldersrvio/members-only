const express = require('express');
const router = express.Router();

const controller = require('../controllers/indexController');

router.get('/', controller.messageList);

router.get('/message/new', controller.messageFormGet);

router.post('/message/new', controller.messageFormPost);

router.get('/login', controller.logInGet);

router.post('/login', controller.logInPost);

router.get('/logout', controller.logOutGet);

router.get('/signup', controller.signUpGet);

router.post('/signup', controller.signUpPost);

router.get('/membership', controller.membershipGet);

router.post('/membership', controller.membershipPost);

module.exports = router;
