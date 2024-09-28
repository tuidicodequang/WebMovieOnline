const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');
require('dotenv').config();


// Đăng ký người dùng
exports.register = (req, res) => {
    const { username, password, name } = req.body;
    if (!username || !password || !name) return res.status(400).json({ error: 'Username and password are required' });
  //  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO Users (username, password, role, detail) VALUES (?, ?, ?, ?)', [username, password, 'user', name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error registering user', details: err.message });
    res.status(201).json({ message: 'User created successfully!' });
});

};

// Đăng nhập
exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Authentication failed' });

        const user = results[0];
        const passwordValid = bcrypt.compareSync(password, user.password);

        if (!passwordValid) return res.status(401).json({ message: 'Authentication failed' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    });
};
