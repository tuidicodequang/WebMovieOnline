const Movie = require('../models/Movie');
const db = require('../config/db');


// Lấy danh sách phim cùng thể loại
exports.getMovies = (req, res) => {
    const query = `
    SELECT m.*, 
       GROUP_CONCAT(DISTINCT c.category_name SEPARATOR ', ') AS categories,
       GROUP_CONCAT(DISTINCT a.actor_name SEPARATOR ', ') AS actors,
       GROUP_CONCAT(DISTINCT d.director_name SEPARATOR ', ') AS director
FROM movies m
LEFT JOIN movie_category mc ON m.movie_id = mc.movie_id
LEFT JOIN categories c ON mc.category_id = c.category_id
LEFT JOIN movie_actor ma ON m.movie_id = ma.movie_id
LEFT JOIN actors a ON ma.actor_id = a.actor_id
LEFT JOIN movie_director md ON m.movie_id = md.movie_id
LEFT JOIN director d ON md.director_id = d.director_id
GROUP BY m.movie_id;
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching movies with categories' });
        res.status(200).json(results);
    });
};


exports.createMovie = (req, res) => {
    const { title, release_date, description, poster, video_url, avg_rating, movie_length, actors, directors, categories } = req.body;

    // Log dữ liệu nhận được từ client
    console.log('Received data:', req.body);

    if (!title || !release_date) return res.status(400).json({ error: 'Title and release date are required' });

    // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: 'Transaction error' });

        db.query('INSERT INTO Movies (title, release_date, description, poster, video_url, avg_rating, Movie_Length) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, release_date, description, poster, video_url, avg_rating, movie_length], (err, result) => {
            if (err) {
                console.error('Error creating movie:', err); // Log lỗi khi thêm phim
                return db.rollback(() => {
                    return res.status(500).json({ error: 'Error creating movie' });
                });
            }

            const movieId = result.insertId; // Lấy ID của phim mới tạo
            console.log('New movie ID:', movieId); // Log ID phim mới

            // Thêm liên kết giữa phim và diễn viên
            if (actors && actors.length > 0) {
                const actorValues = actors.map(actor => [movieId, actor.actor_id]);
                db.query('INSERT INTO movie_actor (movie_id, actor_id) VALUES ?', [actorValues], (err) => {
                    if (err) {
                        console.error('Error linking actors:', err); // Log lỗi khi liên kết diễn viên
                        return db.rollback(() => {
                            return res.status(500).json({ error: 'Error linking actors' });
                        });
                    }
                });
            }

            // Thêm liên kết giữa phim và đạo diễn
            if (directors && directors.length > 0) {
                const directorValues = directors.map(director => [movieId, director.director_id]);
                db.query('INSERT INTO movie_director (movie_id, director_id) VALUES ?', [directorValues], (err) => {
                    if (err) {
                        console.error('Error linking directors:', err); // Log lỗi khi liên kết đạo diễn
                        return db.rollback(() => {
                            return res.status(500).json({ error: 'Error linking directors' });
                        });
                    }
                });
            }

            // Thêm liên kết giữa phim và thể loại
            if (categories && categories.length > 0) {
                const categoryValues = categories.map(category => [movieId, category.category_id]);
                db.query('INSERT INTO movie_category (movie_id, category_id) VALUES ?', [categoryValues], (err) => {
                    if (err) {
                        console.error('Error linking categories:', err); // Log lỗi khi liên kết thể loại
                        return db.rollback(() => {
                            return res.status(500).json({ error: 'Error linking categories' });
                        });
                    }
                });
            }

            // Cam kết transaction
            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Transaction commit error' });
                    });
                }
                res.status(201).json({ message: 'Movie created successfully!' });
            });
        });
    });
};


// Xóa phim
exports.deleteMovie = async (req, res) => {
    const movieId = req.params.id;
    console.log(`Yêu cầu xóa phim với ID: ${movieId}`);

    if (!movieId) return res.status(400).json({ error: 'Movie ID is required' });

    // Sử dụng Promise để xử lý bất đồng bộ
    const executeQuery = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    try {
        // Xóa các bản ghi trong bảng movie_director
        await executeQuery('DELETE FROM movie_director WHERE movie_id = ?', [movieId]);
        await executeQuery('DELETE FROM movie_category WHERE movie_id = ?', [movieId]);
        await executeQuery('DELETE FROM movie_actor WHERE movie_id = ?', [movieId]);
        await executeQuery('DELETE FROM reviews WHERE movie_id = ?', [movieId]);
        
        // Cuối cùng xóa bản ghi trong bảng Movies
        const result = await executeQuery('DELETE FROM Movies WHERE movie_id = ?', [movieId]);

        if (result.affectedRows === 0) {
            console.log(`Không tìm thấy phim với ID: ${movieId}`);
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json({ message: 'Movie deleted successfully!' });
    } catch (error) {
        console.error('Error during movie deletion:', error);
        res.status(500).json({ error: 'Error deleting movie' });
    }
};
exports.getMovieById = (req, res) => {
    const movieId = req.params.id;
    
    // Query chính để lấy thông tin phim
    const movieQuery = `
        SELECT * FROM movies WHERE movie_id = ?
    `;

    // Query lấy actors
    const actorsQuery = `
        SELECT a.actor_id, a.actor_name
        FROM actors a
        JOIN movie_actor ma ON a.actor_id = ma.actor_id
        WHERE ma.movie_id = ?
    `;

    // Query lấy directors
    const directorsQuery = `
        SELECT d.director_id, d.director_name
        FROM director d
        JOIN movie_director md ON d.director_id = md.director_id
        WHERE md.movie_id = ?
    `;

    // Query lấy categories
    const categoriesQuery = `
        SELECT c.category_id, c.category_name
        FROM categories c
        JOIN movie_category mc ON c.category_id = mc.category_id
        WHERE mc.movie_id = ?
    `;

    // Thực hiện tất cả các queries
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(movieQuery, [movieId], (err, results) => {
                if (err) reject(err);
                resolve(results[0]); // Lấy phim đầu tiên
            });
        }),
        new Promise((resolve, reject) => {
            db.query(actorsQuery, [movieId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(directorsQuery, [movieId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(categoriesQuery, [movieId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        })
    ])
    .then(([movie, actors, directors, categories]) => {
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Kết hợp tất cả dữ liệu
        const movieData = {
            ...movie,
            actors: actors,
            directors: directors,
            categories: categories
        };

        res.status(200).json(movieData);
    })
    .catch(error => {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ error: 'Error fetching movie details' });
    });
};
// Cập nhật thông tin phim
exports.updateMovie = (req, res) => {
    const movieId = req.params.id;
    const { 
        title, 
        release_date, 
        description, 
        poster, 
        video_url, 
        avg_rating, 
        movie_length,
        actors,
        directors,
        categories 
    } = req.body;

    if (!movieId || !title || !release_date) {
        return res.status(400).json({ error: 'Movie ID, title, and release date are required' });
    }

    db.beginTransaction(async (err) => {
        if (err) return res.status(500).json({ error: 'Transaction error' });

        try {
            // Cập nhật thông tin cơ bản của phim
            await new Promise((resolve, reject) => {
                db.query(
                    'UPDATE Movies SET title = ?, release_date = ?, description = ?, poster = ?, video_url = ?, avg_rating = ?, Movie_Length = ? WHERE movie_id = ?',
                    [title, release_date, description, poster, video_url, avg_rating, movie_length, movieId],
                    (err, result) => {
                        if (err) reject(err);
                        if (result.affectedRows === 0) reject(new Error('Movie not found'));
                        resolve();
                    }
                );
            });

            // Xóa các liên kết cũ
            await Promise.all([
                new Promise((resolve, reject) => {
                    db.query('DELETE FROM movie_actor WHERE movie_id = ?', [movieId], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    db.query('DELETE FROM movie_director WHERE movie_id = ?', [movieId], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    db.query('DELETE FROM movie_category WHERE movie_id = ?', [movieId], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                })
            ]);

            // Thêm liên kết mới
            if (actors && actors.length > 0) {
                const actorValues = actors.map(actor => [movieId, actor.actor_id]);
                await new Promise((resolve, reject) => {
                    db.query('INSERT INTO movie_actor (movie_id, actor_id) VALUES ?', [actorValues], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            }

            if (directors && directors.length > 0) {
                const directorValues = directors.map(director => [movieId, director.director_id]);
                await new Promise((resolve, reject) => {
                    db.query('INSERT INTO movie_director (movie_id, director_id) VALUES ?', [directorValues], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            }

            if (categories && categories.length > 0) {
                const categoryValues = categories.map(category => [movieId, category.category_id]);
                await new Promise((resolve, reject) => {
                    db.query('INSERT INTO movie_category (movie_id, category_id) VALUES ?', [categoryValues], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            }

            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error committing transaction' });
                    });
                }
                res.status(200).json({ message: 'Movie updated successfully' });
            });

        } catch (error) {
            return db.rollback(() => {
                console.error('Error updating movie:', error);
                res.status(500).json({ error: 'Error updating movie' });
            });
        }
    });
};
