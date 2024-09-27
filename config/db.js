// config/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tpta1401',
    database: 'web_movie_online',
    insecureAuth : true
});

// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu:', err.stack);
        return;
    }
    console.log('Kết nối đến cơ sở dữ liệu thành công!');
});

module.exports = connection;
