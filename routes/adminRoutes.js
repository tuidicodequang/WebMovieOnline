const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Quản lý diễn viên
router.get('/actors', authenticateToken, authorizeRoles('admin'), adminController.getActors);
router.post('/actors', authenticateToken, authorizeRoles('admin'), adminController.createActor);
//router.delete('/actors/:id', authenticateToken, authorizeRoles('admin'), adminController.deleteActor);

// Quản lý phim
router.get('/movies', authenticateToken, authorizeRoles('admin'), adminController.getMovies);
router.post('/movies', authenticateToken, authorizeRoles('admin'), adminController.createMovie);
//router.delete('/movies/:id', authenticateToken, authorizeRoles('admin'), adminController.deleteMovie);

// Quản lý thể loại
router.get('/categories', authenticateToken, authorizeRoles('admin'), adminController.getCategories);
router.post('/categories', authenticateToken, authorizeRoles('admin'), adminController.createCategory);
//router.delete('/categories/:id', authenticateToken, authorizeRoles('admin'), adminController.deleteCategory);

//  Quản lý người dùng
router.get('/users', authenticateToken, authorizeRoles('admin'), adminController.getUsers);
//router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), adminController.deleteUser);
//router.post('/users/:id', authenticateToken, authorizeRoles('admin'), adminController.updateUser);

// Quản lý đánh giá
router.get('/reviews', authenticateToken, authorizeRoles('admin'), adminController.getReviews);
//router.delete('/reviews/:id', authenticateToken, authorizeRoles('admin'), adminController.deleteReview);

module.exports = router;
