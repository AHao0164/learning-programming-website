const Course = require('../../models/course.model');
const Chapter = require('../../models/chapter.model');
const Lesson = require('../../models/lesson.model');
const slugify = require('slugify');

const createFuzzyRegex = (str) => {
    const map = {
        'a': '[aAáÁàÀảẢãÃạẠăĂắẮằẰẳẲẵẴặẶâÂấẤầẦẩẨẫẪậẬ]',
        'e': '[eEéÉèÈẻẺẽẼẹẸêÊếẾềỀểỂễỄệỆ]',
        'i': '[iIíÍìÌỉỈĩĨịỊ]',
        'o': '[oOóÓòÒỏỎõÕọỌôÔốỐồỒổỔỗỖộỘơƠớỚờỜởỞỡỠợỢ]',
        'u': '[uUúÚùÙủỦũŨụỤưƯứỨừỪửỬữỮựỰ]',
        'y': '[yYýÝỳỲỷỶỹỸỵỴ]',
        'd': '[dDđĐ]'
    };
    return str.split('').map(char => {
        const lowerChar = char.toLowerCase();
        if (map[lowerChar]) return map[lowerChar];
        return char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }).join('');
};

const createSlug = (text) => slugify(text, { lower: true, strict: true, locale: 'vi' });

// @desc    1. Tạo khóa học mới
// @route   POST /api/v1/admin/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, thumbnail } = req.body;
    
    if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên khóa học không được để trống' });
    }
    if (price !== undefined && (isNaN(price) || price < 0)) {
        return res.status(400).json({ success: false, message: 'Giá khóa học không hợp lệ' });
    }

    const slug = createSlug(title);

    const course = await Course.create({ title, slug, description, price, thumbnail });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật thông tin Khóa học
// @route   PUT /api/v1/admin/courses/:courseId
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, thumbnail } = req.body;

    if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên khóa học không được để trống' });
    }
    if (price !== undefined && (isNaN(price) || price < 0)) {
        return res.status(400).json({ success: false, message: 'Giá khóa học không hợp lệ' });
    }

    const slug = title ? createSlug(title) : undefined;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      { title, slug, description, price, thumbnail },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa Khóa học VÀ TOÀN BỘ dữ liệu liên quan (Chương, Bài học, Bài tập)
