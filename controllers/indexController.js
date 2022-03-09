const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
const Message = require('../models/message');

const indexController = (() => {
	const messageList = (req, res, next) => {
		const isLoggedIn = req.user !== null && req.user !== undefined;
		const hasMemberAuthorization = isLoggedIn && req.user.is_member;
		const query = hasMemberAuthorization
			? Message.find().sort({ timestamp: -1 }).populate('author', '-password')
			: Message.find().sort({ timestamp: -1 }).select('title content');
		query.exec((err, listMessages) => {
			if (err !== null) {
				return next(err);
			}
			res.render('index', {
				messageList: listMessages,
				links: hasMemberAuthorization
					? [
							{
								href: '/logout',
								name: 'Log out',
							},
					  ]
					: isLoggedIn
					? [
							{
								href: '/membership',
								name: 'Become a member',
							},
					  ]
					: [
							{
								href: '/login',
								name: 'Log in',
							},
							{
								href: '/signup',
								name: 'Sign up',
							},
					  ],
			});
		});
	};

	const messageFormGet = (req, res) => {
		const isLoggedIn = req.user !== null && req.user !== undefined;
		const hasMemberAuthorization = isLoggedIn && req.user.is_member;
		if (isLoggedIn) {
			res.render('messageForm', {
				links: hasMemberAuthorization
					? [
							{
								href: '/logout',
								name: 'Log out',
							},
					  ]
					: [
							{
								href: '/membership',
								name: 'Become a member',
							},
							{
								href: '/logout',
								name: 'Log out',
							},
					  ],
			});
		} else {
			res.redirect('/login');
		}
	};

	const messageFormPost = (req, res, next) => {
		const isLoggedIn = req.user !== null && req.user !== undefined;
		if (isLoggedIn) {
			User.findById(req.user._id).exec((err, user) => {
				const message = new Message({
					title: req.body.title,
					content: req.body.content,
					timestamp: new Date(),
					author: user,
				});
				message.save((err) => {
					if (err !== null) {
						console.log(err);
						return next(err);
					}
					res.redirect('/');
				});
			});
		} else {
			res.redirect('/login');
		}
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
		successRedirect: '/message/new',
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

				res.redirect('/message/new');
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
		messageFormGet,
		messageFormPost,
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
