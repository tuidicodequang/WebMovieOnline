// Xác thực JWT
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Access denied. No token provided.');
        window.location.href = 'ForntEnd/login.html';
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadUsers();
    }
});

async function loadUsers() {
    try {
        console.log('Bắt đầu tải dữ liệu người dùng...');
        
        const token = localStorage.getItem('token');
        const response = await fetch('/users/loaduser', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Phản hồi từ server:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        console.log('Dữ liệu người dùng đã nhận:', users);

        if (!Array.isArray(users) || users.length === 0) {
            throw new Error('Dữ liệu người dùng không hợp lệ hoặc trống');
        }

        displayUsers(users);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        displayError(error.message);
    }
}

function displayUsers(users) {
    const tbody = document.querySelector('#user-list');
    if (!tbody) {
        console.error('Không tìm thấy phần tử tbody#user-list');
        return;
    }

    tbody.innerHTML = ''; // Xóa nội dung cũ

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(String(user.user_id))}</td>
            <td>${escapeHtml(String(user.username))}</td>
            <td>${escapeHtml(String(user.role))}</td>
            <td>${escapeHtml(String(user.detail))}</td>
            <td>
                <button onclick="editUser(${user.user_id})">Edit</button>
                <button onclick="deleteUser(${user.user_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Lỗi: ${message}`;
    document.querySelector('.main')?.prepend(errorDiv);
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return unsafe;
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function editUser(userId) {
    console.log('Chỉnh sửa người dùng có ID:', userId);
    // Triển khai logic chỉnh sửa người dùng ở đây
}

function deleteUser(userId) {
    console.log('Xóa người dùng có ID:', userId);
    // Triển khai logic xóa người dùng ở đây
}

document.getElementById('add-user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const role = document.getElementById('role')?.value;

    if (!username || !email || !password || !role) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, email, password, role }),
        });

        if (!response.ok) {
            throw new Error('Lỗi khi thêm người dùng mới');
        }

        alert('Người dùng mới đã được thêm thành công');
        loadUsers(); // Tải lại danh sách người dùng
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi thêm người dùng mới');
    }
});