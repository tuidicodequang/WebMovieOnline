const db = require('../config/db');

const Movie = {
    // Lấy tất cả phim
    findAll: (callback) => {
        const query = 'SELECT * FROM Movies';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    },

    // Tìm phim theo ID
    findById: (id, callback) => {
        const query = 'SELECT * FROM Movies WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results[0]);
        });
    },

    // Thêm phim mới
    create: (title, release_date, description, poster, video_url, callback) => {
        const query = 'INSERT INTO Movies (title, release_date, description, poster, video_url) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [title, release_date, description, poster, video_url], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results.insertId);
        });
    },

    // Cập nhật thông tin phim
    update: (id, title, release_date, description, poster, video_url, callback) => {
        const query = 'UPDATE Movies SET title = ?, release_date = ?, description = ?, poster = ?, video_url = ? WHERE id = ?';
        db.query(query, [title, release_date, description, poster, video_url, id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    },

    // Xóa phim
    delete: (id, callback) => {
        const query = 'DELETE FROM Movies WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    }
};

module.exports = Movie;
