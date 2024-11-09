import { checkAuth } from './auth.js';
import { displayError, escapeHtml } from './utils.js';

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

    // Gán sự kiện cho các nút Delete
    const deleteButtons = tbody.querySelectorAll('.delete-actor-btn');
    deleteButtons.forEach(button => {
        button.removeEventListener('click', handleActorDelete);
        button.addEventListener('click', handleActorDelete);
    });

    // Gán sự kiện cho các nút Update (nếu có)
    const updateButtons = tbody.querySelectorAll('.update-actor-btn');
    updateButtons.forEach(button => {
        button.removeEventListener('click', handleActorUpdate);
        button.addEventListener('click', handleActorUpdate);
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

        button.closest('tr').remove();
        alert('Xóa diễn viên thành công');

        loadActors();
    } catch (error) {
        console.error('Lỗi:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa diễn viên');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadActors();
    }
});

export { loadActors };
