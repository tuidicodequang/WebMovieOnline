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
        loadUsers()
        loadActors();
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
    if (!Array.isArray(users)) {
        console.error('Dữ liệu người dùng không phải là một mảng hợp lệ:', users);
        return;
    }

    const tbody = document.querySelector('#user-list');
    if (!tbody) {
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
            throw new Error(errorData.message || 'Lỗi không xác định từ server');
        }

        alert('Người dùng mới đã được thêm thành công');
        loadUsers();
    } catch (error) {
        console.error('Lỗi:', error);
        alert(error.message);
    }
});


// ===================== Actor Management =====================
async function loadActors() {
    try {
        console.log('Bắt đầu tải dữ liệu diễn viên...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }
    
        const response = await fetch('/actors', {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Không có quyền truy cập. Vui lòng kiểm tra quyền của tài khoản.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi HTTP! status: ${response.status}`);
        }

        const actors = await response.json();
        console.log('Dữ liệu diễn viên đã nhận:', actors);

        if (!Array.isArray(actors)) {
            console.warn('Dữ liệu nhận được không phải là mảng:', actors);
            throw new Error('Dữ liệu không đúng định dạng');
        }

        displayActors(actors);
    } catch (error) {
        console.error('Chi tiết lỗi khi tải dữ liệu diễn viên:', error);
        displayError(`Lỗi: ${error.message}`);
    }
}
function displayActors(actors) {
    const tbody = document.querySelector('#actors-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    actors.forEach(actor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(String(actor.actor_id))}</td>
            <td>${escapeHtml(actor.actor_name)}</td>
            <td>${escapeHtml(actor.actor_detail)}</td>
            <td>
                <button class="update-actor-btn" data-id="${actor.actor_id}">Update</button>
                <button class="delete-actor-btn" data-id="${actor.actor_id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    tbody?.addEventListener('click', (e) => {
        const target = e.target;
        
        // Xử lý nút Update
        if (target.classList.contains('update-actor-btn')) {
            handleActorUpdate(e);
        }
        
        // Xử lý nút Delete
        if (target.classList.contains('delete-actor-btn')) {
            handleActorDelete(e);
        }
    });
   
}
// Thêm diễn viên
document.getElementById('add-actor-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('actorName')?.value;
    const detail = document.getElementById('actordetail')?.value;
  
    if (!name || !detail) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
  
      const response = await fetch('/actors', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, detail })
      });
  
      if (!response.ok) {
        // Log toàn bộ response để debug
        const responseText = await response.text();
        console.log('Error response:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `Lỗi: ${response.status} - ${response.statusText}`);
        } catch (parseError) {
      
            console.log('Sending data:', { name, detail });
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
      }

      // Nếu thành công
      alert('Diễn viên mới đã được thêm thành công');
      loadActors();
      e.target.reset();
      
    } catch (error) {
      console.error('Chi tiết lỗi:', error);
      alert(error.message || 'Có lỗi xảy ra khi thêm diễn viên');
    }
  });

  function handleActorUpdate(event) {
    const button = event.target;
    const row = button.closest('tr');
    const nameCell = row.querySelector('td:nth-child(2)');
    const detailCell = row.querySelector('td:nth-child(3)');
    
    // Nếu đang ở chế độ chỉnh sửa
    if (button.classList.contains('save-actor-btn')) {
        handleActorSave(event);
    } else {
        // Chuyển sang chế độ chỉnh sửa
        const currentName = nameCell.textContent;
        const currentDetail = detailCell.textContent;
        
        nameCell.innerHTML = `<input type="text" class="edit-name" value="${escapeHtml(currentName)}">`;
        detailCell.innerHTML = `<input type="text" class="edit-detail" value="${escapeHtml(currentDetail)}">`;

        button.textContent = 'Save';
        button.classList.remove('update-actor-btn');
        button.classList.add('save-actor-btn');

        button.removeEventListener('click', handleActorUpdate);
        button.addEventListener('click', handleActorSave);
    }
}

async function handleActorSave(event) {
    try {
        const button = event.target;
        const actorId = button.dataset.id;
        const row = button.closest('tr');
        
        const nameInput = row.querySelector('.edit-name');
        const detailInput = row.querySelector('.edit-detail');
        
        if (!nameInput || !detailInput) {
            console.error('Không tìm thấy input elements');
            return;
        }

        const newName = nameInput.value.trim();
        const newDetail = detailInput.value.trim();

        if (!newName || !newDetail) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch(`/actors/${actorId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                actor_name: newName,
                actor_detail: newDetail
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi cập nhật thông tin diễn viên');
        }

        row.querySelector('td:nth-child(2)').textContent = newName;
        row.querySelector('td:nth-child(3)').textContent = newDetail;

        // Reset nút về chế độ Update
        button.textContent = 'Update';
        button.classList.remove('save-actor-btn');
        button.classList.add('update-actor-btn');

        button.removeEventListener('click', handleActorSave);
        button.addEventListener('click', handleActorUpdate);

        alert('Cập nhật thông tin diễn viên thành công');
    } catch (error) {
        console.error('Chi tiết lỗi:', error);
        alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin diễn viên');
    }
}


async function handleActorDelete(event) {
    const button = event.target;
    const actorId = button.dataset.id;
    
    if (!confirm('Bạn có chắc chắn muốn xóa diễn viên này?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch(`/actors/${actorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi xóa diễn viên');
        }

        // Xóa hàng khỏi bảng
        button.closest('tr').remove();
        alert('Xóa diễn viên thành công');
        
        // Tải lại danh sách để đảm bảo đồng bộ
        loadActors();
    } catch (error) {
        console.error('Lỗi:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa diễn viên');
    }
}

// ===================== Director Management =====================
async function loadDirectors() {
    try {
        console.log('Bắt đầu tải dữ liệu đạo diễn...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }
    
        const response = await fetch('/directors', {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Không có quyền truy cập. Vui lòng kiểm tra quyền của tài khoản.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi HTTP! status: ${response.status}`);
        }

        const directors = await response.json();
        console.log('Dữ liệu đạo diễn đã nhận:', directors);

        if (!Array.isArray(directors)) {
            console.warn('Dữ liệu nhận được không phải là mảng:', directors);
            throw new Error('Dữ liệu không đúng định dạng');
        }

        displayDirectors(directors);
    } catch (error) {
        console.error('Chi tiết lỗi khi tải dữ liệu đạo diễn:', error);
        displayError(`Lỗi: ${error.message}`);
    }
}

function displayDirectors(directors) {
    const tbody = document.querySelector('#directors-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    directors.forEach(director => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(String(director.director_id))}</td>
            <td>${escapeHtml(director.director_name)}</td>
            <td>${escapeHtml(director.director_detail)}</td>
            <td>
                <button class="update-director-btn" data-id="${director.director_id}">Update</button>
                <button class="delete-director-btn" data-id="${director.director_id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Gán sự kiện cho các nút Delete
    const deleteButtons = tbody.querySelectorAll('.delete-director-btn');
    deleteButtons.forEach(button => {
        button.removeEventListener('click', handleDirectorDelete);
        button.addEventListener('click', handleDirectorDelete);
    });

    // Gán sự kiện cho các nút Update (nếu có)
    const updateButtons = tbody.querySelectorAll('.update-director-btn');
    updateButtons.forEach(button => {
        button.removeEventListener('click', handleDirectorUpdate);
        button.addEventListener('click', handleDirectorUpdate);
    });
}

// Thêm đạo diễn
document.getElementById('add-director-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('directorName')?.value;
    const detail = document.getElementById('directordetail')?.value;
  
    if (!name || !detail) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
  
      const response = await fetch('/directors', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, detail })
      });
  
      if (!response.ok) {
        const responseText = await response.text();
        console.log('Error response:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `Lỗi: ${response.status} - ${response.statusText}`);
        } catch (parseError) {
            console.log('Sending data:', { name, detail });
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
      }

      alert('Đạo diễn mới đã được thêm thành công');
      loadDirectors();
      e.target.reset();
      
    } catch (error) {
      console.error('Chi tiết lỗi:', error);
      alert(error.message || 'Có lỗi xảy ra khi thêm đạo diễn');
    }
});

function handleDirectorUpdate(event) {
    const button = event.target;
    const row = button.closest('tr');
    const nameCell = row.querySelector('td:nth-child(2)');
    const detailCell = row.querySelector('td:nth-child(3)');
    
    // Nếu đang ở chế độ chỉnh sửa
    if (button.classList.contains('save-director-btn')) {
        handleDirectorSave(event);
    } else {
        // Chuyển sang chế độ chỉnh sửa
        const currentName = nameCell.textContent;
        const currentDetail = detailCell.textContent;
        
        nameCell.innerHTML = `<input type="text" class="edit-name" value="${escapeHtml(currentName)}">`;
        detailCell.innerHTML = `<input type="text" class="edit-detail" value="${escapeHtml(currentDetail)}">`;

        button.textContent = 'Save';
        button.classList.remove('update-director-btn');
        button.classList.add('save-director-btn');

        button.removeEventListener('click', handleDirectorUpdate);
        button.addEventListener('click', handleDirectorSave);
    }
}

async function handleDirectorSave(event) {
    try {
        const button = event.target;
        const directorId = button.dataset.id;
        const row = button.closest('tr');
        
        const nameInput = row.querySelector('.edit-name');
        const detailInput = row.querySelector('.edit-detail');
        
        if (!nameInput || !detailInput) {
            console.error('Không tìm thấy input elements');
            return;
        }

        const newName = nameInput.value.trim();
        const newDetail = detailInput.value.trim();

        if (!newName || !newDetail) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch(`/directors/${directorId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                director_name: newName,
                director_detail: newDetail
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi cập nhật thông tin đạo diễn');
        }

        row.querySelector('td:nth-child(2)').textContent = newName;
        row.querySelector('td:nth-child(3)').textContent = newDetail;

        // Reset nút về chế độ Update
        button.textContent = 'Update';
        button.classList.remove('save-director-btn');
        button.classList.add('update-director-btn');

        button.removeEventListener('click', handleDirectorSave);
        button.addEventListener('click', handleDirectorUpdate);

        alert('Cập nhật thông tin đạo diễn thành công');
    } catch (error) {
        console.error('Chi tiết lỗi:', error);
        alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin đạo diễn');
    }
}

async function handleDirectorDelete(event) {
    const button = event.target;
    const directorId = button.dataset.id;
    
    if (!confirm('Bạn có chắc chắn muốn xóa đạo diễn này?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Không tìm thấy token xác thực');
        }

        const response = await fetch(`/directors/${directorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi xóa đạo diễn');
        }

        button.closest('tr').remove();
        alert('Xóa đạo diễn thành công');
        
        loadDirectors();
    } catch (error) {
        console.error('Lỗi:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa đạo diễn');
    }
}


// ===================== Movie Management =====================
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


async function loadMovies() {
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
        console.log('Dữ liệu phim đã nhận:', movies);

        if (!Array.isArray(movies)) {
            console.warn('Dữ liệu nhận được không phải là mảng:', movies);
            throw new Error('Dữ liệu không đúng định dạng');
        }

        allMovies = movies; 
        displayMovies(movies);
    } catch (error) {
        console.error('Chi tiết lỗi khi tải dữ liệu phim:', error);
        displayError(`Lỗi: ${error.message}`);
    }
}

// Hàm tìm kiếm gần đúng
function searchMovies() {
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
function filterByCategory() {
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

// Khởi tạo khi trang load
window.onload = async () => {
    await loadCategories();
    await loadMovies();
};

// Handle delete and update functions would go here (similar to handleDirectorDelete, etc.)
async function handleMovieDelete(event) {
    const button = event.target;
    const movieId = button.dataset.id;
    console.log('ID phim cần xóa:', movieId); // Log ID phim

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

// Xử lý cập nhật phim
async function handleMovieUpdate(event) {
    const movieId = event.target.dataset.id;
    // Chuyển hướng sang trang action movie với query parameter
    window.location.href = `movie_action.html?id=${movieId}`;
}


