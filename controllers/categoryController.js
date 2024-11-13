const Category = require('../models/Category');
const db = require('../config/db');

// Lấy danh sách thể loại
exports.getCategories = (req, res) => {
    db.query('SELECT * FROM Categories', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching categories' });
        res.status(200).json(results);
    });
};

// Thêm thể loại mới
exports.createCategory = (req, res) => {
    const { name,slug } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    db.query('INSERT INTO Categories (name),(slug) VALUES (?),(?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating category' });
        res.status(201).json({ message: 'Category created successfully!' });
    });
};
