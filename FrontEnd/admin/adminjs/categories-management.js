import { encodeId,decodeId} from './Crypto.js';
import {  displaySidebarMovies} from'./movie-management.js';
export async function loadCategories() {
    try {   
        const response = await fetch('/categories', { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Lỗi khi tải categories');
        }
        
        const categories = await response.json();
        return categories;

    } catch (error) {
        console.error('Lỗi khi load categories:', error);
        return [];
    }
}

export async function loadCategoryData(categorySlug) {
    try {
        const response = await fetch(`/movies/category/${categorySlug}`);
        
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
           alert('Không tìm thấy danh mục phim');
            return;
        }
        console.log(data)
        displayCategoryMovies(data);
    } catch (error) {
        console.error('Lỗi khi load dữ liệu category:', error);
       alert('Có lỗi xảy ra khi tải dữ liệu');
    }
}


export async function displayCategories() {
    try {
        const categories = await loadCategories();
        const dropdown = document.querySelector('.dropdown');
        const ITEMS_PER_COLUMN = 7;

        if (!dropdown) {
            throw new Error('Không tìm thấy element .dropdown');
        }

        const numberOfColumns = Math.ceil(categories.length / ITEMS_PER_COLUMN);
        dropdown.innerHTML = '';
        
        const columnContainer = document.createElement('div');
        columnContainer.className = 'dropdown-columns';
        dropdown.appendChild(columnContainer);

        for (let i = 0; i < numberOfColumns; i++) {
            const column = document.createElement('ul');
            column.className = 'dropdown-column';
            
            const startIndex = i * ITEMS_PER_COLUMN;
            const endIndex = Math.min(startIndex + ITEMS_PER_COLUMN, categories.length);
            
            for (let j = startIndex; j < endIndex; j++) {
                const category = categories[j];
                const li = document.createElement('li');
                const a = document.createElement('a');
                
                const categorySlug = category.category_slug || category.slug;
                const categoryName = category.category_name || category.name;
                
                a.href = `/categories.html?category=${categorySlug}`;
                a.textContent = categoryName;
                a.addEventListener('click', (e) => {
                    localStorage.setItem('currentCategory', JSON.stringify({
                        slug: categorySlug,
                        name: categoryName
                    }));
                });
                
                li.appendChild(a);
                column.appendChild(li);
            }
            
            columnContainer.appendChild(column);
        }

    } catch (error) {
        console.error('Lỗi khi hiển thị categories:', error);
    }
}



export function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('category');
    
    if (categorySlug) {
        loadCategoryData(categorySlug);
        const categoryInfo = JSON.parse(localStorage.getItem('currentCategory') || '{}');
        const pageTitle = document.getElementById('category-title');
        if (pageTitle && categoryInfo.name) {
            pageTitle.textContent = `Danh mục: ${categoryInfo.name}`;
        }
    }
}


export function displayCategoryMovies(data) {
    Loadsidebar();
    try {
        const productContainer = document.querySelector('.MovieCategories .row');
        if (!productContainer) {
            console.error('Không tìm thấy container .col-lg-4 col-md-6 col-sm-6');
            return;
        }

        // Xóa nội dung cũ
        productContainer.innerHTML = '';

        if (data.category && data.category.name) {
            const categoryTitle = document.querySelector('.product__page__title .section-title');
            if (categoryTitle) {
                const categoriesMoviesHeading = document.createElement('h5');
                categoriesMoviesHeading.textContent = `Danh mục: ${data.category.name}`;
                categoryTitle.innerHTML = '';
                categoryTitle.appendChild(categoriesMoviesHeading);
            }
            const breadcrumbSpan = document.querySelector('.breadcrumb__links span');
            if (breadcrumbSpan) {
                breadcrumbSpan.textContent = data.category.name;
            }
        }

        if (data.movies.length === 0) {
            const noMoviesDiv = document.createElement('div');
            noMoviesDiv.className = 'section-title';
            
            const noMoviesHeading = document.createElement('h7');
            noMoviesHeading.textContent = 'hiện chưa có phim nào trong thư mục này.';
            
            noMoviesDiv.appendChild(noMoviesHeading);
            productContainer.appendChild(noMoviesDiv);
        }

        data.movies.forEach(movie => {
            if (!movie) return;

            const movieHTML = `
                <div class="col-lg-4 col-md-6 col-sm-6">
                    <div class="product__item">
                        <div class="product__item__pic set-bg" data-setbg="${movie.poster || 'https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg'}">
                            <div class="ep">${movie.Movie_Length || 'N/A'} phút</div>
                             <div class="comment"><i class="fa fa-comments"></i> ${movie.comments || getRandomViews(10, 50)}</div>
                        <div class="view"><i class="fa fa-eye"></i> ${movie.views || getRandomViews(1000, 10000)}</div>
                        </div>
                        <div class="product__item__text">
                            <ul>
                                ${Array.isArray(movie.categories) 
                                    ? movie.categories.map(category => `<li>${category}</li>`).join('')
                                    : movie.categories.split(', ').map(category => `<li>${category}</li>`).join('')
                                }
                            </ul>
                                  <h5><a href="anime-details.html?id=${encodeId(movie.movie_id)}">${((movie.title))}</a></h5>
                        </div>
                    </div>
                </div>
            `;
            
            productContainer.insertAdjacentHTML('beforeend', movieHTML);
        });

 
        initSetBgImage();

    } catch (error) {
        console.error('Lỗi khi hiển thị phim:', error);
        alert('Có lỗi xảy ra khi hiển thị danh sách phim');
    }
}
function initSetBgImage() {
    const elements = document.querySelectorAll('.set-bg');
    elements.forEach(element => {
        let bgUrl = element.getAttribute('data-setbg');  
        element.style.backgroundImage = `url(${bgUrl})`;
    });
}
function getRandomViews(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function Loadsidebar() {
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
    const movies = await response.json();
    displaySidebarMovies(movies);

    
}


document.addEventListener('DOMContentLoaded', () => {
     displayCategories();
});