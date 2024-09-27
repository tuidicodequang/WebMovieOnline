const Actor = require('../models/Actor');
const db = require('../config/db');

// Lấy danh sách diễn viên
exports.getActors = (req, res) => {
    db.query('SELECT * FROM Actors', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json(results);
    });
};

// Thêm diễn viên mới
exports.createActor = (req, res) => {
    const { name } = req.body;

    db.query('INSERT INTO Actors (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'Actor created successfully!' });
    });
};
