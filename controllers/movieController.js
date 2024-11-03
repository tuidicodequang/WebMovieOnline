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



// Thêm phim mới
exports.createMovie = (req, res) => {
    const { title, release_date, description, poster, video_url } = req.body;
    if (!title || !release_date) return res.status(400).json({ error: 'Title and release date are required' });

    db.query('INSERT INTO Movies (title, release_date, description, poster, video_url) VALUES (?, ?, ?, ?, ?)',
        [title, release_date, description, poster, video_url], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error creating movie' });
        res.status(201).json({ message: 'Movie created successfully!' });
    });
};
