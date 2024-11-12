const Review = require('../models/Review');
const db = require('../config/db');

// Lấy danh sách đánh giá cho phim
exports.getReviews = (req, res) => {
    const { movie_id } = req.params;
    const query = `
        SELECT r.*, u.username 
        FROM Reviews r
        JOIN Users u ON r.user_id = u.user_id
        WHERE r.movie_id = ?
        ORDER BY r.created_at DESC
    `;
    
    db.query(query, [movie_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Lỗi khi lấy danh sách đánh giá' });
        res.status(200).json(results);
    });
};

exports.getAllReviews = (req, res) => {
    const query = `
      SELECT 
        reviews.*, 
        movies.title AS movie_title,
        users.username
      FROM reviews
      JOIN movies ON reviews.movie_id = movies.movie_id
      JOIN users ON reviews.user_id = users.user_id
    `;
    
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching reviews' });
      res.status(200).json(results);
    });
};


// Thêm đánh giá mới
exports.createReview = (req, res) => {
    const { username, movie_id, rating, comment } = req.body;
    if (!username || !movie_id || !rating) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Trước tiên, lấy user_id từ username
    const getUserIdQuery = "SELECT user_id FROM Users WHERE username = ?";
    db.query(getUserIdQuery, [username], (err, userResult) => {
        if (err) {
            console.error("Lỗi khi truy vấn user_id:", err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        
        if (!userResult || userResult.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        const user_id = userResult[0].user_id;

        // Sau khi có user_id, thực hiện insert review
        const insertReviewQuery = `
            INSERT INTO Reviews (user_id, movie_id, rating, comment) 
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertReviewQuery, [user_id, movie_id, rating, comment], (err, result) => {
            if (err) {
                console.error("Lỗi khi thêm review:", err);
                return res.status(500).json({ error: 'Lỗi khi thêm đánh giá' });
            }
            
            res.status(201).json({ 
                message: 'Thêm đánh giá thành công!',
                review_id: result.insertId
            });
        });
    });
};
// Xóa đánh giá
exports.deleteReview = (req, res) => {
    const { review_id } = req.params;
    
    db.query('SELECT movie_id FROM Reviews WHERE review_id = ?', [review_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Lỗi khi xóa đánh giá' });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
        }
        
        const movie_id = results[0].movie_id;
        
        // Tiến hành xóa review
        db.query('DELETE FROM Reviews WHERE review_id = ?', [review_id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Lỗi khi xóa đánh giá' });
            
            // Cập nhật rating trung bình của phim
            updateMovieAverageRating(movie_id);
            
            res.status(200).json({ message: 'Xóa đánh giá thành công' });
        });
    });
};

function updateMovieAverageRating(movie_id) {
    const query = `
        UPDATE Movies m 
        SET avg_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM Reviews 
            WHERE movie_id = ?
        )
        WHERE movie_id = ?
    `;
    
    db.query(query, [movie_id, movie_id], (err, result) => {
        if (err) console.error('Lỗi khi cập nhật rating trung bình:', err);
    });
}

module.exports = exports;