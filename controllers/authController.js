const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');

// Đăng ký người dùng
exports.register = (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'User created successfully!' });
    });
};

// Đăng nhập
exports.login = (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Authentication failed' });

        const user = results[0];
        const passwordValid = bcrypt.compareSync(password, user.password);

        if (!passwordValid) return res.status(401).json({ message: 'Authentication failed' });

        const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
        res.status(200).json({ token });
    });
};