// @route   DELETE /api/v1/admin/courses/:courseId
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });

    const Problem = require('../../models/problem.model');

    const chapters = await Chapter.find({ courseId: courseId });
    const chapterIds = chapters.map(c => c._id);

    const lessons = await Lesson.find({ chapterId: { $in: chapterIds } });
    const lessonIds = lessons.map(l => l._id);

    // 3. Xóa theo thứ tự từ con lên cha (Tránh lỗi mồ côi)
    await Problem.deleteMany({ linkedLessonId: { $in: lessonIds } });
    await Lesson.deleteMany({ chapterId: { $in: chapterIds } });
    await Chapter.deleteMany({ courseId: courseId });
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ success: true, message: 'Đã xóa khóa học và toàn bộ dữ liệu liên quan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    2. Thêm Chương mới vào Khóa học
// @route   POST /api/v1/admin/courses/:courseId/chapters
exports.createChapter = async (req, res) => {
  try {
    const { title, order } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên chương không được để trống' });
    }
    if (order !== undefined && isNaN(order)) {
        return res.status(400).json({ success: false, message: 'Thứ tự chương phải là một số' });
    }
    const chapter = await Chapter.create({ 
      courseId: req.params.courseId, 
      title, 
      order 
    });
    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật tên Chương (hoặc thứ tự)
// @route   PUT /api/v1/admin/chapters/:chapterId
exports.updateChapter = async (req, res) => {
  try {
    const { title, order } = req.body;
    if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên chương không được để trống' });
    }
    if (order !== undefined && isNaN(order)) {
        return res.status(400).json({ success: false, message: 'Thứ tự chương phải là một số' });
    }
    
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.chapterId,
      { title, order },
      { new: true, runValidators: true }
    );

    if (!updatedChapter) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương' });
    }

    res.status(200).json({ success: true, data: updatedChapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa Chương VÀ toàn bộ Bài học bên trong
// @route   DELETE /api/v1/admin/chapters/:chapterId
exports.deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.chapterId;
    
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương' });
    }

    await Lesson.deleteMany({ chapterId: chapterId });

    await Chapter.findByIdAndDelete(chapterId);

    res.status(200).json({ 
        success: true, 
        message: 'Đã xóa chương và toàn bộ bài học bên trong thành công' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    3. Thêm Bài học mới vào Chương
// @route   POST /api/v1/admin/chapters/:chapterId/lessons
exports.createLesson = async (req, res) => {
  try {
    const { title, order, type } = req.body;
    
    if (!title || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên bài học không được để trống' });
    }
    const validTypes = ['video', 'text', 'quiz', 'coding', 'theory'];
    if (!type || !validTypes.includes(type)) {
        return res.status(400).json({ success: false, message: 'Loại bài học không hợp lệ' });
    }

    const slug = createSlug(title);

    const lesson = await Lesson.create({
      chapterId: req.params.chapterId,
      title,
      slug,
      order,
      type // 'video', 'text', 'quiz', 'coding'
    });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    4. Cập nhật Nội dung Bài học (Lưu JSON của Editor.js)
// @route   PUT /api/v1/admin/lessons/:lessonId
exports.updateLesson = async (req, res) => {
  try {
    const { title, videoUrl, content, materials, type } = req.body;
    
    if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên bài học không được để trống' });
    }
    if (type !== undefined) {
        const validTypes = ['video', 'text', 'quiz', 'coding', 'theory'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: 'Loại bài học không hợp lệ' });
        }
    }
    
    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      { 
        title, 
        type,
        videoUrl, 
        content,
        materials,
        slug: title ? createSlug(title) : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    }

    res.status(200).json({ success: true, data: updatedLesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 Khóa học kèm toàn bộ Chương và Bài học
// @route   GET /api/v1/admin/courses/:courseId
exports.getAdminCourseById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    const chapters = await Chapter.find({ courseId: course._id }).sort('order').lean();
    
    for (let chapter of chapters) {
      const lessons = await Lesson.find({ chapterId: chapter._id }).sort('order').lean();
      chapter.lessons = lessons; 
    }
    
    course.modules = chapters; 

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy toàn bộ Khóa học kèm theo Chương và Bài học (Hỗ trợ phân trang)
// @route   GET /api/v1/admin/courses
exports.getAdminCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
        query.title = new RegExp(createFuzzyRegex(search), 'i');
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean();

    for (let course of courses) {
      const chapters = await Chapter.find({ courseId: course._id }).sort('order').lean();
      
      for (let chapter of chapters) {
        const lessons = await Lesson.find({ chapterId: chapter._id }).sort('order').lean();
        chapter.lessons = lessons;
      }
      
      course.modules = chapters; 
    }

    res.status(200).json({ 
        success: true, 
        data: courses,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa Bài học VÀ Bài tập bên trong
// @route   DELETE /api/v1/admin/lessons/:lessonId
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    }

    const Problem = require('../../models/problem.model');
    await Problem.deleteMany({ linkedLessonId: lessonId });

    await Lesson.findByIdAndDelete(lessonId);

    res.status(200).json({ success: true, message: 'Đã xóa bài học và toàn bộ bài tập bên trong' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Gạt công tắc Xuất bản / Ẩn Khóa học
// @route   PATCH /api/v1/admin/courses/:courseId/publish
exports.togglePublishCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        
        if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });

        course.isPublished = !course.isPublished;
        await course.save();

        res.status(200).json({ 
            success: true, 
            message: course.isPublished ? 'Đã xuất bản khóa học!' : 'Đã ẩn khóa học!',
            isPublished: course.isPublished 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};