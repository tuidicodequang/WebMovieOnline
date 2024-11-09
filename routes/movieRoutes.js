const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Lấy danh sách phim
router.get('/', movieController.getMovies);

//Lấy thông tin phim theo id
router.get('/:id',movieController.getMovieById);

// Thêm phim mới
router.post('/', movieController.createMovie);

// Xóa Phim
router.delete('/:id', movieController.deleteMovie);

//Cập nhật phim
router.put('/:id', movieController.updateMovie);


module.exports = router;
