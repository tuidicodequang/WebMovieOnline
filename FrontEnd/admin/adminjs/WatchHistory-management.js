import {  displaySidebarMovies} from'./movie-management.js';
import { encodeId,decodeId} from './Crypto.js';

export async function Getusername() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            if (tokenPayload.username) {
                return {
                    username: tokenPayload.username,
                };
            } else {
                console.warn('Token không chứa username.');
            }
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }
    return {
        username: null
    };
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
export async function loadWatchHistory() {
    Loadsidebar();
    const loader = document.querySelector('.loader2'); 
    loader.style.display = 'block'
    try {
        // Kiểm tra username
        const { username } = await Getusername();
        if (!username) {
            throw new Error('Username is required');
        }

        // Lấy token và gọi API
        const token = localStorage.getItem('token');
        const response = await fetch(`/watch-history/${username}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi tải lịch sử xem');
        }

        const responseData = await response.json();
        
        if (!responseData.success || !responseData.data) {
            throw new Error('Cấu trúc dữ liệu không hợp lệ');
        }

        const history = responseData.data;
        if (!Array.isArray(history)) {
            throw new Error('Dữ liệu lịch sử không phải là mảng');
        }

        // Load tất cả duration cùng lúc
        const durationPromises = history.map(item => 
            loadActualDuration(item.video_url)
                .catch(err => {
                    console.warn(`Lỗi khi load duration cho video ${item.movie_id}:`, err);
                    return 100;
                })
        );

        const durations = await Promise.all(durationPromises);
        const mappedHistory = history.map((item, index) => ({
            id_watch_history: item.id_watch_history,
            movie_id: item.movie_id,
            title: item.title || 'Không có tiêu đề',
            thumbnail: item.poster || 'https://www.shutterstock.com/image-vector/image-icon-600nw-211642900.jpg',
            genre: item.genres || 'Chưa phân loại',
            watched_at: item.last_watched_at,
            last_watch_position: item.position || 0,
            total_duration:durations[index]
        }));

        await displayWatchHistory(mappedHistory);

    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
    finally {
        loader.style.display = 'none';
    }
    
}
function displayWatchHistory(historyItems) {
    const historyContainer = document.querySelector('.history-list');
    historyContainer.innerHTML = '';

    historyItems.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item-1');

        const genres = Array.isArray(item.genre) ? item.genre.join(', ') : item.genre;
       
        historyItem.innerHTML = `
           <img src="${item.thumbnail} " alt="${item.title}">
            <div class="history-info-1">
                <button class="delete-btn" onclick="deleteHistoryItem(${item.id_watch_history})">×</button>
                <h3 class="title">
                    <a href="/anime-watching.html?movieId=${encodeId(item.movie_id)}&position=${item.last_watch_position}" style="text-decoration: none; color: inherit;">
                        ${item.title}
                    </a>
                </h3>
                <div class="meta">Thể loại: ${genres}</div>
                <div class="timestamp">${formatTimeDifference(item.watched_at)}</div>
                <div class="duration">${formatDuration(item.last_watch_position)} / ${formatDuration(item.total_duration)}</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${calculateProgress(item.last_watch_position, item.total_duration)}%"></div>
            </div>
        `;
        const deleteButton = historyItem.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => deleteHistoryItem(item.id_watch_history));

        historyContainer.appendChild(historyItem);
    });
}


async function loadActualDuration(urlmovie) {
    const videoElement = document.createElement('video');
    videoElement.src = urlmovie;
    return new Promise(resolve => {
        videoElement.addEventListener('loadedmetadata', () => {
            resolve(videoElement.duration);
        });
    });
}

window.deleteHistoryItem = async function(historyId) {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa lịch sử xem này không?");
    if (!confirmDelete) {
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/watch-history/${historyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Lỗi khi xóa lịch sử xem');
        loadWatchHistory();
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

export async function saveWatchHistory(movieId, position) {
    try {
        const { username } = await Getusername();
        if (!username) {
            throw new Error('Username is required');
        }

        // Lấy token
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }
        const now = new Date();
        const formattedTime = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');


        // Chuẩn bị dữ liệu để gửi
        const watchData = {
            username: username,
            movie_id: decodeId(movieId),
            position: Math.floor(position),
            last_watched_at:formattedTime
        };
        // Gọi API để lưu lịch sử
        const response = await fetch('/watch-history', {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(watchData)
        });

        if (!response.ok) {
            throw new Error('Failed to save watch history');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving watch history:', error);
        throw error;
    }
}

function formatTimeDifference(timestamp) {
    const now = new Date();
    const watchedTime = new Date(timestamp);
    const diffInMilliseconds = now - watchedTime;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return 'Vừa mới xem';
    }
    if (diffInMinutes === 1) {
        return 'Đã xem 1 phút trước';
    }
    if (diffInMinutes < 60) {
        return `Đã xem ${diffInMinutes} phút trước`;
    }
    if (diffInHours === 1) {
        return 'Đã xem 1 giờ trước';
    }
    if (diffInHours < 24) {
        return `Đã xem ${diffInHours} giờ trước`;
    }
    if (diffInDays === 1) {
        return 'Đã xem 1 ngày trước';
    }
    return `Đã xem ${diffInDays} ngày trước`;
}


function formatDuration(seconds) {
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}


function calculateProgress(currentPosition, totalDuration) {
    return (currentPosition / totalDuration) * 100;
}

if (window.location.pathname === '/watch-history.html') {
    document.addEventListener('DOMContentLoaded', loadWatchHistory);
}