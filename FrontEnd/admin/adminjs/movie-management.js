import { checkAuth } from './auth.js';
import { displayError, escapeHtml } from './utils.js';
import { encodeId,decodeId} from './Crypto.js';
import { loadMovieReviews, postComment} from'./review-management.js';
import{saveWatchHistory}from './WatchHistory-management.js'


let allMovies = [];

async function loadCategories() {
    try {
        console.log('Bắt đầu tải danh sách thể loại...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }
        const response = await fetch('/categories', { 
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status categories:', response.status);
        const categories = await response.json();
        const categorySelect = document.querySelector('#categorySelect');
        categorySelect.innerHTML = '<option value="">Tất cả thể loại</option>';
        
        // Thêm categories mới
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id || category.id;
            option.textContent = category.category_name || category.name;
            categorySelect.appendChild(option);
        });

    } catch (error) {
    }
}

export async function loadMovies() {
    try {
        console.log('Bắt đầu tải dữ liệu phim...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }
    
        const response = await fetch('/movies', {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Không có quyền truy cập. Vui lòng kiểm tra quyền của tài khoản.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi HTTP! status: ${response.status}`);
        }
        const movies = await response.json();
        if (!Array.isArray(movies)) {
            console.warn('Dữ liệu nhận được không phải là mảng:', movies);
            throw new Error('Dữ liệu không đúng định dạng');
        }

        allMovies = movies; 
        displayMovies(movies);
        displayTrendingMovies(movies);
        displayPopularMovies(movies);
        displaySidebarMovies(movies);
    } catch (error) {
    
    }
    return allMovies
}


export function searchMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categorySelect').selectedOptions[0].text;
    
    let filteredMovies = allMovies;

    // Áp dụng cả hai bộ lọc cùng một lúc
    filteredMovies = filteredMovies.filter(movie => {
        // Điều kiện tìm kiếm
        const matchesSearch = searchTerm === '' || // Nếu không có từ khóa tìm kiếm
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.movie_id.toString().includes(searchTerm) ||
            (movie.categories && movie.categories.toLowerCase().includes(searchTerm));
            
        // Điều kiện lọc theo thể loại
        const matchesCategory = categoryFilter === "Tất cả thể loại" || // Nếu không chọn thể loại cụ thể
            (movie.categories && movie.categories.includes(categoryFilter));
            
        // Trả về true nếu thỏa mãn cả hai điều kiện
        return matchesSearch && matchesCategory;
    });

    displayMovies(filteredMovies);
}
export function filterByCategory() {
    searchMovies();
}

function displayMovies(movies) {
    const tbody = document.querySelector('#movies-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (movies.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">Không tìm thấy phim phù hợp</td>';
        tbody.appendChild(row);
        return;
    }

    movies.forEach(movie => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(movie.movie_id?.toString() || '')}</td>
            <td>${escapeHtml(movie.title || '')}</td>
            <td>${escapeHtml(movie.avg_rating?.toString() || '')}</td>
            <td>${escapeHtml(movie.Movie_Length?.toString() || '')}</td>
            <td>${escapeHtml(movie.categories || '')}</td>
            <td>
                <button class="update-movie-btn" data-id="${movie.movie_id}">Update</button>
                <button class="delete-movie-btn" data-id="${movie.movie_id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Gán sự kiện cho các nút
    const deleteButtons = tbody.querySelectorAll('.delete-movie-btn');
    deleteButtons.forEach(button => {
        button.removeEventListener('click', handleMovieDelete);
        button.addEventListener('click', handleMovieDelete);
    });

    const updateButtons = tbody.querySelectorAll('.update-movie-btn');
    updateButtons.forEach(button => {
        button.removeEventListener('click', handleMovieUpdate);
        button.addEventListener('click', handleMovieUpdate);
    });
}
export function displayTrendingMovies(movies) {
    const trendingMovies = movies.slice(0, 6);
    const trendingContainer = document.querySelector('.trendingMovies .row');
 
    trendingContainer.innerHTML = ''; 
   
    trendingMovies.forEach(movie => {
        const movieElement = `
            <div class="col-lg-4 col-md-6 col-sm-6">
                <div class="product__item">
                    <div class="product__item__pic" style="background-image: url('${movie.poster || 'https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg'}')">
                        <div class="ep">${movie.Movie_Length + " phút" || 'N/A'}</div>
                        <div class="comment"><i class="fa fa-comments"></i> ${movie.comments || getRandomViews(10, 50)}</div>
                        <div class="view"><i class="fa fa-eye"></i> ${movie.views || getRandomViews(1000, 10000)}</div>
                    </div>
                    <div class="product__item__text">
                        <h5><a href="anime-details.html?id=${encodeId(movie.movie_id)}">${escapeHtml((movie.title))}</a></h5>
                    </div>
                </div>
            </div>
        `;
        trendingContainer.innerHTML += movieElement;
    });
  
}


 function displayPopularMovies(movies) {
    const popularMovies = getRandomMovies(movies, 6); 
    const popularContainer = document.querySelector('.popularMovies .row');

    popularContainer.innerHTML = ''; 

    popularMovies.forEach(movie => {
        const movieElement = `
              <div class="col-lg-4 col-md-6 col-sm-6">
                <div class="product__item">
                    <div class="product__item__pic" style="background-image: url('${movie.poster || 'https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg'}')">
                        <div class="ep">${movie.Movie_Length +" phút" || 'N/A'}</div>
                          <div class="comment"><i class="fa fa-comments"></i> ${movie.comments ||  getRandomViews(10, 50)}</div>
                        <div class="view"><i class="fa fa-eye"></i> ${movie.views ||  getRandomViews(1000, 10000)}</div>
                    </div>
                    <div class="product__item__text">
                        <h5><a href="anime-details.html?id=${encodeId(movie.movie_id)}">${escapeHtml((movie.title))}</a></h5>
                    </div>
                </div>
            </div>
        `;
        popularContainer.innerHTML += movieElement;
    });
}

export function displaySidebarMovies(movies) {
    const sidebarContainer = document.querySelector('.product__sidebar .filter__gallery');
    const sidebarMovies = getRandomMovies(movies, 3); 

    sidebarMovies.forEach(movie => {
        const movieElement = `
            <div class="product__sidebar__view__item mix" style="background-image: url('${movie.poster || 'https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg'}')">
                <div class="overlay"></div> 
                <div class="ep">${movie.Movie_Length ? movie.Movie_Length + " phút" : 'N/A'}</div>
                <div class="view"><i class="fa fa-eye"></i> ${movie.views || getRandomViews(6000, 10000)}</div>
                 <h5><a href="anime-details.html?id=${encodeId(movie.movie_id)}">${escapeHtml((movie.title))}</a></h5>
            </div>
        `;
        sidebarContainer.innerHTML += movieElement;
    });
}

function getRandomViews(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomMovies(movies, count) {
    const shuffled = movies.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
async function handleMovieDelete(event) {
    const button = event.target;
    const movieId = button.dataset.id;
    console.log('ID phim cần xóa:', movieId); 

    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch(`/movies/${movieId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            const errorData = await response.text();
            console.error('Response was not JSON:', errorData);
            throw new Error('Lỗi khi xóa phim. Vui lòng kiểm tra log server.');
        }

        const data = await response.json();
        alert(data.message);
        button.closest('tr').remove();
        loadMovies();
    } catch (error) {
        console.error('Lỗi:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa phim');
    }
}
export async function loadMovieFormId(movieId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/movies/${decodeId(movieId)}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error loading movie data');
        
        const movie = await response.json();
        console.log('Loaded movie data:', movie);
        return movie;
    } catch (error) {
        console.error('Error loading movie data:', error);
        alert('Error loading movie data');
    }
}
export async function displayDetailMovie(movie) {
    const token = localStorage.getItem('token');
    const response = await fetch('/movies', {
        method: 'GET',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    });
    const movies = await response.json();
    displaySidebarMovies(movies);
    document.querySelector('.anime__details__title h3').textContent = movie.title || '';

    // Poster and views
    document.querySelector('.anime__details__pic').style.backgroundImage = `url(${movie.poster || 'https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg'})`;
    loadMovieReviews(movie.movie_id)
    // Ratings
    const ratingElement = document.querySelector('.anime__details__rating .rating');
    ratingElement.innerHTML = ''; 
    const fullStars = Math.floor(movie.avg_rating || 0);
    const halfStar = (movie.avg_rating % 1) >= 0.5 ? 1 : 0;
    for (let i = 0; i < fullStars; i++) {
        ratingElement.innerHTML += '<a><i class="fa fa-star"></i></a>';
    }
    if (halfStar) {
        ratingElement.innerHTML += '<a ><i class="fa fa-star-half-o"></i></a>';
    }

    // Description
    document.querySelector('.anime__details__text p').textContent = movie.description || '';

    // Detailed information (Type, Studios, Date aired, etc.)
    const detailsListLeft = document.querySelector('.anime__details__widget .col-lg-6.col-md-6 ul:nth-child(1)');
    detailsListLeft.innerHTML = `
        <li><span>Type:</span> ${movie.type || 'Movie'}</li>
       <li><span>Director:</span> ${movie.directors && movie.directors.length > 0 ? movie.directors.map(director => director.director_name).join(', ') : 'NA'}</li>
        <li><span>Date aired:</span> ${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</li>
        <li><span>Status:</span> ${movie.status || 'N/A'}</li>
       <li><span>Genre:</span> ${movie.categories && movie.categories.length > 0 ? movie.categories.map(category => category.category_name).join(', ') : 'NA'}</li>
    `;

    const detailsListRight = document.querySelector('.anime__details__widget .col-lg-6.col-md-6:nth-child(2) ul');
    if (detailsListRight) {
        detailsListRight.innerHTML = `
            <li><span>Rating:</span> ${movie.avg_rating || 'N/A'} / ${movie.rating_times || getRandomViews(100, 500)} times</li>
            <li><span>Duration:</span> ${movie.duration || 'N/A'}</li>
            <li><span>Quality:</span> ${movie.quality || 'HD'}</li>
            <li><span>Views:</span> ${movie.views || getRandomViews(1000, 10000)}</li>
             <li><span>Actor:</span> ${movie.actors && movie.actors.length > 0 ? movie.actors.map(actor => actor.actor_name).join(', ') : 'NA'}</li>
        `;
    }
}

export async function DisplayWatchMovie(movieId, position) {
    try {
        const movie = await loadMovieFormId(movieId);
        const videoSource = movie.video_url;
        const videoElement = document.getElementById('player');

        // Load movie reviews
        loadMovieReviews(movie.movie_id);

        // Cài đặt video source
        videoElement.querySelector('source').src = videoSource;
        videoElement.setAttribute('data-poster', movie.poster || './videos/anime-watch.jpg');
        videoElement.load();

        // Đặt vị trí xem cuối cùng nếu có
        if (position != 0) {
            videoElement.currentTime = position;
        }

      
        let saveTimeout;
        videoElement.addEventListener('timeupdate', () => {
            
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveWatchHistory(movieId, videoElement.currentTime)
                    .catch(err => console.error('Error saving watch position:', err));
            }, 10000); 
        });

        videoElement.addEventListener('pause', () => {
            saveWatchHistory(movieId, videoElement.currentTime)
                .catch(err => console.error('Error saving watch position:', err));
        });

        // Lưu vị trí khi người dùng rời khỏi trang
        window.addEventListener('beforeunload', () => {
            saveWatchHistory(movieId, videoElement.currentTime)
                .catch(err => console.error('Error saving watch position:', err));
        });

    } catch (error) {
        console.error('Error displaying watch movie:', error);
        alert('Error displaying watch movie');
    }
}
// Xử lý cập nhật phim
async function handleMovieUpdate(event) {
    const movieId = event.target.dataset.id;
    // Chuyển hướng sang trang action movie với query parameter
    window.location.href = `movie_action.html?id=${movieId}`;
}


// Khởi tạo khi trang load
window.onload = async () => {
    await checkAuth();
    await loadCategories();
    await loadMovies();
};

