const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

// Lấy danh sách diễn viên
router.get('/', actorController.getActors);

// Thêm diễn viên mới
router.post('/', actorController.createActor);

module.exports = router;
