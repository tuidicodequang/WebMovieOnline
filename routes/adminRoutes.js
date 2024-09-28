const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Quản lý diễn viên
router.get('/actors', adminController.getActors);
router.post('/actors', adminController.createActor);
router.delete('/actors/:id', adminController.deleteActor);

// Quản lý phim
router.get('/movies', adminController.getMovies);
router.post('/movies', adminController.createMovie);
router.delete('/movies/:id', adminController.deleteMovie);

// Quản lý thể loại
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Quản lý người dùng
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);

// Quản lý đánh giá
router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;
