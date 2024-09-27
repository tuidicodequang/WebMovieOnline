const db = require('../config/db');

const Category = {
    // Lấy tất cả thể loại
    findAll: (callback) => {
        const query = 'SELECT * FROM Categories';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    },

    // Tìm thể loại theo ID
    findById: (id, callback) => {
        const query = 'SELECT * FROM Categories WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results[0]);
        });
    },

    // Thêm thể loại mới
    create: (name, callback) => {
        const query = 'INSERT INTO Categories (name) VALUES (?)';
        db.query(query, [name], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results.insertId);
        });
    },

    // Cập nhật thể loại
    update: (id, name, callback) => {
        const query = 'UPDATE Categories SET name = ? WHERE id = ?';
        db.query(query, [name, id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    },

    // Xóa thể loại
    delete: (id, callback) => {
        const query = 'DELETE FROM Categories WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    }
};

module.exports = Category;
