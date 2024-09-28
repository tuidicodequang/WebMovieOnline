const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./middlewares/loggerMiddleware');
const errorHandler = require('./middlewares/errorMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');
const mysql = require('mysql2');
const path = require('path');
// Khởi tạo ứng dụng
const app = express();

// Sử dụng bodyParser để phân tích dữ liệu JSON
app.use(bodyParser.json());

// Sử dụng middleware để ghi log các yêu cầu đến server
app.use(logger);

// Kết nối đến cơ sở dữ liệu
require('./config/db');

app.use(express.static(path.join(__dirname, 'FrontEnd')));
// Route chính để kiểm tra server
app.use(express.json()); // Để xử lý các yêu cầu với dữ liệu JSON
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd', 'index.html'));
});
// Định nghĩa các route (Movies, Categories, Users, Admin...)
app.use('/movies', authMiddleware, require('./routes/movieRoutes'));
app.use('/categories', authMiddleware, require('./routes/categoryRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/admin', authMiddleware, require('./middlewares/roleMiddleware')('admin'), require('./routes/adminRoutes'));

// Xử lý lỗi cuối cùng
app.use(errorHandler);

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
