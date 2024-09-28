const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Lấy danh sách đánh giá cho phim
router.get('/:movie_id', reviewController.getReviews);

// Thêm đánh giá mới
router.post('/', reviewController.createReview);

module.exports = router;
