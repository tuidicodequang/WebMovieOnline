// ===================== Authentication =====================
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Access denied. No token provided.');
        window.location.href = 'ForntEnd/login.html';
        return false;
    }
    return true;
}

// ===================== Utility Functions =====================
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

// ===================== Event Listeners =====================
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadUsers();
    }
});

//======================Logout================================
document.getElementById('logoutButton').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});
// ===================== User Management =====================
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

    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(String(user.user_id))}</td>
            <td>${escapeHtml(String(user.username))}</td>
            <td>${escapeHtml(String(user.role))}</td>
            <td>${escapeHtml(String(user.detail))}</td>
            <td>
                <button class="update-btn" data-id="${user.user_id}">Update</button>
                <button class="delete-btn" data-id="${user.user_id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('update-btn')) {
        const userId = event.target.dataset.id;
        const row = event.target.closest('tr');
        const usernameCell = row.querySelector('td:nth-child(2)');
        const roleCell = row.querySelector('td:nth-child(3)');
        const detailCell = row.querySelector('td:nth-child(4)');

        // Chuyển đổi các ô thành trường nhập liệu
        usernameCell.innerHTML = `<input type="text" value="${usernameCell.textContent}" class="edit-username">`;
        const currentRole = roleCell.textContent.trim().toLowerCase();
        roleCell.innerHTML = `
            <select class="edit-role">
                <option value="user" ${currentRole === 'user' ? 'selected' : ''}>User</option>
                <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
        `;
        detailCell.innerHTML = `<input type="text" value="${detailCell.textContent}" class="edit-detail">`;

        // Thay đổi nút "Update" thành "Save"
        event.target.textContent = 'Save';
        event.target.classList.remove('update-btn');
        event.target.classList.add('save-btn');
    } else if (event.target.classList.contains('save-btn')) {
        const userId = event.target.dataset.id;
        const row = event.target.closest('tr');

        const newUsername = row.querySelector('.edit-username').value;
        const newRole = row.querySelector('.edit-role').value;
        const newDetail = row.querySelector('.edit-detail').value;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/users/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername, role: newRole, detail: newDetail })
            });

            if (!response.ok) {
                throw new Error('Lỗi khi cập nhật người dùng');
            }

            // Cập nhật giao diện người dùng sau khi lưu thành công
            row.querySelector('td:nth-child(2)').textContent = newUsername;
            row.querySelector('td:nth-child(3)').textContent = newRole;
            row.querySelector('td:nth-child(4)').textContent = newDetail;

            // Đổi nút "Save" trở lại thành "Update"
            event.target.textContent = 'Update';
            event.target.classList.remove('save-btn');
            event.target.classList.add('update-btn');

            alert('Cập nhật người dùng thành công');
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi cập nhật người dùng');
        }
    }
});

document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('delete-btn')) {
        const userId = event.target.dataset.id;

        if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/users/delete/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi xóa người dùng');
                }

                alert('Người dùng đã được xóa');
                loadUsers();
            } catch (error) {
                console.error('Lỗi:', error);
                alert('Có lỗi xảy ra khi xóa người dùng');
            }
        }
    }
});

document.getElementById('add-user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const name = document.getElementById('name')?.value;
    const confirmPassword = document.getElementById('comfirm_password')?.value;

    if (!username || !confirmPassword || !password || !name) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    if (password !== confirmPassword) {
        alert('Mật khẩu và xác nhận mật khẩu không khớp');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, password,confirmPassword, name }),
        });

        // Kiểm tra nếu phản hồi không ok
        if (!response.ok) {
            const errorData = await response.json(); // Lấy dữ liệu lỗi từ phản hồi
            throw new Error(errorData.message || 'Lỗi không xác định từ server'); // Nếu không có thông báo lỗi cụ thể, sử dụng thông báo mặc định
        }

        alert('Người dùng mới đã được thêm thành công');
        loadUsers();
    } catch (error) {
        console.error('Lỗi:', error);
        alert(error.message);
    }
});