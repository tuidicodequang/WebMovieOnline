const Review = require('../models/Review');
const db = require('../config/db');

// Lấy danh sách đánh giá cho phim
exports.getReviews = (req, res) => {
    const { movie_id } = req.params;
    db.query('SELECT * FROM Reviews WHERE movie_id = ?', [movie_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching reviews' });
        res.status(200).json(results);
    });
};

// Thêm đánh giá mới
exports.createReview = (req, res) => {
    const { user_id, movie_id, rating, comment } = req.body;
    if (!user_id || !movie_id || !rating) return res.status(400).json({ error: 'User ID, Movie ID, and rating are required' });

    db.query('INSERT INTO Reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, movie_id, rating, comment], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error adding review' });
        res.status(201).json({ message: 'Review added successfully!' });
    });
};
