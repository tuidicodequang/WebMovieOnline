const Review = require('../models/Review');
const db = require('../config/db');

// Lấy danh sách đánh giá cho phim
exports.getReviews = (req, res) => {
    const { movie_id } = req.params;

    db.query('SELECT * FROM Reviews WHERE movie_id = ?', [movie_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json(results);
    });
};

// Thêm đánh giá mới
exports.createReview = (req, res) => {
    const { user_id, movie_id, rating, comment } = req.body;

    db.query('INSERT INTO Reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, movie_id, rating, comment], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Review added successfully!' });
    });
};
