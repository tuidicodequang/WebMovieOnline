// ===================== Authentication =====================
export async function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    
    // Danh sách các trang không yêu cầu xác thực
    const publicPages = [
        '/', 
        '/index.html', 
        '/login.html', 
        '/register.html', 
        '/anime-details.html',
        '/blog.html'
    ];


    if (publicPages.includes(currentPath)) {
        return true;
    }
  
    if (!token) {
       makepopup();
       console.error('Lỗi xác thực:', error);
       localStorage.removeItem('token');
       window.location.href = '/login.html';
        return false;
    }
}

//======================Logout================================
document.getElementById('logoutButton').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

export async function makepopup(){
    // Tạo popup
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    popup.style.zIndex = '1000';
    popup.innerHTML = `
        <h2>Thông Báo</h2>
        <p>Vui lòng đăng nhập để tiếp tục</p>
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <button id="loginPopupBtn" style="background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px;">Đăng Nhập</button>
            <button id="cancelPopupBtn" style="background-color: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px;">Hủy</button>
        </div>
    `;

    // Nút đăng nhập
    popup.querySelector('#loginPopupBtn').addEventListener('click', () => {
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
        window.location.href = '/login.html';
    });

    // Nút hủy
    popup.querySelector('#cancelPopupBtn').addEventListener('click', () => {
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
        window.location.href = '/index.html';
    });

    // Overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '999';

    // Thêm popup và overlay vào body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
 }
