// ===================== Authentication =====================
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập!!');
        window.location.href = '/login.html';
        return false; 
    } 
    return true; 
}

//======================Logout================================
document.getElementById('logoutButton').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

export { checkAuth };