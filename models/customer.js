const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: String,
    isGold: {
        type: Boolean,
        default: false
    },
    phone: String
}));

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(3).required(),
        isGold: Joi.boolean().required(),
        phone: Joi.string().min(5).required()
    };
    return Joi.validate(schema, customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;