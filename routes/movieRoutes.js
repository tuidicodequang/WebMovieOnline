const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Lấy danh sách phim
router.get('/', movieController.getMovies);

// Thêm phim mới
router.post('/', movieController.createMovie);

module.exports = router;
