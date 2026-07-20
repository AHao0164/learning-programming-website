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
  .then(() => console.log('✅ Đã kết nối MongoDB để cấy dữ liệu 9 KHÓA HỌC mới...'))
  .catch(err => {
    console.error('❌ Lỗi kết nối DB:', err);
    process.exit(1);
  });

const seedCourses = async () => {
  try {
    // Dọn dẹp dữ liệu cũ trước khi cấy mới
    await Course.deleteMany({ slug: { $in: [
      'python-zero-hero-v2', 'html-css-flexbox-grid-v2', 'mongodb-co-ban-v2',
      'java-oop-master-v2', 'reactjs-thuc-chien-pro-v2', 'nodejs-express-backend-v2',
      'ctdl-thuat-toan-nang-cao-v2', 'leetcode-master-v2', 'javascript-nen-tang-v2'
    ]}});
    await Chapter.deleteMany();
    await Lesson.deleteMany();
    await Problem.deleteMany();
    console.log('🗑️ Đã dọn dẹp dữ liệu cũ...');

    // ==========================================================
    // KHÓA 4: PYTHON TỪ ZERO ĐẾN HERO (MIỄN PHÍ)
    // ==========================================================
    const course4 = await Course.create({
      title: 'Lập trình Python từ Zero đến Hero',
      slug: 'python-zero-hero-v3',
      description: 'Bước chân vào thế giới công nghệ với Python - ngôn ngữ lập trình phổ biến và thân thiện nhất hiện nay. Khóa học này cung cấp cho bạn cú pháp cốt lõi, cách xử lý mảng, chuỗi và các cấu trúc dữ liệu mạnh mẽ.',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&w=1200&q=80',
      price: 0,
      level: 'Beginner',
      isPublished: true
    });

    const c4_chap1 = await Chapter.create({ courseId: course4._id, title: 'Chương 1: Cú pháp Python căn bản', order: 1 });
    await Lesson.create({
      chapterId: c4_chap1._id, title: 'Cài đặt Python và chạy script đầu tiên', slug: 'c4-cai-dat-v3', order: 1, type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=kYjsQZES9Dk', isFreePreview: true, duration: 800,
      content: { time: Date.now(), blocks: [{ type: "paragraph", data: { text: "Python yêu cầu thụt lề (indentation) cực kỳ nghiêm ngặt." } }], version: "2.81.0" }
    });

    const c4_chap2 = await Chapter.create({ courseId: course4._id, title: 'Chương 2: Xử lý Chuỗi', order: 2 });
    const c4_l2 = await Lesson.create({ chapterId: c4_chap2._id, title: 'Thực hành: Đảo ngược chuỗi', slug: 'c4-dao-chuoi-v3', order: 1, type: 'coding', isFreePreview: true });

    await Problem.create({
      title: 'Đảo ngược chuỗi ký tự',
      description: 'Nhập vào một chuỗi ký tự không chứa khoảng trắng `S`. In ra màn hình chuỗi ngược lại của nó.\n\n**Ví dụ:**\n- Input: `hello`\n- Output: `olleh`',
      difficulty: 'Easy', language: 'python', timeLimit: 2, memoryLimit: 128,
      starterCode: 'def reverse_string(s):\n    # Code của bạn ở đây\n    pass',
      solutionCode: 'def reverse_string(s):\n    return s[::-1]',
      hints: 'Trong Python, bạn có thể dùng cú pháp slicing [::-1] để đảo chuỗi siêu nhanh.',
      sampleTestCases: [{ input: 'hello', expected: 'olleh' }],
      hiddenTestCases: [{ input: 'world', expected: 'dlrow' }],
      linkedLessonId: c4_l2._id, linkedCourseId: course4._id, linkedModuleId: c4_chap2._id
    });

    console.log('✅ Đã tạo Khóa 4: Python từ Zero đến Hero');

    // ==========================================================
    // KHÓA 5: HTML/CSS FLEXBOX & GRID (MIỄN PHÍ)
    // ==========================================================
    const course5 = await Course.create({
      title: 'Cắt Giao diện HTML/CSS Flexbox & Grid',
      slug: 'html-css-flexbox-grid-v3',
      description: 'Tự tay biến những bản thiết kế vô hồn thành các trang web tĩnh tuyệt đẹp. Không cần framework, làm chủ hoàn toàn các kỹ thuật dàn trang hiện đại nhất.',
      thumbnail: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?auto=format&fit=crop&w=1200&q=80',
      price: 0, level: 'Beginner', isPublished: true
    });

    const c5_chap1 = await Chapter.create({ courseId: course5._id, title: 'Chương 1: HTML5 & CSS3 Căn bản', order: 1 });
    await Lesson.create({ chapterId: c5_chap1._id, title: 'Cấu trúc thẻ HTML và Selectors CSS', slug: 'c5-html-css-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=R9Z8S7w_mks', isFreePreview: true });

    const c5_chap2 = await Chapter.create({ courseId: course5._id, title: 'Chương 2: Flexbox Layout', order: 2 });
    await Lesson.create({ chapterId: c5_chap2._id, title: 'Học nhanh kỹ thuật CSS Flexbox', slug: 'c5-flexbox-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=G1HWtiA1YMo', isFreePreview: true });

    console.log('✅ Đã tạo Khóa 5: HTML/CSS Flexbox & Grid');

    // ==========================================================
    // KHÓA 6: MONGODB CHO WEB DEVELOPER (MIỄN PHÍ)
    // ==========================================================
    const course6 = await Course.create({
      title: 'Cơ sở dữ liệu MongoDB cho Web Developer',
      slug: 'mongodb-co-ban-v3',
      description: 'Khám phá sức mạnh linh hoạt của hệ quản trị cơ sở dữ liệu phi cấu trúc (NoSQL) hàng đầu thế giới. Nắm vững luồng truy vấn CRUD tốc độ cao.',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
      price: 0, level: 'Beginner', isPublished: true
    });

    const c6_chap1 = await Chapter.create({ courseId: course6._id, title: 'Chương 1: Tổng quan NoSQL', order: 1 });
    await Lesson.create({ chapterId: c6_chap1._id, title: 'Thao tác CRUD với Mongoose', slug: 'c6-crud-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=-56x56UppqQ', isFreePreview: true });

    console.log('✅ Đã tạo Khóa 6: MongoDB cho Web Developer');

    // ==========================================================
    // KHÓA 7: TƯ DUY OOP VỚI JAVA (CÓ PHÍ)
    // ==========================================================
    const course7 = await Course.create({
      title: 'Tư duy Lập trình Hướng đối tượng - Java OOP',
      slug: 'java-oop-master-v3',
      description: 'Nâng cấp tư duy thiết kế phần mềm lên tầm cao mới với OOP. Đi sâu vào 4 tính chất vàng: Đóng gói, Kế thừa, Đa hình và Trừu tượng.',
      thumbnail: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=1200&q=80',
      price: 199000, level: 'Intermediate', isPublished: true
    });

    const c7_chap1 = await Chapter.create({ courseId: course7._id, title: 'Chương 1: Lớp và Đối tượng', order: 1 });
    await Lesson.create({ chapterId: c7_chap1._id, title: 'Class, Object và Constructor', slug: 'c7-class-object-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=rXjE3iM4Nmc', isFreePreview: true });

    const c7_chap2 = await Chapter.create({ courseId: course7._id, title: 'Chương 2: Thực hành OOP', order: 2 });
    const c7_l2 = await Lesson.create({ chapterId: c7_chap2._id, title: 'Bài tập: Diện tích hình chữ nhật', slug: 'c7-hinh-chu-nhat-v3', order: 1, type: 'coding', isFreePreview: false });

    await Problem.create({
      title: 'Tính diện tích hình chữ nhật',
      description: 'Nhập vào chiều dài `L` và chiều rộng `W`. In ra chu vi và diện tích (cách nhau 1 dấu cách).\n\n**Ví dụ:**\n- Input: `4 5`\n- Output: `18 20`',
      difficulty: 'Easy', language: 'java', timeLimit: 2, memoryLimit: 256,
      starterCode: 'public class Main {\n    public static void main(String[] args) {\n        // Code tại đây\n    }\n}',
      solutionCode: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int l = sc.nextInt();\n        int w = sc.nextInt();\n        System.out.println((l+w)*2 + " " + (l*w));\n    }\n}',
      hints: 'Chu vi = (L+W)*2, Diện tích = L*W',
      sampleTestCases: [{ input: '4 5', expected: '18 20' }],
      hiddenTestCases: [{ input: '10 10', expected: '40 100' }],
      linkedLessonId: c7_l2._id, linkedCourseId: course7._id, linkedModuleId: c7_chap2._id
    });

    console.log('✅ Đã tạo Khóa 7: Java OOP Master');

    // ==========================================================
    // KHÓA 8: REACT.JS THỰC CHIẾN PRO (CÓ PHÍ)
    // ==========================================================
    const course8 = await Course.create({
      title: 'React.js Thực Chiến Pro: Trở thành Frontend Developer',
      slug: 'reactjs-thuc-chien-pro-v3',
      description: 'Làm chủ thư viện UI đình đám nhất từ Facebook. Thấu hiểu sâu sắc Virtual DOM, Component Lifecycle và hệ thống React Hooks.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
      price: 299000, level: 'Intermediate', isPublished: true
    });

    const c8_chap1 = await Chapter.create({ courseId: course8._id, title: 'Chương 1: React Hooks', order: 1 });
    await Lesson.create({ chapterId: c8_chap1._id, title: 'Sự kỳ diệu của useState và useEffect', slug: 'c8-hooks-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0', isFreePreview: true });

    console.log('✅ Đã tạo Khóa 8: React.js Thực Chiến Pro');

    // ==========================================================
    // KHÓA 9: BACKEND NODE.JS & EXPRESS (CÓ PHÍ)
    // ==========================================================
    const course9 = await Course.create({
      title: 'Phát triển Hệ thống Backend Node.js & Express',
      slug: 'nodejs-express-backend-v3',
      description: 'Tự tay xây dựng bộ não trung tâm xử lý API. Nắm vững RESTful, Middleware, CORS và bảo mật JWT.',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80',
      price: 399000, level: 'Advanced', isPublished: true
    });

    const c9_chap1 = await Chapter.create({ courseId: course9._id, title: 'Chương 1: RESTful API', order: 1 });
    await Lesson.create({ chapterId: c9_chap1._id, title: 'Xây dựng API với Express', slug: 'c9-express-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=zQnBQ4tB3ZA', isFreePreview: true });

    console.log('✅ Đã tạo Khóa 9: Node.js & Express Backend');

    // ==========================================================
    // KHÓA 10: CẤU TRÚC DỮ LIỆU & THUẬT TOÁN NÂNG CAO (CÓ PHÍ)
    // ==========================================================
    const course10 = await Course.create({
      title: 'Cấu trúc Dữ liệu & Giải thuật Nâng cao',
      slug: 'ctdl-thuat-toan-nang-cao-v3',
      description: 'Đánh bại vòng phỏng vấn kỹ thuật Big Tech. Làm chủ Big O, Array, Linked List, Tree và Graph.',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
      price: 499000, level: 'Advanced', isPublished: true
    });

    const c10_chap1 = await Chapter.create({ courseId: course10._id, title: 'Chương 1: Đánh giá Big O', order: 1 });
    const c10_l1 = await Lesson.create({ chapterId: c10_chap1._id, title: 'Bài tập: Thuật toán Two Sum', slug: 'c10-two-sum-v3', order: 1, type: 'coding', isFreePreview: false });

    await Problem.create({
      title: 'Two Sum (Tổng Hai Số)',
      description: 'Cho mảng số nguyên `nums` và số `target`. Trả về mảng chứa 2 phần tử có tổng bằng `target`.\n\n**Ví dụ:**\n- Input: `[2, 7, 11, 15], 9`\n- Output: `[2, 7]`',
      difficulty: 'Medium', language: 'javascript', timeLimit: 2, memoryLimit: 256,
      starterCode: 'function twoSum(nums, target) {\n    // Code của bạn ở đây\n}',
      solutionCode: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        if (map.has(target - nums[i])) return [target - nums[i], nums[i]];\n        map.set(nums[i], i);\n    }\n    return [];\n}',
      hints: 'Sử dụng Hash Map (Object/Map trong JS) để tối ưu độ phức tạp xuống O(N).',
      sampleTestCases: [{ input: '[[2, 7, 11, 15], 9]', expected: '[2,7]' }],
      hiddenTestCases: [{ input: '[[3, 2, 4], 6]', expected: '[2,4]' }],
      linkedLessonId: c10_l1._id, linkedCourseId: course10._id, linkedModuleId: c10_chap1._id
    });

    console.log('✅ Đã tạo Khóa 10: CTDL & Giải thuật Nâng cao');

    // ==========================================================
    // KHÓA 11: LUYỆN THI LEETCODE CHUYÊN SÂU (CÓ PHÍ)
    // ==========================================================
    const course11 = await Course.create({
      title: 'Chiến lược Luyện thi Thuật toán Chuyên sâu - Leetcode',
      slug: 'leetcode-master-v3',
      description: 'Trại huấn luyện tư duy thuật toán. Phân loại bài tập theo các kỹ thuật sát thủ: Hai con trỏ, Cửa sổ trượt, Đệ quy, Quay lui.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      price: 599000, level: 'Advanced', isPublished: true
    });

    const c11_chap1 = await Chapter.create({ courseId: course11._id, title: 'Chương 1: Kỹ thuật Two Pointers', order: 1 });
    await Lesson.create({ chapterId: c11_chap1._id, title: 'Phân tích kỹ thuật Hai con trỏ', slug: 'c11-two-pointers-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Kk6YmB51JDE', isFreePreview: true });

    console.log('✅ Đã tạo Khóa 11: Leetcode Master');

    // ==========================================================
    // KHÓA 12: JAVASCRIPT NỀN TẢNG (MIỄN PHÍ)
    // ==========================================================
    const course12 = await Course.create({
      title: 'Lập trình JavaScript Nền tảng cho Web',
      slug: 'javascript-nen-tang-v3',
      description: 'Thổi hồn vào trang web với JS. Đi sâu vào Scope, tương tác DOM, xử lý sự kiện và các hàm xử lý mảng map, filter, reduce.',
      thumbnail: 'https://luca-blogs.vercel.app/static/images/Blog/js-thumbnail-1.jpeg',
      price: 0, level: 'Beginner', isPublished: true
    });

    const c12_chap1 = await Chapter.create({ courseId: course12._id, title: 'Chương 1: DOM và Event', order: 1 });
    await Lesson.create({ chapterId: c12_chap1._id, title: 'Tương tác với DOM', slug: 'c12-dom-v3', order: 1, type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0SJE9dYdpps', isFreePreview: true });

    console.log('✅ Đã tạo Khóa 12: JavaScript Nền tảng');

    console.log('\n🎉 ĐÃ CẤY THÀNH CÔNG 9 KHÓA HỌC MỚI VÀ BÀI TẬP CODING:');
    console.log('----------------------------------------------------');
    console.log('4. Python từ Zero đến Hero (Miễn phí)');
    console.log('5. HTML/CSS Flexbox & Grid (Miễn phí)');
    console.log('6. MongoDB cho Web Developer (Miễn phí)');
    console.log('7. Java OOP Master (199.000đ)');
    console.log('8. React.js Thực Chiến Pro (299.000đ)');
    console.log('9. Node.js & Express Backend (399.000đ)');
    console.log('10. CTDL & Giải thuật Nâng cao (499.000đ)');
    console.log('11. Leetcode Master (599.000đ)');
    console.log('12. JavaScript Nền tảng (Miễn phí)');
    console.log('----------------------------------------------------\n');
    process.exit();
  } catch (err) {
    console.error('❌ Lỗi cấy dữ liệu khóa học:', err);
    process.exit(1);
  }
};

seedCourses();
