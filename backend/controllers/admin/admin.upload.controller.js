exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn một file ảnh' });
        }
        // Ví dụ: /uploads/image-167890.jpg
        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ success: true, imageUrl: imageUrl, message: 'Tải ảnh lên thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};