const auth = require('../middleware/auth');
const express = require('express');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movies');
const { Rental, validate } = require('../models/rentals');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
 });

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) res.status(400).send('Could not save rental details in database');

    // Instead use joi-objectid
    // if (!mongoose.Types.ObjectId.isValid(req.body.customerId))
    //     return res.status(400).send('Invalid CustomerId');

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) res.status(400).send('Customer does not exist');

    // Instead use joi-objectid
    // if (!mongoose.Types.ObjectId.isValid(req.body.movieId))
    //     return res.status(400).send('Invalid movie Id');

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) res.status(400).send('Movie is not available');

    if (movie.numberInStock === 0) return res.status(400).send('Movie not available');

    let rental = new Rental({
        customer: {
            _id : customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    try{
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: { numberInStock: -1 }
            })
            .run();
        res.send(rental);
    }
    catch (ex) {
        res.status(500).send('Something failed..');
    }
});
module.exports = router;