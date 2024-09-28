// Middleware để kiểm tra quyền truy cập dựa trên vai trò người dùng
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. You do not have permission.' });
        }
        next();
    };
};

module.exports = authorizeRoles;
