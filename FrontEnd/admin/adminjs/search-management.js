import { encodeId,decodeId} from './Crypto.js';

 export async function loadMoviesFromSearch(searchTerm) {
    try {
        const response = await fetch(`/movies/search/${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Xử lý trường hợp chưa đăng nhập
                alert('Vui lòng đăng nhập để xem nội dung này');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.movies) {
           alert('Không tìm thấy phim phù hợp');
            return;
        }
        console.log(data.movies)
        displaySearchMovie(data.movies,(searchTerm));
    } catch (error) {
        console.error('Lỗi khi load dữ liệu tìm kiếm:', error);
       alert('Có lỗi xảy ra khi tải dữ liệu');
    }
}
export function displaySearchMovie(searchItems,searchString) {
    const searchListContainer = document.querySelector('.search-list');
    const searchTitleElement = document.querySelector('.template-title');
    searchListContainer.innerHTML = '';
  
    // Cập nhật tiêu đề
    searchTitleElement.textContent = `Kết quả tìm kiếm cho từ khóa:  ${(searchString)}(${searchItems.length})`;
    searchItems.forEach(item => {
       if(item.poster==null)
       {
        item.poster='https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg';
       }
      const searchItem = document.createElement('div');
      searchItem.classList.add('search-item');
  
      searchItem.innerHTML = `
        <img src="${item.poster}" alt="${item.title}">
        <div class="search-info">
          <h3 class="title">
            <a href="/movie-detail.html?movieId=${encodeId(item.movie_id)}" style="text-decoration: none; color: inherit;">
              ${item.title}
            </a>
          </h3>
          <div class="meta">Thể loại: ${item.categories.join(', ')}</div>
          <div class="meta">Đánh giá: ${item.avg_rating} ☆</div>
        </div>
      `;
  
      searchListContainer.appendChild(searchItem);
    });
  }
  window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('q');
    console.log(searchTerm);
    loadMoviesFromSearch(searchTerm);
  };