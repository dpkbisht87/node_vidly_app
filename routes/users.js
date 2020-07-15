const auth = require('../middleware/auth');
const _ = require('lodash');
const bcyrpt = require('bcrypt');
const express = require('express');
const { User, validate } = require('../models/users');
const router = express.Router();

router.get('/', async (req, res) => {
    const users = await User.find().sort('name');
    if (!users) res.status(400).send('Could not fetch users');
    res.send(users);
});

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) res.status(400).send('User already registered');

    // user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
    //Use pick to create a user
    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcyrpt.genSalt(10);
    user.password = await bcyrpt.hash(user.password, salt);
    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.delete('/:email', auth, async (req, res) => {
    const user = await User.findOneAndRemove({ email: req.params.email });
    if (!user) res.status(400).send('Failed to delete user');
    res.send(user);
});
module.exports = router;