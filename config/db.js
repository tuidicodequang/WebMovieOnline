// config/db.js
const mysql = require('mysql2');
const dotenv=require('dotenv');


dotenv.config({path:'./.env'})
const connection = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
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
