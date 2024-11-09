// login-utils.js
export function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload.username) {
          return {
            isLoggedIn: true,
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
      isLoggedIn: false,
      username: null
    };
  }
  
  export function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
  
  export function viewUserInfo() {
    // Thêm code để hiển thị thông tin chi tiết người dùng
    alert('Chức năng đang được phát triển');
  }