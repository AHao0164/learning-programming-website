// backend/controllers/auth/auth.controller.js

const User = require('../../models/user.model');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://127.0.0.1:5173').replace(/\/+$/, '');

// @desc    Đăng ký tài khoản
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ: Tên, Email và Mật khẩu.' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Định dạng email không hợp lệ.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu quá ngắn, phải có ít nhất 6 ký tự.' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }
    next(err);
  }
};

// @desc    Đăng nhập
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });
    }

    if (user.status === 'locked') {
        return res.status(403).json({ 
            success: false, 
            message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để biết thêm chi tiết.' 
        });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        xp: user.xp || 0,
        streak: user.streak || 0,
        activityLog: user.activityLog || {}
    }
  });
};

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name
    };

    if (req.file) {
        fieldsToUpdate.avatar = `/uploads/${req.file.filename}`;
    } else if (req.body.avatar) {
        fieldsToUpdate.avatar = req.body.avatar;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cập nhật mật khẩu
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ mật khẩu cũ và mới' });
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Quên mật khẩu (Gửi email)
// @route   POST /api/v1/auth/forgotpassword
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy email này' });

        const resetToken = user.getResetPasswordToken();

        await User.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    resetPasswordToken: user.resetPasswordToken,
                    resetPasswordExpire: user.resetPasswordExpire
                } 
            }
        );

        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
            <h3>Bạn vừa yêu cầu đặt lại mật khẩu!</h3>
            <p>Vui lòng click vào đường dẫn bên dưới để đặt lại mật khẩu của bạn (Có hiệu lực trong 10 phút):</p>
            <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:10px 20px; background-color:#f05123; color:white; text-decoration:none; border-radius:5px;">Đặt Lại Mật Khẩu</a>
            <p>Nếu bạn không yêu cầu việc này, hãy bỏ qua email này.</p>
        `;

        try {
            await sendEmail({ email: user.email, subject: 'Khôi phục mật khẩu - HK Learning', message });
            res.status(200).json({ success: true, message: 'Email đã được gửi!' });
        } catch (err) {
            // console.log(err);
            await User.updateOne({ _id: user._id }, { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } });
            return res.status(500).json({ success: false, message: 'Không thể gửi email' });
        }
    } catch (err) { next(err); }
};

// @desc    Đặt lại mật khẩu mới
// @route   PUT /api/v1/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await User.updateOne(
            { _id: user._id },
            { 
                $set: { password: hashedPassword },
                $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 }
            }
        );

        const updatedUser = await User.findById(user._id);
        sendTokenResponse(updatedUser, 200, res);
    } catch (err) { next(err); }
};

// @desc    Đăng nhập bằng Google
// @route   POST /api/v1/auth/google
exports.googleLogin = async (req, res, next) => {
    try {
        const { tokenId } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = crypto.randomBytes(10).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name: name,
                email: email,
                password: hashedPassword,
                avatar: picture
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error("Lỗi đăng nhập Google:", err);
        res.status(401).json({ success: false, message: 'Xác thực Google thất bại!' });
    }
};
