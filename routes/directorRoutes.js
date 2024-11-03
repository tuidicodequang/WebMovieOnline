// routes/directorRoutes.js
const express = require('express');
const router = express.Router();
const directorController = require('../controllers/directorController');

// Lấy danh sách đạo diễn
router.get('/', directorController.getDirectors);

// Thêm đạo diễn mới 
router.post('/', directorController.createDirector);

// Sửa thông tin đạo diễn
router.put('/:id', directorController.updateDirector);

// Xóa đạo diễn
router.delete('/:id', directorController.deleteDirector);

module.exports = router;
