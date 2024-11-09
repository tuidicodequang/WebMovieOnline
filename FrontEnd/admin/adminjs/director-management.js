import { checkAuth } from './auth.js';
import { displayError, escapeHtml } from './utils.js';

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

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadDirectors();
    }
});
export { loadDirectors };