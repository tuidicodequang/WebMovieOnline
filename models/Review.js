class Review {
    constructor(review_id, user_id, movie_id, rating, comment, created_at) {
        this.review_id = review_id; 
        this.user_id = user_id;
        this.movie_id = movie_id;
        this.rating = rating;
        this.comment = comment;
        this.created_at = created_at;
    }
}

module.exports = Review;
