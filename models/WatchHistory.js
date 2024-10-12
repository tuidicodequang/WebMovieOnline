class WatchHistory {
    constructor(watch_history_id, user_id, movie_id, last_watch_position, watched_at) {
        this.watch_history_id = watch_history_id;
        this.user_id = user_id;
        this.movie_id = movie_id;
        this.last_watch_position = last_watch_position;
        this.watched_at = watched_at;
    }
}

module.exports = WatchHistory;
