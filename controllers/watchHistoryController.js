const WatchHistory = require('../models/WatchHistory');
const db = require('../config/db');

// Lấy lịch sử xem của người dùng
exports.getWatchHistory = async (req, res) => {
    const { username } = req.params;
    
    if (!username) {
        return res.status(400).json({ 
            success: false,
            message: "Username là bắt buộc"
        });
    }

    try {
        const query = `
                    SELECT 
                wh.id_watch_history,
                wh.movie_id,
                wh.last_watched_at,
                wh.position,
                m.poster,
                m.video_url,
                m.title,
                m.Movie_Length AS movie_length,
                GROUP_CONCAT(c.category_name) AS genres
            FROM WatchHistory wh
            INNER JOIN Users u ON wh.user_id = u.user_id
            INNER JOIN Movies m ON wh.movie_id = m.movie_id
            LEFT JOIN movie_category mc ON m.movie_id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.category_id
            WHERE u.username = ?
            GROUP BY wh.id_watch_history
            ORDER BY wh.last_watched_at DESC;
        `;

        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Lỗi khi lấy lịch sử xem:', err);
                return res.status(500).json({
                    success: false,
                    message: "Lỗi server"
                });
            }

            return res.status(200).json({
                success: true,
                message: results.length ? "Lấy lịch sử xem thành công" : "Chưa có lịch sử xem",
                data: results
            });
        });

    } catch (error) {
        console.error('Lỗi khi lấy lịch sử xem:', error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Xóa lịch sử xem của người dùng
exports.deleteWatchHistory = (req, res) => {
    const { id_watch_history } = req.params;

    if (!id_watch_history) {
        return res.status(400).json({
            success: false,
            message: "ID lịch sử xem là bắt buộc"
        });
    }

    const query = 'DELETE FROM watchhistory WHERE id_watch_history = ?';

    db.query(query, [id_watch_history], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa lịch sử xem:', err);
            return res.status(500).json({
                success: false,
                message: "Lỗi server"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lịch sử xem"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa lịch sử xem thành công"
        });
    });
};

exports.saveWatchHistory = async (req, res) => {
    const { username, movie_id, position, last_watched_at } = req.body;
    if (!username || !movie_id || position === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    try {
        // Đầu tiên lấy user_id từ username
        const getUserQuery = `
            SELECT user_id 
            FROM users 
            WHERE username = ? 
            LIMIT 1
        `;
        
        const row = await db.promise().execute(getUserQuery, [username]);
        const [userResult] = row;
        if (!userResult.length) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user_id = userResult[0].user_id;
        const checkQuery = `
            SELECT id_watch_history 
            FROM watchhistory 
            WHERE user_id = ? AND movie_id = ? 
            LIMIT 1
        `;
        
        const rows = await db.promise().execute(checkQuery, [user_id, movie_id]);
        const [existingRecord] = rows
        let result;
        
        if (existingRecord.length > 0) {
            // Nếu đã tồn tại, cập nhật record
            const updateQuery = `
                UPDATE watchhistory 
                SET position = ?, 
                    last_watched_at = ? 
                WHERE id_watch_history = ?
            `;
            
            const  fields = await db.promise().execute(updateQuery, [
                position,
                last_watched_at || new Date().toISOString(),
                existingRecord[0].id_watch_history
            ]);
            [result] = fields;
            return res.json({
                success: true,
                message: 'Watch history updated successfully',
                data: {
                    id_watch_history: existingRecord[0].id_watch_history,
                    user_id,
                    movie_id,
                    position,
                    last_watched_at: last_watched_at || new Date().toISOString()
                }
            });
        } else {
            // Nếu chưa tồn tại, tạo record mới
            const insertQuery = `
                INSERT INTO watchhistory 
                (user_id, movie_id, position, last_watched_at)
                VALUES (?, ?, ?, ?)
            `;
            
            [result] = await db.execute(insertQuery, [
                user_id,
                movie_id,
                position,
                last_watched_at || new Date().toISOString()
            ]);

            return res.json({
                success: true,
                message: 'Watch history created successfully',
                data: {
                    id_watch_history: result.insertId,
                    user_id,
                    movie_id,
                    position,
                    last_watched_at: last_watched_at || new Date().toISOString()
                }
            });
        }

    } catch (error) {
        console.error('Error in saveWatchHistory:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

