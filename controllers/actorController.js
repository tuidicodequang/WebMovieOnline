// controllers/actorController.js
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
    const { name, detail } = req.body;

    if (!name || !detail) return res.status(400).json({ error: 'Name and detail are required' });
    
    db.query('INSERT INTO Actors (actor_name, actor_detail) VALUES (?, ?)', [name, detail], (err, result) => {
        if (err) {
            console.error('Error creating actor:', err); // Ghi log lỗi
            return res.status(500).json({ error: 'Error creating actor' });
        }
        res.status(201).json({ message: 'Actor created successfully!' });
    });
};

// Sửa thông tin diễn viên

exports.updateActor = (req, res) => {
    const { id } = req.params;
    const { actor_name, actor_detail } = req.body;

    if (!actor_name || !actor_detail) {
        return res.status(400).json({ error: 'Name and detail are required' });
    }

    db.query(
        'UPDATE Actors SET actor_name = ?, actor_detail = ? WHERE actor_id = ?',
        [actor_name, actor_detail, id],
        (err, result) => {
            if (err) {
                console.error('Error updating actor:', err); // Log chi tiết lỗi
                return res.status(500).json({ error: 'Error updating actor' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Actor not found' });
            }
            
            res.status(200).json({ message: 'Actor updated successfully!' });
        }
    );
};



// Xóa diễn viên
exports.deleteActor = (req, res) => {
    const { id } = req.params;
    
    db.query(
        'DELETE FROM Actors WHERE actor_id = ?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error deleting actor' });
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Actor not found' });
            }
            
            res.status(200).json({ message: 'Actor deleted successfully!' });
        }
    );
};