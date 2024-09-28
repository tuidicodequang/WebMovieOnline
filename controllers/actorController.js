const Actor = require('../models/Actor');
const db = require('../config/db');

// Lấy danh sách diễn viên
exports.getActors = (req, res) => {
    db.query('SELECT * FROM Actors', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching actors' });
        res.status(200).json(results);
    });
};

// Thêm diễn viên mới
exports.createActor = (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    db.query('INSERT INTO Actors (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating actor' });
        res.status(201).json({ message: 'Actor created successfully!' });
    });
};
