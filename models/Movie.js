class Movie {
    constructor(id, title, release_date, description, poster, video_url) {
        this.id = id;
        this.title = title;
        this.release_date = release_date;
        this.description = description;
        this.poster = poster;
        this.video_url = video_url;
    }
}

module.exports = Movie;
