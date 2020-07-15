
const auth = require('../middleware/auth');
const { Movie, validate } = require('../models/movies');
const express = require('express');
const { Genre } = require('../models/genre');
const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('name');
    res.send(movies);
});

router.get('/:id', async (req, res) => {
    const movie = await Customer.findById(req.params.id);
    if (!movie) res.status(400).send('Movie with the given Id is not found');
    res.send(movie);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) res.status(400).send(error.details[0].message);
    
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) res.status(400).send('Invalid genre..');

    let movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name:genre.name
        },
        numberInStock : req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    movie = await movie.save();
    res.send(movie);
});

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) res.status(400).send('Given Id is not valid. Update failed.');
    const movie = await Movie.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    res.send(movie);
});

router.delete('/:id', auth, async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) res.status(400).send('Given Id is not valid. Failed to Delete');
    res.send(movie);
});

module.exports = router;