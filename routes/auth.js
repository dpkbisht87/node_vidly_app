const _ = require('lodash');
const Joi = require('joi');
const bcyrpt = require('bcrypt');
const express = require('express');
const { User } = require('../models/users');
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) res.status(400).send('Email or password incorrect');

    const isValidated = await bcyrpt.compare(req.body.password, user.password);
    if (!isValidated) res.status(400).send('Email or password incorrect');
    const token = user.generateAuthToken();
    res.send(token);
});

function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;