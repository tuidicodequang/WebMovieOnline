const Category = require('../models/Category');
const db = require('../config/db');

// Lấy danh sách thể loại
exports.getCategories = (req, res) => {
    db.query('SELECT * FROM Categories', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json(results);
    });
};

// Thêm thể loại mới
exports.createCategory = (req, res) => {
    const { name } = req.body;

    db.query('INSERT INTO Categories (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Category created successfully!' });
    });
};
