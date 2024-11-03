// controllers/directorController.js
const Director = require('../models/Director');
const db = require('../config/db');

// Lấy danh sách đạo diễn
exports.getDirectors = (req, res) => {
    db.query('SELECT * FROM director', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching directors' });
        res.status(200).json(results);
    });
};

// Thêm đạo diễn mới
exports.createDirector = (req, res) => {
    const { name, detail } = req.body;

    if (!name || !detail) return res.status(400).json({ error: 'Name and detail are required' });
    
    db.query('INSERT INTO director (director_name, director_detail) VALUES (?, ?)', [name, detail], (err, result) => {
        if (err) {
            console.error('Error creating director:', err); // Ghi log lỗi
            return res.status(500).json({ error: 'Error creating director' });
        }
        res.status(201).json({ message: 'Director created successfully!' });
    });
};

// Sửa thông tin đạo diễn
exports.updateDirector = (req, res) => {
    const { id } = req.params;
    const { director_name, director_detail } = req.body;

    if (!director_name || !director_detail) {
        return res.status(400).json({ error: 'Name and detail are required' });
    }

    db.query(
        'UPDATE director SET director_name = ?, director_detail = ? WHERE director_id = ?',
        [director_name, director_detail, id],
        (err, result) => {
            if (err) {
                console.error('Error updating director:', err); // Log chi tiết lỗi
                return res.status(500).json({ error: 'Error updating director' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Director not found' });
            }
            
            res.status(200).json({ message: 'Director updated successfully!' });
        }
    );
};

// Xóa đạo diễn
exports.deleteDirector = (req, res) => {
    const { id } = req.params;
    
    db.query(
        'DELETE FROM director WHERE director_id = ?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Error deleting director' });
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Director not found' });
            }
            
            res.status(200).json({ message: 'Director deleted successfully!' });
        }
    );
};
