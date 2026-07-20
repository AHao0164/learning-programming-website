const crypto = require('crypto');
const qs = require('qs');
const Course = require('../../models/course.model');
const Enrollment = require('../../models/enrollment.model');
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://127.0.0.1:5173').replace(/\/+$/, '');

const formatDate = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};

// @desc    Tạo URL Thanh toán VNPay
// @route   POST /api/v1/payment/create_url
exports.createPaymentUrl = async (req, res) => {
    try {
        const { courseId, userId } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Khóa học không tồn tại' });

        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
        
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        const date = new Date();
        const createDate = formatDate(date);
        
        const orderId = `${userId}_${courseId}_${date.getTime()}`; 
        const amount = course.price;

        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': `Thanh toan khoa hoc ${course.slug}`,
            'vnp_OrderType': 'other',
            'vnp_Amount': amount * 100,
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate
        };

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ success: true, url: vnpUrl });
    } catch (error) {
        console.error("Lỗi tạo URL VNPay:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    VNPay trả kết quả về sau khi user thanh toán xong
// @route   GET /api/v1/payment/vnpay_return
exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    
    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");     

    // Kiểm tra chữ ký hợp lệ
    if (secureHash === signed) {
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const orderIdInfo = vnp_Params['vnp_TxnRef'];

        // Mã 00 nghĩa là giao dịch thành công
        if (responseCode === '00') {
            const [userId, courseId] = orderIdInfo.split('_');

            const actualPrice = parseInt(vnp_Params['vnp_Amount']) / 100;

            try {
                const existEnrollment = await Enrollment.findOne({ userId, courseId });
                if (!existEnrollment) {
                    await Enrollment.create({ userId, courseId, enrolledPrice: actualPrice });
                }
                
                const course = await Course.findById(courseId);
                const slug = course ? course.slug : '';

                return res.redirect(`${FRONTEND_URL}/payment/success?courseSlug=${slug}`);
            } catch (err) {
                return res.redirect(`${FRONTEND_URL}/payment/error`);
            }
        } else {
            const [userId, courseId] = orderIdInfo.split('_');
            
            try {
                const course = await Course.findById(courseId);
                const slug = course ? course.slug : '';
                return res.redirect(`${FRONTEND_URL}/payment/failed?courseSlug=${slug}`);
            } catch (err) {
                return res.redirect(`${FRONTEND_URL}/payment/failed`);
            }
        }
    } else {
        return res.redirect(`${FRONTEND_URL}/payment/error`);
    }
};
