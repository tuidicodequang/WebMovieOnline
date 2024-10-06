// Xác thực JWT
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Access denied. No token provided.');
        window.location.href = 'ForntEnd/login.html';
    }
}


// 
document.addEventListener('DOMContentLoaded', function() {
    fetchUsers();

    function fetchUsers() {
        fetch('/admin') 
            .then(response => response.json())
            .then(users => {
                const userTableBody = document.querySelector('tbody');
                userTableBody.innerHTML = '';

                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.status}</td>
                        <td>
                            <button>Edit</button>
                            <button>Delete</button>
                        </td>
                    `;
                    userTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error loading users:', error);
            });
    }
});
