const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');
require('dotenv').config();


// Đăng ký người dùng
exports.register = (req, res) => {
    const { username, password, name } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !password || !name) {
        return res.status(400).json({ mess: 'Username, password, and name are required' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Thực hiện truy vấn để thêm người dùng vào cơ sở dữ liệu
    db.query('INSERT INTO Users (username, password, role, detail) VALUES (?, ?, ?, ?)', [username, hashedPassword, 'user', name], (err, result) => {
        if (err) {
            return res.status(401).json({ mess: 'Error registering user', details: err.message });
        }

        // Trả về phản hồi thành công
        return res.status(401).json({ mess: 'Tạo tài khoản thành công' });
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

        if (!passwordValid ) return res.status(401).json({ message: 'Authentication failed' });
        // tạo token
        const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        
        // Gửi token về client
        res.status(200).json({ token });
       // return res.redirect("/index.html")
    });
};

