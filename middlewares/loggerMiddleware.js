// Middleware để ghi log các yêu cầu đến server
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next(); // Cho phép yêu cầu tiếp tục
};

module.exports = logger;
