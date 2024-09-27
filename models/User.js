const db = require('../config/db');

// Định nghĩa các phương thức thao tác với bảng Users

const User = {
    // Phương thức để lấy thông tin người dùng dựa trên ID
    findById: (id, callback) => {
        const query = 'SELECT * FROM Users WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results[0]);
        });
    },

    // Phương thức để tạo người dùng mới
    create: (username, password, role, callback) => {
        const query = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, password, role], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results.insertId);
        });
    },

    // Phương thức để cập nhật thông tin người dùng
    update: (id, username, password, role, callback) => {
        const query = 'UPDATE Users SET username = ?, password = ?, role = ? WHERE id = ?';
        db.query(query, [username, password, role, id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    },

    // Phương thức để xóa người dùng
    delete: (id, callback) => {
        const query = 'DELETE FROM Users WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    }
};

module.exports = User;

