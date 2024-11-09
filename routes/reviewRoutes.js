const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Lấy danh sách đánh giá cho phim
router.get('/:movie_id', reviewController.getReviews);

//Lấy danh sách đánh giá
router.get('/',reviewController.getAllReviews);

// Thêm đánh giá mới
router.post('/', reviewController.createReview);

// Xóa đánh giá
router.delete('/:review_id', reviewController.deleteReview);

module.exports = router;