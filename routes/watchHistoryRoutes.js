const express = require('express');
const router = express.Router();
const watchHistoryController = require('../controllers/watchHistoryController');

// Lấy lịch sử xem của người dùng
router.get('/:userId', watchHistoryController.getWatchHistoryByUserId);

// Thêm phim vào lịch sử xem
router.post('/', watchHistoryController.addMovieToHistory);

// Xóa lịch sử xem
//router.delete('/:userId/:movieId', watchHistoryController.deleteMovieFromHistory);

module.exports = router;
