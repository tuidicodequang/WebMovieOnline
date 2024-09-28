 
// Middleware để xử lý lỗi
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // In lỗi ra console

    // Trả về phản hồi lỗi
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack // Chỉ hiển thị stack trong môi trường phát triển
    });
};

module.exports = errorHandler;
