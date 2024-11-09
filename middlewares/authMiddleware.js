 
const jwt = require('jsonwebtoken');

// Middleware để kiểm tra xác thực
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ message: 'vui lòng đăng nhập lại' });
    }

    // Xác minh token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user;
        next(); 
    });
};

module.exports = authenticateToken;
