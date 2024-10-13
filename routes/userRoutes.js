const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Đăng ký người dùng
router.post('/register', userController.register);

// Đăng nhập
router.post('/login', userController.login);

// load thông tin người dùng
router.get('/loaduser', userController.getUsers);

module.exports = router;



// // Thêm các route cho quản lý người dùng trong admin
// router.post('/admin/add', userController.addUser); // Thêm người dùng
// router.put('/admin/:id', userController.updateUser); // Cập nhật người dùng
// router.delete('/admin/:id', userController.deleteUser); // Xóa người dùng