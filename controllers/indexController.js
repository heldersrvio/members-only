const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');

const indexController = (() => {
	const messageList = (req, res, next) => {
		const isLoggedIn = req.user !== null && req.user !== undefined;
		const hasMemberAuthorization = isLoggedIn && req.user.is_member;
		const isAdmin = hasMemberAuthorization && req.user.is_admin;
		const query = hasMemberAuthorization
			? Message.find().sort({ timestamp: -1 }).populate('author', '-password')
			: Message.find()
					.sort({ timestamp: -1 })
					.populate('author', '-password -first_name -last_name')
					.select('title content author');
		query.exec((err, listMessages) => {
			if (err !== null) {
				return next(err);
			}
			res.render('index', {
				messageList: listMessages,
				showDelete: isAdmin,
				showNewMessage: isLoggedIn,
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
							{
								href: '/logout',
								name: 'Log out',
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

	const messageDelete = (req, res, next) => {
		const isLoggedIn = req.user !== null && req.user !== undefined;
		const hasMemberAuthorization = isLoggedIn && req.user.is_member;
		const isAdmin = hasMemberAuthorization && req.user.is_admin;
		if (isAdmin) {
			Message.findByIdAndDelete(req.params.id, (err) => {
				if (err !== null) {
					return next(err);
				}
				res.redirect('/');
			});
		} else {
			res.redirect('/');
		}
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

	const messageFormPost = [
		body('title', 'Title required.').trim().isLength({ min: 1 }),
		body('content', 'Message cannot be empty.').trim().isLength({ min: 1 }),
		(req, res, next) => {
			const isLoggedIn = req.user !== null && req.user !== undefined;
			const hasMemberAuthorization = isLoggedIn && req.user.is_member;
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.render('/message/new', {
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
					title: req.body.title,
					content: req.body.content,
					errors: errors.array(),
				});
			} else if (isLoggedIn) {
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
		},
	];

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

	const logInPost = [
		body('email', 'Invalid email.')
			.trim()
			.isLength({ min: 1 })
			.escape()
			.isEmail(),
		body('password', 'Password required.').trim().isLength({ min: 1 }).escape(),
		(req, res, next) => {
			const errors = validationResult(req);
			console.log(req.body);
			if (!errors.isEmpty) {
				res.render('login', {
					links: [
						{
							href: '/signup',
							name: 'Sign up',
						},
					],
					email: req.body.email,
					errors: errors.array(),
				});
			} else {
				console.log('No errors');
				next();
			}
		},
		passport.authenticate('local', {
			successRedirect: '/message/new',
			failureRedirect: '/login',
		}),
	];

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

	const signUpPost = [
		body('avatar', 'Pick an avatar.').trim().isLength({ min: 1 }),
		body('firstName', 'First name required.')
			.trim()
			.isLength({ min: 1 })
			.escape(),
		body('lastName', 'Last name required.')
			.trim()
			.isLength({ min: 1 })
			.escape(),
		body('email', 'Invalid email.')
			.trim()
			.isLength({ min: 1 })
			.escape()
			.isEmail(),
		body('password', 'Password required.').trim().isLength({ min: 1 }).escape(),
		body('passwordConfirm').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match.');
			}
			return true;
		}),
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.render('signup', {
					links: [
						{
							href: '/login',
							name: 'Log in',
						},
					],
					errors: errors.array(),
					email: req.body.email,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					avatar: req.body.avatar,
				});
			} else {
				User.find({ email: req.body.email }).exec((err, results) => {
					if (err !== null) {
						return next(err);
					}
					if (results.length > 0) {
						res.render('signup', {
							links: [
								{
									href: '/login',
									name: 'Log in',
								},
							],
							email: req.body.email,
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							avatar: req.body.avatar,
							errors: [{ msg: 'Email already registered.' }],
						});
					} else {
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
							}).save((err, savedUser) => {
								if (err !== null) {
									return next(err);
								}
								req.login(savedUser, (err) => {
									if (err !== null) {
										return next(err);
									}
									res.redirect('/message/new');
								});
							});
						});
					}
				});
			}
		},
	];

	const membershipGet = (req, res) => {
		const isLoggedIn = req.user !== null && req.user !== undefined;
		const hasMemberAuthorization = isLoggedIn && req.user.is_member;
		if (hasMemberAuthorization || !isLoggedIn) {
			res.redirect('/');
		} else {
			res.render('membership', {
				links: [
					{
						href: '/logout',
						name: 'Log out',
					},
				],
			});
		}
	};

	const membershipPost = [
		body('membershipPassword', 'Password required.')
			.trim()
			.isLength({ min: 1 })
			.escape(),
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.render('membership', {
					links: [
						{
							href: '/logout',
							name: 'Log out',
						},
					],
					errors: ['Incorrect password.'],
				});
			} else {
				bcrypt.compare(
					req.body.membershipPassword,
					process.env['MEMBERSHIP_PASSWORD'],
					(_err, response) => {
						if (response) {
							const user = new User({
								_id: req.user._id,
								is_member: true,
							});
							User.findByIdAndUpdate(
								req.user._id,
								user,
								{},
								(err, _updatedUser) => {
									if (err !== null) {
										return next(err);
									}
									res.redirect('/');
								},
							);
						} else {
							res.render('membership', {
								links: [
									{
										href: '/logout',
										name: 'Log out',
									},
								],
								errors: [{ msg: 'Incorrect password.' }],
							});
						}
					},
				);
			}
		},
	];

	return {
		messageList,
		messageDelete,
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
