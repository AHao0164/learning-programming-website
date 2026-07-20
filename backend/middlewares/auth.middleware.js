const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Bạn chưa đăng nhập để truy cập tài nguyên này",
            });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn",
            });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Từ chối truy cập: Chỉ admin mới có quyền thực hiện hành động này" 
        });
    }
};
