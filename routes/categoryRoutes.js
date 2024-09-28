const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Lấy danh sách thể loại
router.get('/', categoryController.getCategories);

// Thêm thể loại mới
router.post('/', categoryController.createCategory);

module.exports = router;
