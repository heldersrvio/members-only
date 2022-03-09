const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');

const indexController = (() => {
	const messageList = (_req, res) => {
		res.send('Message list');
	};

	const messagePost = (_req, res) => {
		res.send('Message post');
	};

	const logInGet = (_req, res) => {
		res.render('logIn', {
			links: [
				{
					href: '/signup',
					name: 'Sign up',
				},
			],
		});
	};

	const logInPost = passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
	});

	const logOutGet = (req, res) => {
		req.logout();
		res.redirect('/');
	};

	const signUpGet = (_req, res) => {
		res.render('signUp', {
			links: [
				{
					href: '/login',
					name: 'Log in',
				},
			],
		});
	};

	const signUpPost = (req, res, next) => {
		bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
			if (err !== null) {
				return next(err);
			}
			new User({
				email: req.body.email,
				password: hashedPassword,
				first_name: req.body.firstName,
				last_name: req.body.lastName,
				is_member: false,
				is_admin: false,
				avatar: req.body.avatar,
			}).save((err) => {
				if (err !== null) {
					return next(err);
				}

				res.redirect('/');
			});
		});
	};

	const membershipGet = (_req, res) => {
		res.render('membership');
	};

	const membershipPost = (req, res, next) => {
		bcrypt.compare(
			req.body.membershipPassword,
			process.env['MEMBERSHIP_PASSWORD'],
			(_err, response) => {
				if (response !== null) {
					const user = new User({
						_id: req.body.userId,
						is_member: true,
					});
					User.findByIdAndUpdate(
						req.body.userId,
						user,
						{},
						(err, _updatedUser) => {
							if (err !== null) {
								return next(err);
							}
							res.redirect('/');
						},
					);
				}
			},
		);
	};

	return {
		messageList,
		messagePost,
		logInGet,
		logInPost,
		logOutGet,
		signUpGet,
		signUpPost,
		membershipGet,
		membershipPost,
	};
})();

module.exports = indexController;
