const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Đăng ký người dùng
router.post('/register', userController.register);

// Đăng nhập
router.post('/login', userController.login);

// load thông tin người dùng
router.get('/loaduser', userController.getUsers);

//Cập nhật thông tin người dùng
router.put('/update/:id', userController.updateUser);

//xóa người dùng 
router.delete('/delete/:id', userController.deleteUser);

router.post('/update-password', userController.changePassword);

module.exports = router;




