document.addEventListener('DOMContentLoaded', async function() {
    console.log('Movie action page loaded');
    
    const form = document.getElementById('addMovieForm');
    const submitButton = document.getElementById('submitMovie');
    let isEditMode = false;
    let movieId = null;

    // Kiểm tra xem có phải mode edit không
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        isEditMode = true;
        movieId = urlParams.get('id');
        await loadMovieData(movieId);
        submitButton.textContent = 'Cập nhật phim';
        // Cập nhật tiêu đề form
        document.querySelector('h2').textContent = 'Cập nhật phim';
    }

    // Load initial data
    loadActorsForSelect();
    loadDirectorsForSelect();
    loadCategoriesForSelect();

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formData = collectFormData();
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const url = isEditMode ? `/movies/${movieId}` : '/movies';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error ${isEditMode ? 'updating' : 'adding'} movie`);
            }

            alert(`Movie ${isEditMode ? 'updated' : 'added'} successfully!`);
            
            // Redirect về trang movie list sau khi thành công
         window.location.href = 'movies.html';
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });
});

// Function to load movie data for editing
async function loadMovieData(movieId) {
    try {
        const response = await fetchWithAuth(`/movies/${movieId}`);
        if (!response.ok) throw new Error('Error loading movie data');
        
        const movie = await response.json();
        console.log('Loaded movie data:', movie);
        
        // Fill form fields
        document.getElementById('title').value = movie.title || '';
        
        // Format date to YYYY-MM-DD for input type="date"
        if (movie.release_date) {
            // Đảm bảo date là một chuỗi hợp lệ trước khi tạo Date object
            const date = new Date(movie.release_date);
            if (!isNaN(date.getTime())) { // Kiểm tra date hợp lệ
                const formattedDate = date.toISOString().split('T')[0];
                document.getElementById('release_date').value = formattedDate;
            }
        }
        
        // Fill các trường riêng biệt và kiểm tra kiểu dữ liệu
        document.getElementById('description').value = movie.description || '';
        document.getElementById('poster').value = movie.poster || '';
        document.getElementById('video_url').value = movie.video_url || '';
        
        // Chuyển đổi và kiểm tra các giá trị số
        const avgRating = parseFloat(movie.avg_rating);
        document.getElementById('avg_rating').value = !isNaN(avgRating) ? avgRating : 0;
        
        const movieLength = parseInt(movie.Movie_Length); // Chú ý viết hoa "Movie_Length"
        document.getElementById('movie_length').value = !isNaN(movieLength) ? movieLength : 0;

        // Update poster preview
        updatePosterPreview();

        // Clear existing tags
        document.getElementById('selectedActors').innerHTML = '';
        document.getElementById('selectedDirectors').innerHTML = '';
        document.getElementById('selectedCategorys').innerHTML = '';

        // Add actors tags - kiểm tra mảng trước khi duyệt
        if (Array.isArray(movie.actors)) {
            const selectedActors = document.getElementById('selectedActors');
            movie.actors.forEach(actor => {
                if (actor && actor.actor_id && actor.actor_name) {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.textContent = actor.actor_name;
                    tag.dataset.id = actor.actor_id;
                    tag.onclick = () => tag.remove();
                    selectedActors.appendChild(tag);
                }
            });
        }

        // Add directors tags - kiểm tra mảng trước khi duyệt
        if (Array.isArray(movie.directors)) {
            const selectedDirectors = document.getElementById('selectedDirectors');
            movie.directors.forEach(director => {
                if (director && director.director_id && director.director_name) {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.textContent = director.director_name;
                    tag.dataset.id = director.director_id;
                    tag.onclick = () => tag.remove();
                    selectedDirectors.appendChild(tag);
                }
            });
        }

        // Add categories tags - kiểm tra mảng trước khi duyệt
        if (Array.isArray(movie.categories)) {
            const selectedCategories = document.getElementById('selectedCategorys');
            movie.categories.forEach(category => {
                if (category && category.category_id && category.category_name) {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.textContent = category.category_name;
                    tag.dataset.id = category.category_id;
                    tag.onclick = () => tag.remove();
                    selectedCategories.appendChild(tag);
                }
            });
        }

    } catch (error) {
        console.error('Error loading movie data:', error);
        alert('Error loading movie data');
    }
}
// Existing helper functions
function validateForm() {
    const title = document.getElementById('title').value;
    const releaseDate = document.getElementById('release_date').value;

    if (!title.trim()) {
        alert('Title is required');
        return false;
    }

    if (!releaseDate) {
        alert('Release date is required');
        return false;
    }

    return true;
}

function collectFormData() {
    return {
        title: document.getElementById('title').value,
        release_date: document.getElementById('release_date').value,
        description: document.getElementById('description').value,
        poster: document.getElementById('poster').value,
        video_url: document.getElementById('video_url').value,
        avg_rating: parseFloat(document.getElementById('avg_rating').value) || 0,
        movie_length: parseInt(document.getElementById('movie_length').value) || 0,
        actors: Array.from(document.getElementById('selectedActors').children)
            .map(tag => ({ actor_id: parseInt(tag.dataset.id) })),
        directors: Array.from(document.getElementById('selectedDirectors').children)
            .map(tag => ({ director_id: parseInt(tag.dataset.id) })),
        categories: Array.from(document.getElementById('selectedCategorys').children)
            .map(tag => ({ category_id: parseInt(tag.dataset.id) }))
    };
}
// Hàm tải danh sách reviews của phim
async function loadMovieReviews(movieId) {
    try {
        // Gọi API lấy danh sách reviews
        const response = await fetchWithAuth(`/reviews/${movieId}`);
        if (!response.ok) throw new Error('Lỗi khi tải reviews');
        
        const reviews = await response.json();
        displayReviews(reviews);
        
        // Hiển thị panel reviews và điều chỉnh layout
        document.querySelector('.reviews-panel').style.display = 'block';
        document.querySelector('.form-container').classList.add('with-reviews');
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

// Hàm hiển thị reviews lên giao diện
function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviewsList');
    reviewsContainer.innerHTML = '';
    console.log(reviews)
    // Kiểm tra nếu không có reviews
    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="no-reviews">Chưa có đánh giá nào cho phim này</div>';
        return;
    }

    // Tạo element cho mỗi review
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.dataset.reviewId = review.review_id;

        const date = new Date(review.created_at).toLocaleDateString('vi-VN');
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="review-username">${escapeHtml(review.username)}</div>
                    <div class="review-date">${date}</div>
                </div>
                <div class="review-rating">
                    ★ <span>${review.rating}</span>
                </div>
            </div>
            <div class="review-content">${escapeHtml(review.comment)}</div>
            <button class="delete-review" onclick="deleteReview(${review.review_id})">×</button>
        `;

        reviewsContainer.appendChild(reviewCard);
    });
}

// Hàm xóa review
async function deleteReview(reviewId) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Lỗi khi xóa review');

        // Xóa review khỏi giao diện
        const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`);
        if (reviewCard) {
            reviewCard.remove();
        }

        // Kiểm tra nếu không còn review nào
        const reviewsContainer = document.getElementById('reviewsList');
        if (!reviewsContainer.children.length) {
            reviewsContainer.innerHTML = '<div class="no-reviews">Chưa có đánh giá nào cho phim này</div>';
        }
    } catch (error) {
        console.error('Lỗi khi xóa review:', error);
        alert('Không thể xóa đánh giá');
    }
}

// Sửa đổi hàm loadMovieData để tải thêm reviews
const originalLoadMovieData = loadMovieData;
loadMovieData = async function(movieId) {
    await originalLoadMovieData(movieId);
    await loadMovieReviews(movieId);
};