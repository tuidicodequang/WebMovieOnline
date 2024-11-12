const express = require('express');
const router = express.Router();
const watchHistoryController = require('../controllers/watchHistoryController');

// Lấy lịch sử xem của người dùng
router.get('/:username', watchHistoryController.getWatchHistory);

// Thêm phim vào lịch sử xem
router.post('/', watchHistoryController.saveWatchHistory);

// Xóa lịch sử xem
router.delete('/:id_watch_history', watchHistoryController.deleteWatchHistory);

module.exports = router;
