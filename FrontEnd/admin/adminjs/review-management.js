import { encodeId,decodeId} from './Crypto.js';

export async function loadMovieReviews(movieId) {
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/reviews/${movieId}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Lỗi khi tải reviews');
    
        const reviews = await response.json();
        if (!Array.isArray(reviews)) {
            console.error('Dữ liệu reviews không phải là mảng:', reviews);
            return;
        }
        displayReviews(reviews);
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

function displayReviews(reviews) {

    const reviewsContainer = document.querySelector('.anime__details__review');
    reviewsContainer.innerHTML = ''; // Xóa nội dung cũ
  
    reviews.forEach(review => {
      const reviewItem = document.createElement('div');
      reviewItem.classList.add('anime__review__item');
  
      reviewItem.innerHTML = `
        <div class="anime__review__item__pic">
          <img src="img/anime/review-${review.review_id % 6 + 1}.jpg" alt="">
        </div>
        <div class="anime__review__item__text">
          <h6>${review.username} - <span>${formatTimeDifference(review.created_at)}</span></h6>
          <p>${review.comment}</p>
        </div>
      `;
  
      reviewsContainer.appendChild(reviewItem);
    });
  }



export async function postComment(movieId, rating, commentText) {
  try {
    const token = localStorage.getItem('token');
    const user_name = parseJwt(token);
    const response = await fetch('/reviews', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: user_name,
        movie_id: decodeId(movieId),
        rating: rating,
        comment: commentText
      })
    });

    if (response.ok) {
      const newReview = await response.json();
      await loadMovieReviews(decodeId(movieId));
      return newReview;
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}

function parseJwt(token) {
    try {
        // Lấy phần payload của token (phần thứ 2 sau dấu .)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload).username;
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}


  function formatTimeDifference(createAt) {
    // Chuyển đổi createAt thành đối tượng Date
    const createDate = new Date(createAt);
    const now = new Date();
    
    // Tính khoảng thời gian chênh lệch tính bằng milliseconds
    const diffMs = now - createDate;
    
    // Chuyển đổi sang các đơn vị thời gian
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Xử lý các trường hợp
    if (diffSeconds < 60) {
        return "vài giây trước";
    } else if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    } else {
        return `${diffDays} ngày trước`;
    }
}

