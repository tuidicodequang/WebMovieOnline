// routes/actorRoutes.js
const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

// Lấy danh sách diễn viên
router.get('/', actorController.getActors);

// Thêm diễn viên mới 
router.post('/', actorController.createActor);

// Sửa thông tin diễn viên
router.put('/:id', actorController.updateActor);

// Xóa diễn viên
router.delete('/:id', actorController.deleteActor);

module.exports = router;
