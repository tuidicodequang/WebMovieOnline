const Movie = require('../models/Movie');
const db = require('../config/db');

// Lấy danh sách phim
exports.getMovies = (req, res) => {
    db.query('SELECT * FROM Movies', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching movies' });
        res.status(200).json(results);
    });
};

// Thêm phim mới
exports.createMovie = (req, res) => {
    const { title, release_date, description, poster, video_url } = req.body;
    if (!title || !release_date) return res.status(400).json({ error: 'Title and release date are required' });

    db.query('INSERT INTO Movies (title, release_date, description, poster, video_url) VALUES (?, ?, ?, ?, ?)',
        [title, release_date, description, poster, video_url], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating movie' });
        res.status(201).json({ message: 'Movie created successfully!' });
    });
};
