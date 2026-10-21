const crypto = require('crypto');
if (!globalThis.crypto) globalThis.crypto = crypto;
if (!global.crypto) global.crypto = crypto;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Course = require('../models/course.model');
const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');
const Problem = require('../models/problem.model');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-coding-platform';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB...'))
  .catch(err => {
    console.error('❌ Lỗi kết nối DB:', err);
    process.exit(1);
  });

// ============================================================
// SEEDER - 18 KHÓA HỌC E-LEARNING
// ============================================================
const seedAll = async () => {
  const startTime = Date.now();
  
  try {
    console.log('\n🧹 Bắt đầu dọn dẹp dữ liệu cũ...');
    await Promise.all([
      Course.deleteMany({}),
      Chapter.deleteMany({}),
      Lesson.deleteMany({}),
      Problem.deleteMany({})
    ]);
    console.log('✅ Đã xóa toàn bộ dữ liệu cũ\n');

    // ============================================================
    // 3 KHÓA HỌC GỐC (GIỮ NGUYÊN)
    // ============================================================
    console.log('📚 Đang tạo Khóa 1: JavaScript Cơ bản (GỐC)...');
    
    const course1 = await Course.create({
      title: 'Lập trình JavaScript Cơ bản',
      slug: 'javascript-co-ban',
      description: 'Khóa học JS từ con số 0 dành cho người mới bắt đầu. Nền tảng bắt buộc để học ReactJS và Node.js, cung cấp kiến thức nền tảng vững vàng cho sự nghiệp Web Developer.',
      thumbnail: 'https://luca-blogs.vercel.app/static/images/Blog/js-thumbnail-1.jpeg',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c1_chap1 = await Chapter.create({ courseId: course1._id, title: 'Chương 1: Bắt đầu với JavaScript', order: 1 });
    
    await Lesson.create({ 
      chapterId: c1_chap1._id, 
      title: 'Giới thiệu khóa học & Phương pháp học', 
      slug: 'c1-gioi-thieu', 
      order: 1, 
      type: 'video', 
      videoUrl: 'https://www.youtube.com/watch?v=0SJE9dYdpps', 
      content: { 
        time: Date.now(), 
        blocks: [
          { type: "header", data: { text: "Tài liệu học tập đính kèm", level: 2 } }, 
          { type: "paragraph", data: { text: "Bên cạnh việc xem video ở trên, bạn có thể tham khảo thêm các tài liệu hoặc copy các lệnh cần thiết ở khu vực này nhé. Đây là tính năng kết hợp Video + Text cực kỳ mạnh mẽ." } }
        ], 
        version: "2.81.0" 
      },
      isFreePreview: true, 
      duration: 600 
    });

    await Lesson.create({ 
      chapterId: c1_chap1._id, 
      title: 'Cài đặt môi trường', 
      slug: 'c1-cai-dat', 
      order: 2, 
      type: 'theory', 
      content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Hướng dẫn cài đặt Node.js", level: 2 } }, { type: "paragraph", data: { text: "Vào trang chủ nodejs.org để tải bản LTS mới nhất." } }], version: "2.81.0" }, 
      isFreePreview: true 
    });

    const c1_chap2 = await Chapter.create({ courseId: course1._id, title: 'Chương 2: Kiểu dữ liệu & Mảng', order: 2 });
    await Lesson.create({ chapterId: c1_chap2._id, title: 'Biến (Variables) và Kiểu dữ liệu (Data types)', slug: 'c1-kieu-du-lieu', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=s9wW2PpJsmQ', isFreePreview: true });
    
    const c1_c2_l2 = await Lesson.create({ chapterId: c1_chap2._id, title: 'Thực hành: Tính tổng các số chẵn trong mảng', slug: 'c1-thuc-hanh-mang', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Tính tổng các số chẵn',
      description: `Cho một mảng các số nguyên arr. Hãy viết hàm sumEvenNumbers(arr) trả về tổng của tất cả các số chẵn trong mảng.

**Ví dụ:**
- Input: [1, 2, 3, 4, 5, 6]
- Output: 12 (Vì 2 + 4 + 6 = 12)`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 128,
      starterCode: `function sumEvenNumbers(arr) {
    // Code của bạn ở đây
    
}
`,
      solutionCode: `function sumEvenNumbers(arr) {
    return arr.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
}`,
      hints: 'Dùng vòng lặp for hoặc phương thức filter kết hợp reduce. Kiểm tra số chẵn bằng n % 2 === 0',
      sampleTestCases: [
        { input: '[1, 2, 3, 4, 5, 6]', expected: '12' },
        { input: '[10, 15, 20]', expected: '30' }
      ],
      hiddenTestCases: [
        { input: '[-2, 0, 2]', expected: '0' },
        { input: '[1, 3, 5]', expected: '0' }
      ],
      linkedLessonId: c1_c2_l2._id,
      linkedCourseId: course1._id,
      linkedModuleId: c1_chap2._id
    });

    console.log('✅ Hoàn thành Khóa 1: JavaScript Cơ bản (GỐC)');

    // ============================================================
    console.log('📚 Đang tạo Khóa 2: React.js Thực Chiến (GỐC)...');

    const course2 = await Course.create({
      title: 'React.js Thực Chiến: Từ Cơ Bản Đến Đi Làm',
      slug: 'reactjs-thuc-chien',
      description: 'Học React.js thông qua việc xây dựng các dự án thực tế cực khủng. Nắm vững Hooks, Redux, Context API và các kỹ thuật tối ưu hóa giao diện.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
      price: 499000,
      level: 'Intermediate',
      isPublished: true
    });

    const c2_chap1 = await Chapter.create({ courseId: course2._id, title: 'Chương 1: Foundation (Nền tảng React)', order: 1 });
    await Lesson.create([
      { chapterId: c2_chap1._id, title: 'React là gì? Tại sao các công ty lớn săn đón React?', slug: 'c2-react-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', isFreePreview: true, duration: 900 },
      { chapterId: c2_chap1._id, title: 'JSX và cách render giao diện siêu tốc', slug: 'c2-jsx', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "paragraph", data: { text: "JSX cho phép viết HTML trực tiếp bên trong logic JavaScript." } }], version: "2.81.0" }, isFreePreview: true }
    ]);
    
    const c2_chap2 = await Chapter.create({ courseId: course2._id, title: 'Chương 2: React Hooks Điểm Tựa Sức Mạnh', order: 2 });
    await Lesson.create([
      { chapterId: c2_chap2._id, title: 'Sự kỳ diệu của useState và useEffect', slug: 'c2-hooks', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 1500 }
    ]);

    console.log('✅ Hoàn thành Khóa 2: React.js Thực Chiến (GỐC)');

    // ============================================================
    console.log('📚 Đang tạo Khóa 3: Cấu Trúc Dữ Liệu & Thuật Toán (GỐC)...');

    const course3 = await Course.create({
      title: 'Cấu Trúc Dữ Liệu & Thuật Toán (Big Tech Interview)',
      slug: 'ctdl-thuat-toan',
      description: 'Đánh bại vòng phỏng vấn kỹ thuật hóc búa nhất của Google, Meta, Shopee. Bao trọn Array, Linked List, Tree, Graph và Dynamic Programming.',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
      price: 850000,
      level: 'Advanced',
      isPublished: true
    });

    const c3_chap1 = await Chapter.create({ courseId: course3._id, title: 'Chương 1: Khởi động và Đánh giá độ phức tạp', order: 1 });
    const c3_c1_l1 = await Lesson.create({ chapterId: c3_chap1._id, title: 'Nguyên lý đánh giá Big O (O lớn)', slug: 'c3-big-o', order: 1, type: 'theory', content: { time: Date.now(), blocks: [{ type: "paragraph", data: { text: "Big O là sinh mệnh của thuật toán." } }], version: "2.81.0" }, isFreePreview: true });
    
    const c3_c1_l2 = await Lesson.create({ chapterId: c3_chap1._id, title: 'Bài tập: Tìm hai số có tổng bằng Target (Two Sum)', slug: 'c3-two-sum', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Two Sum (Tổng Hai Số)',
      description: `Cho mảng số nguyên nums và một số nguyên target. Hãy trả về một mảng chứa chính xác 2 phần tử của mảng nums có tổng bằng target.

Bạn có thể cho rằng mỗi test case chỉ có chính xác một đáp án và bạn không được sử dụng cùng một phần tử hai lần.

**Ví dụ 1:**
- Input: [2, 7, 11, 15] và 9
- Output: [2, 7]`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 256,
      starterCode: `function twoSum(nums, target) {
    // Code của bạn ở đây
    
}
`,
      solutionCode: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [complement, nums[i]];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
      hints: 'Có thể dùng 2 vòng lặp lồng nhau (O(n^2)) nhưng cách tốt nhất là dùng Hash Map (O(n))',
      sampleTestCases: [
        { input: '[[2, 7, 11, 15], 9]', expected: '[2,7]' },
        { input: '[[3, 2, 4], 6]', expected: '[2,4]' }
      ],
      hiddenTestCases: [
        { input: '[[3, 3], 6]', expected: '[3,3]' },
        { input: '[[-1, -2, -3, -4, -5], -8]', expected: '[-3,-5]' }
      ],
      linkedLessonId: c3_c1_l2._id,
      linkedCourseId: course3._id,
      linkedModuleId: c3_chap1._id
    });

    const c3_chap2 = await Chapter.create({ courseId: course3._id, title: 'Chương 2: Cây Nhị Phân (Binary Tree)', order: 2 });
    await Lesson.create([
      { chapterId: c3_chap2._id, title: 'Duyệt cây nhị phân (Pre-order, In-order, Post-order)', slug: 'c3-duyet-cay', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=fAAZixRoEzI', isFreePreview: false }
    ]);

    console.log('✅ Hoàn thành Khóa 3: Cấu Trúc Dữ Liệu & Thuật Toán (GỐC)\n');
    console.log('🎊 HOÀN THÀNH 3 KHÓA HỌC GỐC!\n');

    // ============================================================
    // 15 KHÓA HỌC MỚI
    // ============================================================

    // ============================================================
    // KHÓA 4: C++ CƠ BẢN (MIỄN PHÍ)
    // ============================================================
    console.log('📚 Đang tạo Khóa 4: C++ Cơ bản...');
    
    const course4 = await Course.create({
      title: 'Lập trình C++ Cơ bản cho người mới bắt đầu',
      slug: 'cpp-co-ban',
      description: 'Khóa học C++ từ con số 0, phù hợp cho sinh viên và người muốn học lập trình. C++ là ngôn ngữ nền tảng giúp hiểu sâu về bộ nhớ và hiệu suất.',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c4_chap1 = await Chapter.create({ courseId: course4._id, title: 'Chương 1: Giới thiệu & Cài đặt môi trường', order: 1 });
    await Lesson.create([
      { chapterId: c4_chap1._id, title: 'C++ là gì? Tại sao nên học C++?', slug: 'c4-cpp-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o', isFreePreview: true, duration: 600 },
      { chapterId: c4_chap1._id, title: 'Cài đặt Visual Studio Code và Compiler', slug: 'c4-cai-dat-moi-truong', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Hướng dẫn cài đặt C++", level: 2 } }, { type: "paragraph", data: { text: "1. Tải và cài đặt Visual Studio Code từ code.visualstudio.com" } }, { type: "paragraph", data: { text: "2. Cài đặt extension C++ (Microsoft)" } }, { type: "paragraph", data: { text: "3. Cài đặt MinGW-w64 để có compiler g++" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c4_chap2 = await Chapter.create({ courseId: course4._id, title: 'Chương 2: Biến, Kiểu dữ liệu & Toán tử', order: 2 });
    await Lesson.create([
      { chapterId: c4_chap2._id, title: 'Biến và các kiểu dữ liệu cơ bản', slug: 'c4-bien-va-kieu-du-lieu', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o', isFreePreview: true, duration: 900 },
      { chapterId: c4_chap2._id, title: 'Toán tử số học, so sánh và logic', slug: 'c4-toan-tu', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Toán tử trong C++", level: 2 } }, { type: "paragraph", data: { text: "Toán tử số học: +, -, *, /, %" } }, { type: "paragraph", data: { text: "Toán tử so sánh: ==, !=, <, >, <=, >=" } }, { type: "paragraph", data: { text: "Toán tử logic: &&, ||, !" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c4_chap3 = await Chapter.create({ courseId: course4._id, title: 'Chương 3: Câu điều kiện & Vòng lặp', order: 3 });
    const c4_c3_l1 = await Lesson.create({ chapterId: c4_chap3._id, title: 'Câu điều kiện if-else và switch-case', slug: 'c4-cau-dieu-kien', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o', isFreePreview: true, duration: 800 });
    
    const c4_c3_l2 = await Lesson.create({ chapterId: c4_chap3._id, title: 'Bài tập: Kiểm tra số nguyên tố', slug: 'c4-bai-tap-so-nguyen-to', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Kiểm tra số nguyên tố',
      description: `Viết chương trình kiểm tra xem một số nguyên n có phải là số nguyên tố hay không.

Số nguyên tố là số chỉ chia hết cho 1 và chính nó.

**Ví dụ:**
- Input: 17 → Output: true (17 là số nguyên tố)
- Input: 15 → Output: false (15 không phải số nguyên tố)`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 128,
      starterCode: `function isPrime(n) {
    // Viết code kiểm tra số nguyên tố ở đây
    
}

console.log(isPrime(17));`,
      solutionCode: `function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}`,
      hints: 'Số nguyên tố phải lớn hơn 1. Chỉ cần kiểm tra đến căn bậc 2 của n.',
      sampleTestCases: [
        { input: '17', expected: 'true' },
        { input: '15', expected: 'false' }
      ],
      hiddenTestCases: [
        { input: '2', expected: 'true' },
        { input: '1', expected: 'false' },
        { input: '100', expected: 'false' }
      ],
      linkedLessonId: c4_c3_l2._id,
      linkedCourseId: course4._id,
      linkedModuleId: c4_chap3._id
    });

    console.log('✅ Hoàn thành Khóa 4: C++ Cơ bản');

    // ============================================================
    // KHÓA 5: PYTHON CƠ BẢN (MIỄN PHÍ)
    // ============================================================
    console.log('📚 Đang tạo Khóa 5: Python Cơ bản...');

    const course5 = await Course.create({
      title: 'Python Cơ bản - Lập trình cho người mới',
      slug: 'python-co-ban',
      description: 'Học Python từ A-Z, ngôn ngữ lập trình dễ học nhất hiện nay. Python được sử dụng rộng rãi trong AI, Data Science, Web Development và Automation.',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c5_chap1 = await Chapter.create({ courseId: course5._id, title: 'Chương 1: Python và Cài đặt', order: 1 });
    await Lesson.create([
      { chapterId: c5_chap1._id, title: 'Python là gì? Ứng dụng của Python', slug: 'c5-python-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', isFreePreview: true, duration: 600 },
      { chapterId: c5_chap1._id, title: 'Cài đặt Python và PyCharm/VS Code', slug: 'c5-cai-dat-python', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Cài đặt Python", level: 2 } }, { type: "paragraph", data: { text: "1. Tải Python từ python.org (chọn phiên bản mới nhất)" } }, { type: "paragraph", data: { text: "2. Cài đặt và nhớ tick 'Add Python to PATH'" } }, { type: "paragraph", data: { text: "3. Cài đặt IDE: PyCharm Community hoặc VS Code" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c5_chap2 = await Chapter.create({ courseId: course5._id, title: 'Chương 2: Biến, Kiểu dữ liệu & List', order: 2 });
    await Lesson.create([
      { chapterId: c5_chap2._id, title: 'Biến và kiểu dữ liệu trong Python', slug: 'c5-bien-python', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', isFreePreview: true, duration: 900 },
      { chapterId: c5_chap2._id, title: 'List, Tuple, Dictionary trong Python', slug: 'c5-list-dict', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Cấu trúc dữ liệu trong Python", level: 2 } }, { type: "paragraph", data: { text: "List: Danh sách có thể thay đổi - fruits = ['apple', 'banana']" } }, { type: "paragraph", data: { text: "Tuple: Danh sách không thể thay đổi - coords = (10, 20)" } }, { type: "paragraph", data: { text: "Dictionary: Cặp key-value - person = {'name': 'John', 'age': 25}" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c5_chap3 = await Chapter.create({ courseId: course5._id, title: 'Chương 3: Hàm và Vòng lặp', order: 3 });
    const c5_c3_l1 = await Lesson.create({ chapterId: c5_chap3._id, title: 'Định nghĩa và gọi hàm', slug: 'c5-ham-python', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', isFreePreview: true, duration: 700 });
    
    const c5_c3_l2 = await Lesson.create({ chapterId: c5_chap3._id, title: 'Bài tập: Tìm giá trị lớn nhất trong list', slug: 'c5-bai-tap-max', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Tìm giá trị lớn nhất trong mảng',
      description: `Viết hàm findMax(arr) nhận vào một mảng các số nguyên và trả về giá trị lớn nhất trong mảng.

**Ví dụ:**
- Input: [3, 7, 2, 9, 1] → Output: 9
- Input: [-5, -2, -8, -1] → Output: -1`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 128,
      starterCode: `function findMax(arr) {
    // Viết code tìm max ở đây
    
}

console.log(findMax([3, 7, 2, 9, 1]));`,
      solutionCode: `function findMax(arr) {
    if (arr.length === 0) return null;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}`,
      hints: 'Khởi tạo max = arr[0], duyệt mảng và so sánh từng phần tử.',
      sampleTestCases: [
        { input: '[3, 7, 2, 9, 1]', expected: '9' },
        { input: '[-5, -2, -8, -1]', expected: '-1' }
      ],
      hiddenTestCases: [
        { input: '[42]', expected: '42' },
        { input: '[1, 2, 3, 4, 5]', expected: '5' }
      ],
      linkedLessonId: c5_c3_l2._id,
      linkedCourseId: course5._id,
      linkedModuleId: c5_chap3._id
    });

    console.log('✅ Hoàn thành Khóa 5: Python Cơ bản');

    // ============================================================
    // KHÓA 6: HTML/CSS FLEXBOX (MIỄN PHÍ)
    // ============================================================
    console.log('📚 Đang tạo Khóa 6: HTML/CSS Flexbox...');

    const course6 = await Course.create({
      title: 'HTML CSS Flexbox & Grid cho người mới bắt đầu',
      slug: 'html-css-flexbox',
      description: 'Nắm vững nền tảng HTML và CSS, học cách sử dụng Flexbox và Grid để tạo layout website chuyên nghiệp, responsive trên mọi thiết bị.',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c6_chap1 = await Chapter.create({ courseId: course6._id, title: 'Chương 1: HTML cơ bản', order: 1 });
    await Lesson.create([
      { chapterId: c6_chap1._id, title: 'Cấu trúc HTML và các thẻ phổ biến', slug: 'c6-html-co-ban', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=pQN-pnXPaVg', isFreePreview: true, duration: 800 },
      { chapterId: c6_chap1._id, title: 'Semantic HTML và SEO cơ bản', slug: 'c6-semantic-html', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Semantic HTML", level: 2 } }, { type: "paragraph", data: { text: "Sử dụng thẻ có ngữ nghĩa: <header>, <nav>, <main>, <article>, <section>, <footer>" } }, { type: "paragraph", data: { text: "Giúp trình duyệt hiểu cấu trúc nội dung tốt hơn và cải thiện SEO" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c6_chap2 = await Chapter.create({ courseId: course6._id, title: 'Chương 2: CSS và Flexbox', order: 2 });
    const c6_c2_l1 = await Lesson.create({ chapterId: c6_chap2._id, title: 'CSS cơ bản: Selector, Box Model, Display', slug: 'c6-css-co-ban', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40', isFreePreview: true, duration: 1000 });
    
    const c6_c2_l2 = await Lesson.create({ chapterId: c6_chap2._id, title: 'Bài tập: Tạo navigation bar với Flexbox', slug: 'c6-bai-tap-navbar', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Tạo Flexbox Navigation',
      description: `Hoàn thành CSS để tạo một navigation bar sử dụng Flexbox với các yêu cầu:
1. Logo nằm bên trái
2. Các menu items nằm bên phải
3. Sử dụng justify-content: space-between

**Output mong đợi:**
- Container có display: flex
- Các phần tử được phân bổ đều`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 128,
      starterCode: `function createFlexNavbar() {
    // Viết code CSS để tạo flex navbar
    // Return CSS string với:
    // - .navbar có display: flex và justify-content: space-between
    // - .logo và .menu-items được căn chỉnh đúng
    
}`,
      solutionCode: `function createFlexNavbar() {
    return \`
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: #333;
    color: white;
}
.logo {
    font-size: 1.5rem;
    font-weight: bold;
}
.menu-items {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
}
\`;
}`,
      hints: 'Sử dụng display: flex trên container cha. justify-content: space-between đẩy items ra 2 phía.',
      sampleTestCases: [
        { input: 'test', expected: 'display: flex' },
        { input: 'test', expected: 'justify-content: space-between' }
      ],
      hiddenTestCases: [
        { input: 'test', expected: 'align-items' }
      ],
      linkedLessonId: c6_c2_l2._id,
      linkedCourseId: course6._id,
      linkedModuleId: c6_chap2._id
    });

    console.log('✅ Hoàn thành Khóa 6: HTML/CSS Flexbox');

    // ============================================================
    // KHÓA 7: JAVASCRIPT NỀN TẢNG (MIỄN PHÍ)
    // ============================================================
    console.log('📚 Đang tạo Khóa 7: JavaScript Nền tảng...');

    const course7 = await Course.create({
      title: 'JavaScript Nền tảng - Học lập trình web',
      slug: 'javascript-nen-tang',
      description: 'Khóa học JavaScript từ cơ bản đến nâng cao. Là ngôn ngữ lập trình phổ biến nhất thế giới, dùng cho web, mobile app và server.',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c7_chap1 = await Chapter.create({ courseId: course7._id, title: 'Chương 1: Biến, Kiểu dữ liệu & Toán tử', order: 1 });
    await Lesson.create([
      { chapterId: c7_chap1._id, title: 'Giới thiệu JavaScript và cách chạy code', slug: 'c7-intro-js', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', isFreePreview: true, duration: 600 },
      { chapterId: c7_chap1._id, title: 'var, let, const và hoisting', slug: 'c7-var-let-const', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Khai báo biến trong JavaScript", level: 2 } }, { type: "paragraph", data: { text: "var: Phạm vi function, có hoisting" } }, { type: "paragraph", data: { text: "let: Phạm vi block, không hoisting" } }, { type: "paragraph", data: { text: "const: Không thể gán lại, phạm vi block" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c7_chap2 = await Chapter.create({ courseId: course7._id, title: 'Chương 2: Hàm và Scope', order: 2 });
    await Lesson.create([
      { chapterId: c7_chap2._id, title: 'Function declaration, expression và arrow function', slug: 'c7-function', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=F9UC9DYZR28', isFreePreview: true, duration: 900 },
      { chapterId: c7_chap2._id, title: 'Closure và scope chain', slug: 'c7-closure', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Closure trong JavaScript", level: 2 } }, { type: "paragraph", data: { text: "Closure là một function có quyền truy cập variables từ outer function ngay cả khi outer function đã kết thúc." } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c7_chap3 = await Chapter.create({ courseId: course7._id, title: 'Chương 3: Array và Object Methods', order: 3 });
    const c7_c3_l1 = await Lesson.create({ chapterId: c7_chap3._id, title: 'Các phương thức Array: map, filter, reduce', slug: 'c7-array-methods', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c', isFreePreview: true, duration: 1000 });
    
    const c7_c3_l2 = await Lesson.create({ chapterId: c7_chap3._id, title: 'Bài tập: Lọc và tính tổng với array methods', slug: 'c7-bai-tap-array', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Lọc số dương và tính tổng bình phương',
      description: `Cho một mảng số nguyên. Viết hàm sumOfSquaredPositives(arr) thực hiện:
1. Lọc ra các số dương (lớn hơn 0)
2. Tính tổng bình phương của các số dương đó

**Ví dụ:**
- Input: [1, -2, 3, 4, -5]
- Các số dương: [1, 3, 4]
- Bình phương: [1, 9, 16]
- Output: 26`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 128,
      starterCode: `function sumOfSquaredPositives(arr) {
    // Lọc số dương và tính tổng bình phương
    
}

console.log(sumOfSquaredPositives([1, -2, 3, 4, -5]));`,
      solutionCode: `function sumOfSquaredPositives(arr) {
    return arr
        .filter(n => n > 0)
        .map(n => n * n)
        .reduce((sum, n) => sum + n, 0);
}`,
      hints: 'Sử dụng filter() để lọc, map() để bình phương, reduce() để tính tổng.',
      sampleTestCases: [
        { input: '[1, -2, 3, 4, -5]', expected: '26' },
        { input: '[0, -1, -2, -3]', expected: '0' }
      ],
      hiddenTestCases: [
        { input: '[5, 10, 15]', expected: '350' },
        { input: '[]', expected: '0' }
      ],
      linkedLessonId: c7_c3_l2._id,
      linkedCourseId: course7._id,
      linkedModuleId: c7_chap3._id
    });

    console.log('✅ Hoàn thành Khóa 7: JavaScript Nền tảng');

    // ============================================================
    // KHÓA 8: MONGODB CƠ BẢN (MIỄN PHÍ)
    // ============================================================
    console.log('📚 Đang tạo Khóa 8: MongoDB Cơ bản...');

    const course8 = await Course.create({
      title: 'MongoDB Cơ bản - Cơ sở dữ liệu NoSQL',
      slug: 'mongodb-co-ban',
      description: 'Học MongoDB từ con số 0 - hệ quản trị CSDL NoSQL phổ biến nhất. Hiểu document-based database, CRUD operations và Aggregation Framework.',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c8_chap1 = await Chapter.create({ courseId: course8._id, title: 'Chương 1: Giới thiệu MongoDB', order: 1 });
    await Lesson.create([
      { chapterId: c8_chap1._id, title: 'MongoDB là gì? So sánh SQL vs NoSQL', slug: 'c8-mongodb-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=velX6-Ckd04', isFreePreview: true, duration: 700 },
      { chapterId: c8_chap1._id, title: 'Cài đặt MongoDB và MongoDB Compass', slug: 'c8-cai-dat-mongodb', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Cài đặt MongoDB", level: 2 } }, { type: "paragraph", data: { text: "1. Tải MongoDB Community Server từ mongodb.com" } }, { type: "paragraph", data: { text: "2. Cài đặt theo hướng dẫn mặc định" } }, { type: "paragraph", data: { text: "3. Tải MongoDB Compass (GUI) để quản lý database trực quan" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c8_chap2 = await Chapter.create({ courseId: course8._id, title: 'Chương 2: CRUD Operations', order: 2 });
    const c8_c2_l1 = await Lesson.create({ chapterId: c8_chap2._id, title: 'Tạo, đọc, cập nhật và xóa documents', slug: 'c8-crud', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=velX6-Ckd04', isFreePreview: true, duration: 1000 });
    
    const c8_c2_l2 = await Lesson.create({ chapterId: c8_chap2._id, title: 'Bài tập: Query MongoDB với điều kiện', slug: 'c8-bai-tap-query', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Lọc users theo điều kiện',
      description: `Cho một mảng users, viết hàm filterUsers(users) trả về:
1. Users có age >= 18
2. Sắp xếp theo name alphabetically
3. Chỉ lấy các field: name, email, age

**Ví dụ Input:**
[{ name: "Alice", email: "alice@email.com", age: 25, city: "NYC" }, { name: "Bob", email: "bob@email.com", age: 15, city: "LA" }]

**Output:**
[{ name: "Alice", email: "alice@email.com", age: 25 }]`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 128,
      starterCode: `function filterUsers(users) {
    // Lọc users >= 18 tuổi
    // Sắp xếp theo name
    // Chỉ lấy name, email, age
    
}`,
      solutionCode: `function filterUsers(users) {
    return users
        .filter(u => u.age >= 18)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(u => ({ name: u.name, email: u.email, age: u.age }));
}`,
      hints: 'Dùng filter() để lọc, sort() để sắp xếp, map() để chọn fields.',
      sampleTestCases: [
        { input: '[[{"name":"Alice","email":"alice@email.com","age":25},{"name":"Bob","email":"bob@email.com","age":15}]]', expected: '[{"name":"Alice","email":"alice@email.com","age":25}]' }
      ],
      hiddenTestCases: [
        { input: '[[{"name":"Zara","age":20},{"name":"Anna","age":22}]]', expected: '[{"name":"Anna"},{"name":"Zara"}]' }
      ],
      linkedLessonId: c8_c2_l2._id,
      linkedCourseId: course8._id,
      linkedModuleId: c8_chap2._id
    });

    console.log('✅ Hoàn thành Khóa 8: MongoDB Cơ bản');

    // ============================================================
    // KHÓA 9: GIT/GITHUB (MIỄN PHÍ)
    // ============================================================
    console.log('📚 Đang tạo Khóa 9: Git/GitHub...');

    const course9 = await Course.create({
      title: 'Git và GitHub từ Cơ bản đến Nâng cao',
      slug: 'git-github',
      description: 'Thành thạo Git để quản lý source code chuyên nghiệp. Học branching, merging, resolving conflicts và làm việc nhóm hiệu quả trên GitHub.',
      thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c9_chap1 = await Chapter.create({ courseId: course9._id, title: 'Chương 1: Git Fundamentals', order: 1 });
    await Lesson.create([
      { chapterId: c9_chap1._id, title: 'Git là gì? Tại sao cần version control?', slug: 'c9-git-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8JJ101D3knE', isFreePreview: true, duration: 600 },
      { chapterId: c9_chap1._id, title: 'Cài đặt Git và cấu hình ban đầu', slug: 'c9-cai-dat-git', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Cài đặt và cấu hình Git", level: 2 } }, { type: "paragraph", data: { text: "1. Tải Git từ git-scm.com" } }, { type: "paragraph", data: { text: "2. Cấu hình: git config --global user.name 'Your Name'" } }, { type: "paragraph", data: { text: "3. Cấu hình email: git config --global user.email 'your@email.com'" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c9_chap2 = await Chapter.create({ courseId: course9._id, title: 'Chương 2: Branching và Merging', order: 2 });
    const c9_c2_l1 = await Lesson.create({ chapterId: c9_chap2._id, title: 'Tạo và quản lý branches', slug: 'c9-branching', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8JJ101D3knE', isFreePreview: true, duration: 900 });
    
    const c9_c2_l2 = await Lesson.create({ chapterId: c9_chap2._id, title: 'Bài tập: Thực hành Git workflow', slug: 'c9-bai-tap-git-workflow', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Git Command Simulation',
      description: `Mô phỏng kết quả của các Git commands. Cho một mảng commands, trả về trạng thái cuối cùng của repository.

**Các commands:**
- "init": Tạo repo mới (returns "Initialized empty Git repository")
- "add .": Stage tất cả files (returns "Changes staged for commit")
- "commit -m msg": Commit với message (returns "1 file changed")
- "status": Kiểm tra trạng thái

**Ví dụ:**
Input: ["init", "add .", "commit -m first"]
Output: ["Initialized empty Git repository", "Changes staged for commit", "1 file changed"]`,
      difficulty: 'Easy',
      language: 'javascript',
      timeLimit: 2,
      memoryLimit: 128,
      starterCode: `function simulateGitCommands(commands) {
    // Mô phỏng các git commands và trả về kết quả
    
}`,
      solutionCode: `function simulateGitCommands(commands) {
    const results = [];
    let staged = false;
    
    for (const cmd of commands) {
        if (cmd === "init") {
            results.push("Initialized empty Git repository");
        } else if (cmd === "add .") {
            staged = true;
            results.push("Changes staged for commit");
        } else if (cmd.startsWith("commit")) {
            results.push("1 file changed");
            staged = false;
        } else if (cmd === "status") {
            results.push(staged ? "Changes to be committed" : "Nothing to commit");
        }
    }
    return results;
}`,
      hints: 'Sử dụng switch/case hoặc if-else để xử lý từng command.',
      sampleTestCases: [
        { input: '[["init", "add .", "commit -m first"]]', expected: '["Initialized empty Git repository","Changes staged for commit","1 file changed"]' }
      ],
      hiddenTestCases: [
        { input: '[["init", "status"]]', expected: '["Initialized empty Git repository","Nothing to commit"]' }
      ],
      linkedLessonId: c9_c2_l2._id,
      linkedCourseId: course9._id,
      linkedModuleId: c9_chap2._id
    });

    console.log('✅ Hoàn thành Khóa 9: Git/GitHub\n');
    console.log('🎊 HOÀN THÀNH 9 KHÓA HỌC MIỄN PHÍ!\n');

    // ============================================================
    // KHÓA 10: JAVA OOP (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 10: Java OOP...');

    const course10 = await Course.create({
      title: 'Java OOP - Lập trình hướng đối tượng chuyên sâu',
      slug: 'java-oop',
      description: 'Nắm vững lập trình hướng đối tượng với Java: Class, Object, Inheritance, Polymorphism, Abstraction, Encapsulation. Xây dựng tư duy OOP vững chắc.',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
      price: 299000,
      level: 'Intermediate',
      isPublished: true
    });

    const c10_chap1 = await Chapter.create({ courseId: course10._id, title: 'Chương 1: Class và Object', order: 1 });
    await Lesson.create([
      { chapterId: c10_chap1._id, title: 'Class là gì? Tạo class đầu tiên', slug: 'c10-class-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=TBWX97e1E9g', isFreePreview: true, duration: 800 },
      { chapterId: c10_chap1._id, title: 'Constructor và initialization', slug: 'c10-constructor', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Constructor trong Java", level: 2 } }, { type: "paragraph", data: { text: "Constructor là phương thức đặc biệt dùng để khởi tạo object." } }, { type: "paragraph", data: { text: "Có 3 loại: Default, Parameterized, Copy Constructor" } }], version: "2.81.0" }, isFreePreview: true },
      { chapterId: c10_chap1._id, title: 'Instance variable và Static variable', slug: 'c10-instance-static', order: 3, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=TBWX97e1E9g', duration: 700, isFreePreview: false }
    ]);

    const c10_chap2 = await Chapter.create({ courseId: course10._id, title: 'Chương 2: Encapsulation & Access Modifiers', order: 2 });
    await Lesson.create([
      { chapterId: c10_chap2._id, title: 'Private, Public, Protected - Ai được phép truy cập?', slug: 'c10-access-modifiers', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=TBWX97e1E9g', isFreePreview: false, duration: 900 },
      { chapterId: c10_chap2._id, title: 'Getter và Setter - Quản lý truy cập dữ liệu', slug: 'c10-getter-setter', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Encapsulation với Getter/Setter", level: 2 } }, { type: "paragraph", data: { text: "Encapsulation giúp bảo vệ dữ liệu bằng cách giấu đi implementation details." } }, { type: "paragraph", data: { text: "Sử dụng private fields + public getter/setter để kiểm soát truy cập." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c10_chap3 = await Chapter.create({ courseId: course10._id, title: 'Chương 3: Inheritance (Kế thừa)', order: 3 });
    await Lesson.create([
      { chapterId: c10_chap3._id, title: 'Single Inheritance và Multilevel Inheritance', slug: 'c10-single-inheritance', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=TBWX97e1E9g', isFreePreview: false, duration: 1000 },
      { chapterId: c10_chap3._id, title: 'super keyword và constructor chaining', slug: 'c10-super-keyword', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Từ khóa super", level: 2 } }, { type: "paragraph", data: { text: "super dùng để gọi constructor của class cha." } }, { type: "paragraph", data: { text: "super.methodName() gọi phương thức của class cha." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c10_chap4 = await Chapter.create({ courseId: course10._id, title: 'Chương 4: Polymorphism (Đa hình)', order: 4 });
    const c10_c4_l1 = await Lesson.create({ chapterId: c10_chap4._id, title: 'Method Overloading và Overriding', slug: 'c10-polymorphism', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=TBWX97e1E9g', isFreePreview: false, duration: 1100 });
    
    const c10_c4_l2 = await Lesson.create({ chapterId: c10_chap4._id, title: 'Bài tập: Xây dựng hệ thống quản lý hình học', slug: 'c10-bai-tap-geometry', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Tính diện tích hình học với OOP',
      description: `Xây dựng hệ thống tính diện tích các hình học sử dụng OOP:

1. Tạo class Shape với method calculateArea() trả về 0
2. Tạo class Rectangle kế thừa Shape với width và height
3. Tạo class Circle kế thừa Shape với radius
4. Tạo class Triangle kế thừa Shape với base và height

**Ví dụ:**
const rect = new Rectangle(5, 3);
const circle = new Circle(2);
console.log(rect.calculateArea()); // 15
console.log(circle.calculateArea()); // 12.57`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 128,
      starterCode: `class Shape {
    calculateArea() {
        // Override this in subclasses
    }
}

class Rectangle extends Shape {
    constructor(width, height) {
        super();
        // Gán width và height
    }
    
    calculateArea() {
        // Tính diện tích hình chữ nhật
    }
}

class Circle extends Shape {
    constructor(radius) {
        super();
        // Gán radius
    }
    
    calculateArea() {
        // Tính diện tích hình tròn
    }
}

class Triangle extends Shape {
    constructor(base, height) {
        super();
        // Gán base và height
    }
    
    calculateArea() {
        // Tính diện tích tam giác
    }
}`,
      solutionCode: `class Shape {
    calculateArea() {
        return 0;
    }
}

class Rectangle extends Shape {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }
    
    calculateArea() {
        return this.width * this.height;
    }
}

class Circle extends Shape {
    constructor(radius) {
        super();
        this.radius = radius;
    }
    
    calculateArea() {
        return Math.PI * this.radius * this.radius;
    }
}

class Triangle extends Shape {
    constructor(base, height) {
        super();
        this.base = base;
        this.height = height;
    }
    
    calculateArea() {
        return 0.5 * this.base * this.height;
    }
}`,
      hints: 'Sử dụng extends để kế thừa. Gọi super() trong constructor. Override calculateArea() ở mỗi subclass.',
      sampleTestCases: [
        { input: 'new Rectangle(5, 3).calculateArea()', expected: '15' },
        { input: 'new Circle(2).calculateArea()', expected: '12.566370614359172' }
      ],
      hiddenTestCases: [
        { input: 'new Triangle(4, 6).calculateArea()', expected: '12' },
        { input: 'new Shape().calculateArea()', expected: '0' }
      ],
      linkedLessonId: c10_c4_l2._id,
      linkedCourseId: course10._id,
      linkedModuleId: c10_chap4._id
    });

    const c10_chap5 = await Chapter.create({ courseId: course10._id, title: 'Chương 5: Abstraction & Interface', order: 5 });
    await Lesson.create([
      { chapterId: c10_chap5._id, title: 'Abstract class và Abstract method', slug: 'c10-abstract-class', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=TBWX97e1E9g', isFreePreview: false, duration: 900 },
      { chapterId: c10_chap5._id, title: 'Interface và Multiple Inheritance', slug: 'c10-interface', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Interface trong Java", level: 2 } }, { type: "paragraph", data: { text: "Interface định nghĩa contract mà class phải implement." } }, { type: "paragraph", data: { text: "Một class có thể implement nhiều interfaces." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    console.log('✅ Hoàn thành Khóa 10: Java OOP');

    // ============================================================
    // KHÓA 11: NODE.JS BACKEND (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 11: Node.js Backend...');

    const course11 = await Course.create({
      title: 'Node.js Backend Development - Từ zero đến hero',
      slug: 'nodejs-backend',
      description: 'Xây dựng RESTful API với Node.js, Express và MongoDB. Học Authentication, Authorization, Validation, Error Handling và Deployment lên production.',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1200&q=80',
      price: 399000,
      level: 'Intermediate',
      isPublished: true
    });

    const c11_chap1 = await Chapter.create({ courseId: course11._id, title: 'Chương 1: Node.js Fundamentals', order: 1 });
    await Lesson.create([
      { chapterId: c11_chap1._id, title: 'Node.js là gì? Kiến trúc event-driven', slug: 'c11-nodejs-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: true, duration: 700 },
      { chapterId: c11_chap1._id, title: 'Module system và NPM', slug: 'c11-modules', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: true, duration: 800 },
      { chapterId: c11_chap1._id, title: 'File system và Streams', slug: 'c11-fs-streams', order: 3, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Node.js File System", level: 2 } }, { type: "paragraph", data: { text: "fs module dùng để đọc/ghi file synchronous và asynchronous." } }, { type: "paragraph", data: { text: "Streams cho phép xử lý data theo chunks, tiết kiệm memory." } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c11_chap2 = await Chapter.create({ courseId: course11._id, title: 'Chương 2: Express.js Framework', order: 2 });
    await Lesson.create([
      { chapterId: c11_chap2._id, title: 'Tạo Express server và routing', slug: 'c11-express-server', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: false, duration: 900 },
      { chapterId: c11_chap2._id, title: 'Middleware - Heart của Express', slug: 'c11-middleware', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: false, duration: 1000 },
      { chapterId: c11_chap2._id, title: 'Error handling và Custom error classes', slug: 'c11-error-handling', order: 3, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Error Handling trong Express", level: 2 } }, { type: "paragraph", data: { text: "Luôn có error-handling middleware ở cuối." } }, { type: "paragraph", data: { text: "Tạo custom error classes để phân loại lỗi." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c11_chap3 = await Chapter.create({ courseId: course11._id, title: 'Chương 3: MongoDB & Mongoose ODM', order: 3 });
    await Lesson.create([
      { chapterId: c11_chap3._id, title: 'Mongoose Schema và Models', slug: 'c11-mongoose-schema', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: false, duration: 1000 },
      { chapterId: c11_chap3._id, title: 'CRUD operations với Mongoose', slug: 'c11-mongoose-crud', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: false, duration: 900 }
    ]);

    const c11_chap4 = await Chapter.create({ courseId: course11._id, title: 'Chương 4: Authentication & Authorization', order: 4 });
    await Lesson.create([
      { chapterId: c11_chap4._id, title: 'JWT - JSON Web Tokens', slug: 'c11-jwt', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: false, duration: 1100 },
      { chapterId: c11_chap4._id, title: 'Bcrypt và Password hashing', slug: 'c11-bcrypt', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Password Security", level: 2 } }, { type: "paragraph", data: { text: "Không bao giờ lưu password plain text." } }, { type: "paragraph", data: { text: "Sử dụng bcrypt với salt rounds >= 10." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c11_chap5 = await Chapter.create({ courseId: course11._id, title: 'Chương 5: RESTful API Design', order: 5 });
    const c11_c5_l1 = await Lesson.create({ chapterId: c11_chap5._id, title: 'REST principles và API best practices', slug: 'c11-rest-principles', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE', isFreePreview: false, duration: 1000 });
    
    const c11_c5_l2 = await Lesson.create({ chapterId: c11_chap5._id, title: 'Bài tập: Xây dựng User API với validation', slug: 'c11-bai-tap-user-api', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'User API Validation Middleware',
      description: `Viết middleware validation cho User API endpoints:

**Requirements:**
1. Hàm validateUser kiểm tra:
   - name: string, tối thiểu 2 ký tự, tối đa 50 ký tự
   - email: format email hợp lệ
   - age: number, từ 1 đến 150
   - password: tối thiểu 8 ký tự, phải có ít nhất 1 chữ hoa và 1 số

2. Hàm validateUser trả về { isValid: boolean, errors: string[] }

**Ví dụ:**
validateUser({ name: "Jo", email: "john@email.com", age: 25, password: "Pass1234" });
// { isValid: true, errors: [] }`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 128,
      starterCode: `function validateUser(user) {
    const errors = [];
    
    // Validate name (2-50 chars)
    
    // Validate email (regex pattern)
    
    // Validate age (1-150)
    
    // Validate password (min 8 chars, at least 1 uppercase, 1 number)
    
    return {
        isValid: errors.length === 0,
        errors
    };
}`,
      solutionCode: `function validateUser(user) {
    const errors = [];
    
    // Name validation
    if (!user.name || user.name.length < 2 || user.name.length > 50) {
        errors.push("Name must be between 2 and 50 characters");
    }
    
    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
        errors.push("Invalid email format");
    }
    
    // Age validation
    if (!user.age || user.age < 1 || user.age > 150) {
        errors.push("Age must be between 1 and 150");
    }
    
    // Password validation
    const password = user.password || "";
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least 1 uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least 1 number");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}`,
      hints: 'Sử dụng regex để validate email và password. Kiểm tra từng field riêng biệt.',
      sampleTestCases: [
        { input: '[{"name":"Jo","email":"john@email.com","age":25,"password":"Pass1234"}]', expected: '{"isValid":true,"errors":[]}' }
      ],
      hiddenTestCases: [
        { input: '[{"name":"J","email":"invalid","age":200,"password":"weak"}]', expected: '{"isValid":false,"errors":["Name must be between 2 and 50 characters","Invalid email format","Age must be between 1 and 150","Password must be at least 8 characters"]}' }
      ],
      linkedLessonId: c11_c5_l2._id,
      linkedCourseId: course11._id,
      linkedModuleId: c11_chap5._id
    });

    console.log('✅ Hoàn thành Khóa 11: Node.js Backend');

    // ============================================================
    // KHÓA 12: CHINH PHỤC LEETCODE (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 12: Chinh phục Leetcode...');

    const course12 = await Course.create({
      title: 'Chinh Phục LeetCode - 200 Problems Thực Chiến',
      slug: 'leetcode-challenge',
      description: 'Giải 200 bài LeetCode từ Easy đến Hard theo từng pattern. Học cách tiếp cận và giải quyết problem hiệu quả, chuẩn bị cho phỏng vấn FAANG.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      price: 699000,
      level: 'Advanced',
      isPublished: true
    });

    const c12_chap1 = await Chapter.create({ courseId: course12._id, title: 'Chương 1: Two Pointers Pattern', order: 1 });
    await Lesson.create([
      { chapterId: c12_chap1._id, title: 'Two Sum II - Sorted Array', slug: 'c12-two-sum-sorted', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: true, duration: 800 },
      { chapterId: c12_chap1._id, title: 'Container With Most Water', slug: 'c12-container-water', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 900 }
    ]);

    const c12_chap2 = await Chapter.create({ courseId: course12._id, title: 'Chương 2: Sliding Window Pattern', order: 2 });
    await Lesson.create([
      { chapterId: c12_chap2._id, title: "Maximum Sum Subarray (Kadane's Algorithm)", slug: 'c12-kadane', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 1000 },
      { chapterId: c12_chap2._id, title: 'Longest Substring Without Repeating Characters', slug: 'c12-longest-substring', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 1100 }
    ]);

    const c12_chap3 = await Chapter.create({ courseId: course12._id, title: 'Chương 3: Hash Table Mastery', order: 3 });
    await Lesson.create([
      { chapterId: c12_chap3._id, title: 'Hash Map fundamentals và collisions', slug: 'c12-hash-map', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 900 },
      { chapterId: c12_chap3._id, title: 'Group Anagrams - Hash Table patterns', slug: 'c12-group-anagrams', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 1000 }
    ]);

    const c12_chap4 = await Chapter.create({ courseId: course12._id, title: 'Chương 4: Binary Search Advanced', order: 4 });
    await Lesson.create([
      { chapterId: c12_chap4._id, title: 'Binary Search on Answer', slug: 'c12-binary-search-answer', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 1100 },
      { chapterId: c12_chap4._id, title: 'Find Minimum in Rotated Sorted Array', slug: 'c12-rotated-array', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 900 }
    ]);

    const c12_chap5 = await Chapter.create({ courseId: course12._id, title: 'Chương 5: Dynamic Programming', order: 5 });
    const c12_c5_l1 = await Lesson.create({ chapterId: c12_chap5._id, title: 'DP Fundamentals - Fibonacci và Climbing Stairs', slug: 'c12-dp-basics', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 1000 });
    
    const c12_c5_l2 = await Lesson.create({ chapterId: c12_chap5._id, title: 'Bài tập: Longest Increasing Subsequence', slug: 'c12-bai-tap-lis', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Longest Increasing Subsequence (LIS)',
      description: `Tìm độ dài của Longest Increasing Subsequence trong mảng.

**Định nghĩa:**
LIS là subsequence (không nhất thiết liên tiếp) có độ dài lớn nhất sao cho tất cả các phần tử tăng dần.

**Ví dụ:**
- Input: [10, 9, 2, 5, 3, 7, 101, 18]
- LIS: [2, 3, 7, 101] hoặc [2, 3, 7, 18]
- Output: 4

- Input: [0, 1, 0, 3, 2, 3]
- Output: 4`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 256,
      starterCode: `function lengthOfLIS(nums) {
    // Sử dụng DP hoặc Binary Search
    // Gợi ý: dp[i] = độ dài LIS kết thúc tại index i
    
}`,
      solutionCode: `function lengthOfLIS(nums) {
    if (nums.length === 0) return 0;
    
    const dp = new Array(nums.length).fill(1);
    let maxLen = 1;
    
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    
    return maxLen;
}`,
      hints: 'Sử dụng DP với dp[i] là LIS kết thúc tại i. Duyệt tất cả j < i để tìm max.',
      sampleTestCases: [
        { input: '[10, 9, 2, 5, 3, 7, 101, 18]', expected: '4' },
        { input: '[0, 1, 0, 3, 2, 3]', expected: '4' }
      ],
      hiddenTestCases: [
        { input: '[7, 7, 7, 7, 7]', expected: '1' },
        { input: '[1, 2, 3, 4, 5]', expected: '5' }
      ],
      linkedLessonId: c12_c5_l2._id,
      linkedCourseId: course12._id,
      linkedModuleId: c12_chap5._id
    });

    const c12_chap6 = await Chapter.create({ courseId: course12._id, title: 'Chương 6: Graphs & BFS/DFS', order: 6 });
    await Lesson.create([
      { chapterId: c12_chap6._id, title: 'Number of Islands', slug: 'c12-number-of-islands', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 1000 },
      { chapterId: c12_chap6._id, title: 'Clone Graph - Deep Copy', slug: 'c12-clone-graph', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PKMuGzweS4w', isFreePreview: false, duration: 900 }
    ]);

    console.log('✅ Hoàn thành Khóa 12: Chinh phục Leetcode');

    // ============================================================
    // KHÓA 13: SYSTEM DESIGN (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 13: System Design...');

    const course13 = await Course.create({
      title: 'System Design cho người mới - Thiết kế hệ thống lớn',
      slug: 'system-design',
      description: 'Học thiết kế hệ thống từ Twitter, Netflix, Uber đến YouTube. Các khái niệm: Load Balancing, Caching, Database Sharding, Message Queues, CDN.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      price: 899000,
      level: 'Advanced',
      isPublished: true
    });

    const c13_chap1 = await Chapter.create({ courseId: course13._id, title: 'Chương 1: Fundamentals of System Design', order: 1 });
    await Lesson.create([
      { chapterId: c13_chap1._id, title: 'Client-Server Architecture', slug: 'c13-client-server', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: true, duration: 800 },
      { chapterId: c13_chap1._id, title: 'HTTP, REST API và gRPC', slug: 'c13-http-rest', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "API Design", level: 2 } }, { type: "paragraph", data: { text: "REST: Representational State Transfer - sử dụng HTTP methods" } }, { type: "paragraph", data: { text: "gRPC: Google RPC - sử dụng Protocol Buffers, faster và smaller" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c13_chap2 = await Chapter.create({ courseId: course13._id, title: 'Chương 2: Database Deep Dive', order: 2 });
    await Lesson.create([
      { chapterId: c13_chap2._id, title: 'SQL vs NoSQL - Khi nào nên dùng?', slug: 'c13-sql-nosql', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 1000 },
      { chapterId: c13_chap2._id, title: 'Database Indexing và Query Optimization', slug: 'c13-indexing', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Database Indexing", level: 2 } }, { type: "paragraph", data: { text: "Index giúp tăng tốc độ read nhưng làm chậm write." } }, { type: "paragraph", data: { text: "B-Tree index cho range queries, Hash index cho exact match." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c13_chap3 = await Chapter.create({ courseId: course13._id, title: 'Chương 3: Caching Strategies', order: 3 });
    await Lesson.create([
      { chapterId: c13_chap3._id, title: 'Redis và Memcached', slug: 'c13-redis', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 900 },
      { chapterId: c13_chap3._id, title: 'Cache Patterns: Write-through, Write-back, Read-through', slug: 'c13-cache-patterns', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Caching Strategies", level: 2 } }, { type: "paragraph", data: { text: "Write-through: Write vào cache và DB cùng lúc" } }, { type: "paragraph", data: { text: "Write-back: Chỉ write vào cache, đồng bộ sang DB sau" } }, { type: "paragraph", data: { text: "Read-through: Cache tự động fetch từ DB khi miss" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c13_chap4 = await Chapter.create({ courseId: course13._id, title: 'Chương 4: Load Balancing', order: 4 });
    await Lesson.create([
      { chapterId: c13_chap4._id, title: 'Load Balancers và Algorithms', slug: 'c13-load-balancer', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 1000 },
      { chapterId: c13_chap4._id, title: 'Horizontal Scaling và Sharding', slug: 'c13-scaling', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 900 }
    ]);

    const c13_chap5 = await Chapter.create({ courseId: course13._id, title: 'Chương 5: Message Queues', order: 5 });
    const c13_c5_l1 = await Lesson.create({ chapterId: c13_chap5._id, title: 'Kafka, RabbitMQ và SQS', slug: 'c13-message-queue', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 1100 });
    
    const c13_c5_l2 = await Lesson.create({ chapterId: c13_chap5._id, title: 'Bài tập: Rate Limiter Implementation', slug: 'c13-bai-tap-rate-limiter', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Implement Rate Limiter',
      description: `Implement một Rate Limiter sử dụng sliding window algorithm.

**Requirements:**
1. Class RateLimiter với constructor nhận maxRequests và windowMs
2. Method isAllowed(clientId) trả về:
   - { allowed: true, remaining: number } nếu request được phép
   - { allowed: false, remaining: 0 } nếu bị block
3. Mỗi clientId có quota riêng

**Ví dụ:**
const limiter = new RateLimiter(3, 10000);
limiter.isAllowed("user1"); // { allowed: true, remaining: 2 }
limiter.isAllowed("user1"); // { allowed: true, remaining: 1 }
limiter.isAllowed("user1"); // { allowed: true, remaining: 0 }
limiter.isAllowed("user1"); // { allowed: false, remaining: 0 }`,
      difficulty: 'Hard',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 256,
      starterCode: `class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    isAllowed(clientId) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // Lấy requests của client
        // Lọc bỏ requests cũ
        // Kiểm tra quota
        
        return { allowed: false, remaining: 0 };
    }
}`,
      solutionCode: `class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    isAllowed(clientId) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.requests.has(clientId)) {
            this.requests.set(clientId, []);
        }
        
        const clientRequests = this.requests.get(clientId);
        const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
        this.requests.set(clientId, validRequests);
        
        if (validRequests.length < this.maxRequests) {
            validRequests.push(now);
            return { allowed: true, remaining: this.maxRequests - validRequests.length };
        }
        
        return { allowed: false, remaining: 0 };
    }
}`,
      hints: 'Lưu timestamps của mỗi request. Lọc bỏ requests cũ hơn windowMs. So sánh số lượng với maxRequests.',
      sampleTestCases: [
        { input: 'new RateLimiter(3, 10000).isAllowed("user1")', expected: '{"allowed":true,"remaining":2}' }
      ],
      hiddenTestCases: [
        { input: 'new RateLimiter(1, 10000).isAllowed("u1"); new RateLimiter(1, 10000).isAllowed("u1")', expected: '{"allowed":false,"remaining":0}' }
      ],
      linkedLessonId: c13_c5_l2._id,
      linkedCourseId: course13._id,
      linkedModuleId: c13_chap5._id
    });

    const c13_chap6 = await Chapter.create({ courseId: course13._id, title: 'Chương 6: Case Studies', order: 6 });
    await Lesson.create([
      { chapterId: c13_chap6._id, title: 'Design Twitter - News Feed', slug: 'c13-design-twitter', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 1200 },
      { chapterId: c13_chap6._id, title: 'Design URL Shortener', slug: 'c13-url-shortener', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX8', isFreePreview: false, duration: 900 }
    ]);

    console.log('✅ Hoàn thành Khóa 13: System Design');

    // ============================================================
    // KHÓA 14: DEVOPS CI/CD (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 14: DevOps CI/CD...');

    const course14 = await Course.create({
      title: 'DevOps & CI/CD - Từ Development đến Production',
      slug: 'devops-cicd',
      description: 'Học Docker, Kubernetes, Jenkins, GitHub Actions. Xây dựng CI/CD pipeline tự động. Deployment strategies: Blue-Green, Canary, Rolling.',
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80',
      price: 549000,
      level: 'Intermediate',
      isPublished: true
    });

    const c14_chap1 = await Chapter.create({ courseId: course14._id, title: 'Chương 1: Docker Fundamentals', order: 1 });
    await Lesson.create([
      { chapterId: c14_chap1._id, title: 'Docker là gì? Container vs VM', slug: 'c14-docker-la-gi', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3c-iVn73mVA', isFreePreview: true, duration: 700 },
      { chapterId: c14_chap1._id, title: 'Dockerfile và Image layers', slug: 'c14-dockerfile', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Dockerfile Best Practices", level: 2 } }, { type: "paragraph", data: { text: "1. Sử dụng .dockerignore để loại trừ unnecessary files" } }, { type: "paragraph", data: { text: "2. Multi-stage builds để giảm kích thước image" } }, { type: "paragraph", data: { text: "3. Đặt các layers ít thay đổi lên trên" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c14_chap2 = await Chapter.create({ courseId: course14._id, title: 'Chương 2: Docker Compose', order: 2 });
    await Lesson.create([
      { chapterId: c14_chap2._id, title: 'Multi-container applications với Docker Compose', slug: 'c14-docker-compose', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3c-iVn73mVA', isFreePreview: false, duration: 900 },
      { chapterId: c14_chap2._id, title: 'Networking và Volumes trong Compose', slug: 'c14-compose-networking', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Docker Compose Networking", level: 2 } }, { type: "paragraph", data: { text: "Services có thể communicate bằng service name như hostname." } }, { type: "paragraph", data: { text: "Volumes dùng để persist data giữa các container restarts." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c14_chap3 = await Chapter.create({ courseId: course14._id, title: 'Chương 3: GitHub Actions CI', order: 3 });
    await Lesson.create([
      { chapterId: c14_chap3._id, title: 'Workflow syntax và triggers', slug: 'c14-workflow-syntax', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3c-iVn73mVA', isFreePreview: false, duration: 1000 },
      { chapterId: c14_chap3._id, title: 'Running tests và linting trong CI', slug: 'c14-ci-testing', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3c-iVn73mVA', isFreePreview: false, duration: 900 }
    ]);

    const c14_chap4 = await Chapter.create({ courseId: course14._id, title: 'Chương 4: Kubernetes Essentials', order: 4 });
    await Lesson.create([
      { chapterId: c14_chap4._id, title: 'Kubernetes architecture và components', slug: 'c14-k8s-arch', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3c-iVn73mVA', isFreePreview: false, duration: 1100 },
      { chapterId: c14_chap4._id, title: 'Deployments, Services và Ingress', slug: 'c14-k8s-deploy', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Kubernetes Objects", level: 2 } }, { type: "paragraph", data: { text: "Deployment: Quản lý pods và replicas" } }, { type: "paragraph", data: { text: "Service: Network abstraction cho pods" } }, { type: "paragraph", data: { text: "Ingress: HTTP/HTTPS routing" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c14_chap5 = await Chapter.create({ courseId: course14._id, title: 'Chương 5: Monitoring & Logging', order: 5 });
    const c14_c5_l1 = await Lesson.create({ chapterId: c14_chap5._id, title: 'Prometheus và Grafana setup', slug: 'c14-prometheus', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3c-iVn73mVA', isFreePreview: false, duration: 1000 });
    
    const c14_c5_l2 = await Lesson.create({ chapterId: c14_chap5._id, title: 'Bài tập: Parse Docker logs format', slug: 'c14-bai-tap-docker-logs', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Docker Log Parser',
      description: `Parse Docker container logs và trích xuất thông tin useful.

**Docker log format:**
{timestamp} {container_name} {message}

**Requirements:**
1. Hàm parseDockerLog(logLine) trả về object với:
   - timestamp: Date object
   - containerName: string
   - message: string
   - level: "INFO" | "WARN" | "ERROR" (dựa vào message content)

2. Hàm parseMultipleLogs(logs) nhận array of logs, trả về:
   - total: tổng số logs
   - byLevel: { info: number, warn: number, error: number }
   - containers: Set of unique container names`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 128,
      starterCode: `function parseDockerLog(logLine) {
    // Parse timestamp, containerName, message
    // Detect level từ message
    
}

function parseMultipleLogs(logs) {
    // Parse all logs và aggregate stats
    
}`,
      solutionCode: `function parseDockerLog(logLine) {
    const parts = logLine.split(" ");
    const timestamp = new Date(parts[0] + " " + parts[1]);
    const containerName = parts[2];
    const message = parts.slice(3).join(" ");
    
    let level = "INFO";
    const upperMessage = message.toUpperCase();
    if (upperMessage.includes("ERROR")) level = "ERROR";
    else if (upperMessage.includes("WARN")) level = "WARN";
    
    return { timestamp, containerName, message, level };
}

function parseMultipleLogs(logs) {
    const containers = new Set();
    const byLevel = { info: 0, warn: 0, error: 0 };
    
    for (const log of logs) {
        const parsed = parseDockerLog(log);
        containers.add(parsed.containerName);
        byLevel[parsed.level.toLowerCase()]++;
    }
    
    return { total: logs.length, byLevel, containers };
}`,
      hints: 'Sử dụng split() để parse log. Kiểm tra keywords trong message để detect level.',
      sampleTestCases: [
        { input: '["2024-01-15 10:30:45 myapp ERROR Connection failed"]', expected: '{"total":1,"byLevel":{"info":0,"warn":0,"error":1},"containers":["myapp"]}' }
      ],
      hiddenTestCases: [
        { input: '["2024-01-15 10:30:45 app1 INFO test", "2024-01-15 10:30:46 app2 WARN test"]', expected: '{"total":2,"byLevel":{"info":1,"warn":1,"error":0}}' }
      ],
      linkedLessonId: c14_c5_l2._id,
      linkedCourseId: course14._id,
      linkedModuleId: c14_chap5._id
    });

    console.log('✅ Hoàn thành Khóa 14: DevOps CI/CD');

    // ============================================================
    // KHÓA 15: MICROSERVICES (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 15: Microservices...');

    const course15 = await Course.create({
      title: 'Microservices Architecture - Xây dựng hệ thống phân tán',
      slug: 'microservices',
      description: 'Thiết kế và xây dựng Microservices từ A-Z. API Gateway, Service Discovery, Circuit Breaker, Event-Driven Architecture với Kafka.',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      price: 799000,
      level: 'Advanced',
      isPublished: true
    });

    const c15_chap1 = await Chapter.create({ courseId: course15._id, title: 'Chương 1: Microservices Fundamentals', order: 1 });
    await Lesson.create([
      { chapterId: c15_chap1._id, title: 'Monolith vs Microservices', slug: 'c15-monolith-vs-micro', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: true, duration: 800 },
      { chapterId: c15_chap1._id, title: 'Service decomposition strategies', slug: 'c15-decomposition', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Decomposition Patterns", level: 2 } }, { type: "paragraph", data: { text: "By business capability: Tách theo domain business" } }, { type: "paragraph", data: { text: "By subdomain: Theo DDD bounded contexts" } }, { type: "paragraph", data: { text: "By nouns: Tách thành service cho mỗi noun" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c15_chap2 = await Chapter.create({ courseId: course15._id, title: 'Chương 2: API Gateway Pattern', order: 2 });
    await Lesson.create([
      { chapterId: c15_chap2._id, title: 'API Gateway responsibilities', slug: 'c15-api-gateway', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: false, duration: 900 },
      { chapterId: c15_chap2._id, title: 'Rate limiting và request routing', slug: 'c15-routing', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "API Gateway Features", level: 2 } }, { type: "paragraph", data: { text: "Single entry point cho tất cả clients" } }, { type: "paragraph", data: { text: "Authentication/Authorization centralized" } }, { type: "paragraph", data: { text: "Request/Response transformation" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c15_chap3 = await Chapter.create({ courseId: course15._id, title: 'Chương 3: Service Communication', order: 3 });
    await Lesson.create([
      { chapterId: c15_chap3._id, title: 'Synchronous: REST, gRPC', slug: 'c15-sync-comm', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: false, duration: 1000 },
      { chapterId: c15_chap3._id, title: 'Asynchronous: Message Queues, Event Bus', slug: 'c15-async-comm', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: false, duration: 1100 }
    ]);

    const c15_chap4 = await Chapter.create({ courseId: course15._id, title: 'Chương 4: Data Management', order: 4 });
    await Lesson.create([
      { chapterId: c15_chap4._id, title: 'Database per Service pattern', slug: 'c15-db-per-service', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: false, duration: 900 },
      { chapterId: c15_chap4._id, title: 'CQRS và Event Sourcing', slug: 'c15-cqrs', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "CQRS Pattern", level: 2 } }, { type: "paragraph", data: { text: "Command Query Responsibility Segregation" } }, { type: "paragraph", data: { text: "Tách biệt read và write models để optimize riêng." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c15_chap5 = await Chapter.create({ courseId: course15._id, title: 'Chương 5: Resilience Patterns', order: 5 });
    const c15_c5_l1 = await Lesson.create({ chapterId: c15_chap5._id, title: 'Circuit Breaker với Polly', slug: 'c15-circuit-breaker', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: false, duration: 1000 });
    
    const c15_c5_l2 = await Lesson.create({ chapterId: c15_chap5._id, title: 'Bài tập: Implement simple Circuit Breaker', slug: 'c15-bai-tap-circuit-breaker', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Implement Circuit Breaker',
      description: `Implement một Circuit Breaker pattern đơn giản.

**Circuit Breaker States:**
- CLOSED: Hoạt động bình thường, requests đi qua
- OPEN: Service đang fail, requests bị reject ngay lập tức
- HALF_OPEN: Sau timeout, cho phép 1 request test

**Requirements:**
1. Class CircuitBreaker với:
   - failureThreshold: Số lần fail để mở circuit (default: 3)
   - resetTimeout: Thời gian (ms) trước khi chuyển sang HALF_OPEN (default: 10000)

2. Methods:
   - execute(asyncFn): Thực thi function, track failures
   - getState(): Trả về "CLOSED" | "OPEN" | "HALF_OPEN"`,
      difficulty: 'Hard',
      language: 'javascript',
      timeLimit: 4,
      memoryLimit: 256,
      starterCode: `class CircuitBreaker {
    constructor(failureThreshold = 3, resetTimeout = 10000) {
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failures = 0;
        this.state = "CLOSED";
        this.lastFailureTime = null;
    }
    
    async execute(asyncFn) {
        // Implement circuit breaker logic
        
    }
    
    getState() {
        return this.state;
    }
}`,
      solutionCode: `class CircuitBreaker {
    constructor(failureThreshold = 3, resetTimeout = 10000) {
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failures = 0;
        this.state = "CLOSED";
        this.lastFailureTime = null;
    }
    
    async execute(asyncFn) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = "HALF_OPEN";
            } else {
                throw new Error("Circuit is OPEN");
            }
        }
        
        try {
            const result = await asyncFn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failures = 0;
        this.state = "CLOSED";
    }
    
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        
        if (this.state === "HALF_OPEN") {
            this.state = "OPEN";
        } else if (this.failures >= this.failureThreshold) {
            this.state = "OPEN";
        }
    }
    
    getState() {
        return this.state;
    }
}`,
      hints: 'Quản lý 3 states: CLOSED, OPEN, HALF_OPEN. Dùng setTimeout hoặc Date.now() để track timeout.',
      sampleTestCases: [
        { input: 'new CircuitBreaker().getState()', expected: '"CLOSED"' }
      ],
      hiddenTestCases: [
        { input: 'new CircuitBreaker(2, 10000).getState()', expected: '"CLOSED"' }
      ],
      linkedLessonId: c15_c5_l2._id,
      linkedCourseId: course15._id,
      linkedModuleId: c15_chap5._id
    });

    const c15_chap6 = await Chapter.create({ courseId: course15._id, title: 'Chương 6: Security', order: 6 });
    await Lesson.create([
      { chapterId: c15_chap6._id, title: 'JWT Authentication trong Microservices', slug: 'c15-jwt-auth', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=lEReLJLjQkY', isFreePreview: false, duration: 1000 },
      { chapterId: c15_chap6._id, title: 'OAuth 2.0 và OpenID Connect', slug: 'c15-oauth', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "OAuth 2.0 Flows", level: 2 } }, { type: "paragraph", data: { text: "Authorization Code: Cho web apps" } }, { type: "paragraph", data: { text: "Client Credentials: Cho machine-to-machine" } }, { type: "paragraph", data: { text: "Refresh Token: Để renew access tokens" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    console.log('✅ Hoàn thành Khóa 15: Microservices');

    // ============================================================
    // KHÓA 16: NEXT.JS FULLSTACK (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 16: Next.js Fullstack...');

    const course16 = await Course.create({
      title: 'Next.js 14 Fullstack - Xây dựng ứng dụng thực tế',
      slug: 'nextjs-fullstack',
      description: 'Học Next.js từ cơ bản đến nâng cao: App Router, Server Actions, Data Fetching, Authentication, Database Integration, Deployment.',
      thumbnail: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
      price: 599000,
      level: 'Intermediate',
      isPublished: true
    });

    const c16_chap1 = await Chapter.create({ courseId: course16._id, title: 'Chương 1: Next.js Fundamentals', order: 1 });
    await Lesson.create([
      { chapterId: c16_chap1._id, title: 'App Router vs Pages Router', slug: 'c16-app-router', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: true, duration: 800 },
      { chapterId: c16_chap1._id, title: 'Server Components và Client Components', slug: 'c16-server-client', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Server vs Client Components", level: 2 } }, { type: "paragraph", data: { text: "Server Components: Render trên server, không có interactivity" } }, { type: "paragraph", data: { text: "Client Components: Thêm 'use client', render trên client" } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c16_chap2 = await Chapter.create({ courseId: course16._id, title: 'Chương 2: Data Fetching Patterns', order: 2 });
    await Lesson.create([
      { chapterId: c16_chap2._id, title: 'Server Actions và Mutations', slug: 'c16-server-actions', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 1000 },
      { chapterId: c16_chap2._id, title: 'Caching và Revalidation strategies', slug: 'c16-caching', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Next.js Caching", level: 2 } }, { type: "paragraph", data: { text: "Request Memoization: Tự động deduplicate fetch requests" } }, { type: "paragraph", data: { text: "Data Cache: Lưu trữ data với revalidate option" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c16_chap3 = await Chapter.create({ courseId: course16._id, title: 'Chương 3: Authentication với NextAuth.js', order: 3 });
    await Lesson.create([
      { chapterId: c16_chap3._id, title: 'Setup NextAuth và Providers', slug: 'c16-nextauth-setup', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 1100 },
      { chapterId: c16_chap3._id, title: 'Session management và Protected routes', slug: 'c16-session', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 900 }
    ]);

    const c16_chap4 = await Chapter.create({ courseId: course16._id, title: 'Chương 4: Database Integration', order: 4 });
    await Lesson.create([
      { chapterId: c16_chap4._id, title: 'Prisma ORM với Next.js', slug: 'c16-prisma', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 1000 },
      { chapterId: c16_chap4._id, title: 'Server Actions cho CRUD operations', slug: 'c16-crud-actions', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Server Actions với Prisma", level: 2 } }, { type: "paragraph", data: { text: "Tạo async functions với 'use server'" } }, { type: "paragraph", data: { text: "Gọi trực tiếp từ Client Components" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c16_chap5 = await Chapter.create({ courseId: course16._id, title: 'Chương 5: Styling và UI', order: 5 });
    await Lesson.create([
      { chapterId: c16_chap5._id, title: 'Tailwind CSS với Next.js', slug: 'c16-tailwind', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 900 },
      { chapterId: c16_chap5._id, title: 'Shadcn/UI components', slug: 'c16-shadcn', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 800 }
    ]);

    const c16_chap6 = await Chapter.create({ courseId: course16._id, title: 'Chương 6: Deployment', order: 6 });
    const c16_c6_l1 = await Lesson.create({ chapterId: c16_chap6._id, title: 'Deploy lên Vercel', slug: 'c16-vercel', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', isFreePreview: false, duration: 700 });
    
    const c16_c6_l2 = await Lesson.create({ chapterId: c16_chap6._id, title: 'Bài tập: Server Action Form Handler', slug: 'c16-bai-tap-form-handler', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Form Validation với Server Actions',
      description: `Implement form validation logic cho một user registration form.

**Requirements:**
1. Hàm validateRegistrationForm(data) nhận object:
   - name: string (2-50 chars)
   - email: valid email format
   - password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   - confirmPassword: phải match password

2. Trả về { isValid: boolean, errors: Record<string, string> }

**Ví dụ:**
validateRegistrationForm({ name: "John Doe", email: "john@example.com", password: "Pass123!", confirmPassword: "Pass123!" });
// { isValid: true, errors: {} }`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 128,
      starterCode: `function validateRegistrationForm(data) {
    const errors = {};
    
    // Validate name (2-50 characters)
    
    // Validate email (regex)
    
    // Validate password (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special)
    
    // Validate confirmPassword matches password
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}`,
      solutionCode: `function validateRegistrationForm(data) {
    const errors = {};
    
    // Name validation
    if (!data.name || data.name.length < 2 || data.name.length > 50) {
        errors.name = "Name must be between 2 and 50 characters";
    }
    
    // Email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.email = "Invalid email format";
    }
    
    // Password validation
    const password = data.password || "";
    if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
        errors.password = errors.password || "Password must contain at least 1 uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
        errors.password = errors.password || "Password must contain at least 1 lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
        errors.password = errors.password || "Password must contain at least 1 number";
    }
    if (!/[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]/.test(password)) {
        errors.password = errors.password || "Password must contain at least 1 special character";
    }
    
    // Confirm password
    if (data.confirmPassword !== data.password) {
        errors.confirmPassword = "Passwords do not match";
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}`,
      hints: 'Validate từng field riêng biệt. Gộp password errors bằng || operator.',
      sampleTestCases: [
        { input: '[{"name":"John Doe","email":"john@example.com","password":"Pass123!","confirmPassword":"Pass123!"}]', expected: '{"isValid":true,"errors":{}}' }
      ],
      hiddenTestCases: [
        { input: '[{"name":"J","email":"invalid","password":"weak","confirmPassword":"different"}]', expected: '{"isValid":false,"errors":{"name":"Name must be between 2 and 50 characters","email":"Invalid email format","password":"Password must be at least 8 characters"}}' }
      ],
      linkedLessonId: c16_c6_l2._id,
      linkedCourseId: course16._id,
      linkedModuleId: c16_chap6._id
    });

    console.log('✅ Hoàn thành Khóa 16: Next.js Fullstack');

    // ============================================================
    // KHÓA 17: REACTJS THỰC CHIẾN V2 (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 17: ReactJS Thực chiến V2...');

    const course17 = await Course.create({
      title: 'ReactJS Thực Chiến V2 - 5 Dự án thực tế',
      slug: 'reactjs-thuc-chien-v2',
      description: 'Nâng cao React với 5 dự án thực tế: Todo App, Weather Dashboard, E-commerce, Blog, Social Media. Nắm vững Hooks, Redux Toolkit, React Query.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
      price: 549000,
      level: 'Intermediate',
      isPublished: true
    });

    const c17_chap1 = await Chapter.create({ courseId: course17._id, title: 'Chương 1: React Hooks Căn bản', order: 1 });
    await Lesson.create([
      { chapterId: c17_chap1._id, title: 'useState - Quản lý state trong component', slug: 'c17-useState', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: true, duration: 800 },
      { chapterId: c17_chap1._id, title: 'useEffect - Side effects trong React', slug: 'c17-useEffect', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: true, duration: 900 },
      { chapterId: c17_chap1._id, title: 'useContext - State global không cần Redux', slug: 'c17-useContext', order: 3, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "useContext Hook", level: 2 } }, { type: "paragraph", data: { text: "useContext giúp truyền data qua component tree mà không cần props drilling." } }], version: "2.81.0" }, isFreePreview: true }
    ]);

    const c17_chap2 = await Chapter.create({ courseId: course17._id, title: 'Chương 2: useReducer & Custom Hooks', order: 2 });
    await Lesson.create([
      { chapterId: c17_chap2._id, title: 'useReducer - Quản lý state phức tạp', slug: 'c17-useReducer', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 1000 },
      { chapterId: c17_chap2._id, title: 'Tạo Custom Hooks cho code reusable', slug: 'c17-custom-hooks', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Custom Hooks", level: 2 } }, { type: "paragraph", data: { text: "Custom Hook là function bắt đầu bằng 'use' có thể gọi các hooks khác." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c17_chap3 = await Chapter.create({ courseId: course17._id, title: 'Chương 3: Dự án 1 - Todo App', order: 3 });
    await Lesson.create([
      { chapterId: c17_chap3._id, title: 'Thiết kế cấu trúc state và actions', slug: 'c17-todo-structure', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 1100 },
      { chapterId: c17_chap3._id, title: 'Implement Todo reducer và actions', slug: 'c17-todo-reducer', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 900 }
    ]);

    const c17_chap4 = await Chapter.create({ courseId: course17._id, title: 'Chương 4: Dự án 2 - Weather Dashboard', order: 4 });
    await Lesson.create([
      { chapterId: c17_chap4._id, title: 'Gọi API với useEffect và async/await', slug: 'c17-weather-api', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 1200 },
      { chapterId: c17_chap4._id, title: 'Xử lý loading state và error handling', slug: 'c17-loading-error', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Handling Loading & Errors", level: 2 } }, { type: "paragraph", data: { text: "Luôn handle 3 trạng thái: loading, success, error" } }, { type: "paragraph", data: { text: "Sử dụng try-catch cho async operations" } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    const c17_chap5 = await Chapter.create({ courseId: course17._id, title: 'Chương 5: Redux Toolkit & React Query', order: 5 });
    const c17_c5_l1 = await Lesson.create({ chapterId: c17_chap5._id, title: 'Redux Toolkit - State management hiện đại', slug: 'c17-redux-toolkit', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 1000 });
    
    const c17_c5_l2 = await Lesson.create({ chapterId: c17_chap5._id, title: 'Bài tập: Xây dựng Shopping Cart với Redux', slug: 'c17-bai-tap-redux', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Shopping Cart với Redux Pattern',
      description: `Implement một shopping cart system sử dụng Redux pattern (reducers, actions).

**Requirements:**
1. State ban đầu: { items: [], total: 0 }
2. Actions: ADD_ITEM, REMOVE_ITEM, CLEAR_CART
3. ADD_ITEM: Thêm item vào cart, update total
4. REMOVE_ITEM: Xóa item khỏi cart, update total
5. CLEAR_CART: Xóa tất cả items, reset total về 0

**Ví dụ:**
const initialState = { items: [], total: 0 };
let state = cartReducer(initialState, { type: 'ADD_ITEM', payload: { name: 'iPhone', price: 999 } });
console.log(state.total); // 999`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 128,
      starterCode: `function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM':
            // Thêm item và update total
            return state;
        case 'REMOVE_ITEM':
            // Xóa item và update total
            return state;
        case 'CLEAR_CART':
            // Reset cart
            return { items: [], total: 0 };
        default:
            return state;
    }
}`,
      solutionCode: `function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const newItems = [...state.items, action.payload];
            return {
                items: newItems,
                total: state.total + action.payload.price
            };
        }
        case 'REMOVE_ITEM': {
            const itemToRemove = state.items.find(item => item.name === action.payload.name);
            if (!itemToRemove) return state;
            return {
                items: state.items.filter(item => item.name !== action.payload.name),
                total: state.total - action.payload.price
            };
        }
        case 'CLEAR_CART':
            return { items: [], total: 0 };
        default:
            return state;
    }
}`,
      hints: 'Sử dụng spread operator để tạo new array/object. Tìm item bằng find(), lọc bằng filter().',
      sampleTestCases: [
        { input: 'cartReducer({items:[],total:0},{type:"ADD_ITEM",payload:{name:"iPhone",price:999}})', expected: '{"items":[{"name":"iPhone","price":999}],"total":999}' }
      ],
      hiddenTestCases: [
        { input: 'cartReducer({items:[{name:"iPhone",price:999}],total:999},{type:"CLEAR_CART"})', expected: '{"items":[],"total":0}' }
      ],
      linkedLessonId: c17_c5_l2._id,
      linkedCourseId: course17._id,
      linkedModuleId: c17_chap5._id
    });

    const c17_chap6 = await Chapter.create({ courseId: course17._id, title: 'Chương 6: Performance Optimization', order: 6 });
    await Lesson.create([
      { chapterId: c17_chap6._id, title: 'React.memo và useMemo - Tránh re-render không cần thiết', slug: 'c17-react-memo', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: false, duration: 900 },
      { chapterId: c17_chap6._id, title: 'useCallback - Memoize functions', slug: 'c17-useCallback', order: 2, type: 'theory', content: { time: Date.now(), blocks: [{ type: "header", data: { text: "Performance với useCallback", level: 2 } }, { type: "paragraph", data: { text: "useCallback memoizes a function, returning a stable reference." } }], version: "2.81.0" }, isFreePreview: false }
    ]);

    console.log('✅ Hoàn thành Khóa 17: ReactJS Thực chiến V2');

    // ============================================================
    // KHÓA 18: CẤU TRÚC DỮ LIỆU V2 (TRẢ PHÍ)
    // ============================================================
    console.log('💰 Đang tạo Khóa 18: Cấu trúc dữ liệu V2...');

    const course18 = await Course.create({
      title: 'Cấu Trúc Dữ Liệu & Giải Thuật V2 - Nâng cao',
      slug: 'ctdl-gt-v2',
      description: 'Học sâu về Advanced Trees, Graphs, Dynamic Programming, Greedy Algorithms, Divide and Conquer. Chuẩn bị cho vòng phỏng vấn FAANG.',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
      price: 950000,
      level: 'Advanced',
      isPublished: true
    });

    const c18_chap1 = await Chapter.create({ courseId: course18._id, title: 'Chương 1: Advanced Trees', order: 1 });
    await Lesson.create([
      { chapterId: c18_chap1._id, title: 'AVL Tree và Red-Black Tree', slug: 'c18-avl-tree', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: true, duration: 1000 },
      { chapterId: c18_chap1._id, title: 'Heap và Priority Queue', slug: 'c18-heap', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 900 }
    ]);

    const c18_chap2 = await Chapter.create({ courseId: course18._id, title: 'Chương 2: Graphs Advanced', order: 2 });
    await Lesson.create([
      { chapterId: c18_chap2._id, title: "Dijkstra's Algorithm", slug: 'c18-dijkstra', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 1100 },
      { chapterId: c18_chap2._id, title: "Bellman-Ford và Floyd-Warshall", slug: 'c18-bellman-ford', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 1000 }
    ]);

    const c18_chap3 = await Chapter.create({ courseId: course18._id, title: 'Chương 3: Dynamic Programming Advanced', order: 3 });
    await Lesson.create([
      { chapterId: c18_chap3._id, title: 'DP on Trees và Graphs', slug: 'c18-dp-trees', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 1200 },
      { chapterId: c18_chap3._id, title: 'State Compression DP', slug: 'c18-state-compression', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 900 }
    ]);

    const c18_chap4 = await Chapter.create({ courseId: course18._id, title: 'Chương 4: String Algorithms', order: 4 });
    await Lesson.create([
      { chapterId: c18_chap4._id, title: 'KMP và Z-Algorithm', slug: 'c18-kmp', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 1000 },
      { chapterId: c18_chap4._id, title: 'Trie (Prefix Tree)', slug: 'c18-trie', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 900 }
    ]);

    const c18_chap5 = await Chapter.create({ courseId: course18._id, title: 'Chương 5: Greedy & Divide and Conquer', order: 5 });
    const c18_c5_l1 = await Lesson.create({ chapterId: c18_chap5._id, title: 'Greedy Algorithm Patterns', slug: 'c18-greedy', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 1000 });
    
    const c18_c5_l2 = await Lesson.create({ chapterId: c18_chap5._id, title: 'Bài tập: Merge Intervals', slug: 'c18-bai-tap-merge-intervals', order: 2, type: 'coding', isFreePreview: false });
    
    await Problem.create({
      title: 'Merge Intervals',
      description: `Cho một mảng các intervals, merge tất cả các intervals chồng chéo.

**Ví dụ:**
- Input: [[1,3],[2,6],[8,10],[15,18]]
- Output: [[1,6],[8,10],[15,18]]
- Giải thích: [1,3] và [2,6] chồng chéo, merge thành [1,6]

- Input: [[1,4],[4,5]]
- Output: [[1,5]]

**Constraints:**
- intervals[i][0] <= intervals[i][1]`,
      difficulty: 'Medium',
      language: 'javascript',
      timeLimit: 3,
      memoryLimit: 256,
      starterCode: `function merge(intervals) {
    // Sắp xếp intervals theo start time
    // Merge các intervals chồng chéo
    
}`,
      solutionCode: `function merge(intervals) {
    if (intervals.length <= 1) return intervals;
    
    // Sắp xếp theo start time
    intervals.sort((a, b) => a[0] - b[0]);
    
    const result = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const last = result[result.length - 1];
        const current = intervals[i];
        
        if (current[0] <= last[1]) {
            // Có chồng chéo, merge
            last[1] = Math.max(last[1], current[1]);
        } else {
            // Không chồng chéo
            result.push(current);
        }
    }
    
    return result;
}`,
      hints: 'Sắp xếp intervals theo start time. Duyệt và merge nếu current start <= last end.',
      sampleTestCases: [
        { input: '[[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' },
        { input: '[[1,4],[4,5]]', expected: '[[1,5]]' }
      ],
      hiddenTestCases: [
        { input: '[[1,4],[0,4]]', expected: '[[0,4]]' },
        { input: '[[1,4],[2,3]]', expected: '[[1,4]]' }
      ],
      linkedLessonId: c18_c5_l2._id,
      linkedCourseId: course18._id,
      linkedModuleId: c18_chap5._id
    });

    const c18_chap6 = await Chapter.create({ courseId: course18._id, title: 'Chương 6: Advanced Problems', order: 6 });
    await Lesson.create([
      { chapterId: c18_chap6._id, title: 'Topological Sort và Kahn Algorithm', slug: 'c18-topological-sort', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 1100 },
      { chapterId: c18_chap6._id, title: 'Union Find (Disjoint Set)', slug: 'c18-union-find', order: 2, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8jB5tdz0Y4A', isFreePreview: false, duration: 900 }
    ]);

    console.log('✅ Hoàn thành Khóa 18: Cấu trúc dữ liệu V2');

    // ============================================================
    // HOÀN THÀNH
    // ============================================================
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉🎉🎉 HOÀN THÀNH SEEDING 18 KHÓA HỌC! 🎉🎉🎉');
    console.log('='.repeat(70));
    console.log('\n📊 THỐNG KÊ:');
    console.log('\n   📚 9 Khóa MIỄN PHÍ:');
    console.log('      1.  JavaScript Cơ bản (GỐC)');
    console.log('      2.  React.js Thực Chiến (GỐC)');
    console.log('      3.  Cấu Trúc Dữ Liệu & Thuật Toán (GỐC)');
    console.log('      4.  C++ Cơ bản');
    console.log('      5.  Python Cơ bản');
    console.log('      6.  HTML/CSS Flexbox');
    console.log('      7.  JavaScript Nền tảng');
    console.log('      8.  MongoDB Cơ bản');
    console.log('      9.  Git/GitHub');
    console.log('\n   💰 9 Khóa TRẢ PHÍ:');
    console.log('      10. Java OOP - 299.000đ');
    console.log('      11. Node.js Backend - 399.000đ');
    console.log('      12. Chinh phục Leetcode - 699.000đ');
    console.log('      13. System Design - 899.000đ');
    console.log('      14. DevOps CI/CD - 549.000đ');
    console.log('      15. Microservices - 799.000đ');
    console.log('      16. Next.js Fullstack - 599.000đ');
    console.log('      17. ReactJS Thực chiến V2 - 549.000đ');
    console.log('      18. Cấu trúc dữ liệu V2 - 950.000đ');
    console.log('\n⏱️  Thời gian thực thi: ' + elapsed + ' giây');
    console.log('='.repeat(70) + '\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ LỖI SEEDING DỮ LIỆU:', err);
    process.exit(1);
  }
};

seedAll();
