const WatchHistory = require('../models/WatchHistory');
const db = require('../config/db');

// Lấy lịch sử xem của người dùng
exports.getWatchHistory = (req, res) => {
    const { user_id } = req.params;

    db.query('SELECT * FROM WatchHistory WHERE user_id = ?', [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json(results);
    });
};

// Cập nhật lịch sử xem
exports.updateWatchHistory = (req, res) => {
    const { user_id, movie_id, position } = req.body;

    db.query('UPDATE WatchHistory SET position = ?, last_watched_at = CURRENT_TIMESTAMP WHERE user_id = ? AND movie_id = ?',
        [position, user_id, movie_id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ message: 'Watch history updated successfully!' });
    });
};
