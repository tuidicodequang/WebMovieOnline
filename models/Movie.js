class Movie {
    constructor(movie_id, title, release_date, description, poster, movieLength, video_url, avg_rating) {
        this.movie_id = movie_id;
        this.title = title;
        this.release_date = release_date;
        this.description = description;
        this.poster = poster;
        this.movieLength = movieLength;
        this.video_url = video_url;
        this.avg_rating = avg_rating;  
    }
}

module.exports = Movie;
