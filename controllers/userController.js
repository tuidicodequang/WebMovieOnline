const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');
require('dotenv').config();


// Đăng ký người dùng
exports.register = async (req, res) => {
    const { username, password, confirmPassword, name } = req.body;

    try {
        // Kiểm tra các trường bắt buộc
        if (!username || !password || !name) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 8 ký tự'
            });
        }

        // Kiểm tra mật khẩu xác nhận
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            });
        }

        // Kiểm tra username đã tồn tại
        const [existingUser] = await db.promise().query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Thêm người dùng vào database
        await db.promise().query('INSERT INTO Users (username, password, role, detail) VALUES (?, ?, ?, ?)', 
            [username, hashedPassword, 'user', name]);

        // Trả về phản hồi thành công
        return res.status(200).json({
            success: true,
            message: 'Tạo tài khoản thành công'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
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

//Lấy thông tin người dùng
exports.getUsers = (req, res) => {
    db.query('SELECT user_id, username, role, detail FROM Users', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching users' });
        res.status(200).json(results);
    });
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role, detail } = req.body;  // Các trường cần cập nhật
    
    try {
        // Kiểm tra người dùng tồn tại hay không
        const [existingUser] = await db.promise().query('SELECT * FROM Users WHERE user_id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Cập nhật thông tin người dùng
        await db.promise().query('UPDATE Users SET username = ?, role = ?, detail = ? WHERE user_id = ?', 
            [username || existingUser[0].username, role || existingUser[0].role, detail || existingUser[0].detail, id]);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật người dùng thành công'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Kiểm tra người dùng tồn tại hay không
        const [existingUser] = await db.promise().query('SELECT * FROM Users WHERE user_id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Xóa người dùng
        await db.promise().query('DELETE FROM Users WHERE user_id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

exports.changePassword = async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    console.log (username,currentPassword,newPassword)
    try {
        // Kiểm tra người dùng tồn tại
        const [existingUser] = await db.promise().query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }
        if (!bcrypt.compareSync(currentPassword,existingUser[0].password)) {
            console.log(existingUser[0].password)
            console.log(bcrypt.hashSync(currentPassword, 10))
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
                
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 8 ký tự'
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await db.promise().query('UPDATE Users SET password = ? WHERE username = ?', [hashedPassword, username]);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật mật khẩu thành công'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};