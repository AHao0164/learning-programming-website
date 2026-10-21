const crypto = require('crypto');
if (!globalThis.crypto) globalThis.crypto = crypto;
if (!global.crypto) global.crypto = crypto;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Nạp biến môi trường
dotenv.config({ path: path.join(__dirname, '../.env') });

const Blog = require('../models/blog.model');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-coding-platform';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB để cấy dữ liệu BLOG...'))
  .catch(err => {
    console.error('❌ Lỗi kết nối DB:', err);
    process.exit(1);
  });

const seedBlogs = async () => {
  try {
    // Xóa dữ liệu cũ
    await Blog.deleteMany();
    console.log('🗑️ Đã dọn dẹp dữ liệu Blog cũ...');

    const blogs = [
      {
        title: '5 Lý Do Tại Sao Bạn Nên Học JavaScript Ngay Hôm Nay',
        slug: '5-ly-do-hoc-javascript',
        excerpt: 'JavaScript là ngôn ngữ lập trình phổ biến nhất thế giới. Khám phá 5 lý do thuyết phục để bắt đầu học JavaScript ngay hôm nay.',
        content: `<h2>Tại sao JavaScript?</h2>
<p>JavaScript không chỉ là ngôn ngữ của web - nó đã trở thành ngôn ngữ của tương lai. Dưới đây là 5 lý do thuyết phục:</p>
<h3>1. Phổ biến nhất thế giới</h3>
<p>Theo khảo sát của Stack Overflow, JavaScript là ngôn ngữ được sử dụng nhiều nhất trong suốt 10 năm liên tiếp.</p>
<h3>2. Cơ hội việc làm rộng mở</h3>
<p>Từ Frontend đến Backend, từ Mobile đến Desktop, JavaScript có mặmặt ở khắp nơi.</p>
<h3>3. Cộng đồng khổng lồ</h3>
<p>Với hàng triệu developer trên toàn thế giới, bạn sẽ không bao giờ cô đơn khi gặp vấn đề.</p>
<h3>4. Học một lần, dùng mọi nơi</h3>
<p>Node.js cho phép bạn dùng JavaScript ở phía server. React Native cho mobile. Electron cho desktop.</p>
<h3>5. Mức lương hấp dẫn</h3>
<p>JavaScript Developer luôn nằm trong top những ngành có mức lương cao nhất trong ngành IT.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Programming',
        tags: ['JavaScript', 'Programming', 'Beginner'],
        readTime: 5,
        isPublished: true
      },
      {
        title: 'Hướng Dẫn Từ A-Z Về React Hooks Cho Người Mới Bắt Đầu',
        slug: 'huong-dan-react-hooks',
        excerpt: 'Tìm hiểu cách sử dụng useState, useEffect, useContext và các Hooks khác để xây dựng ứng dụng React hiệu quả.',
        content: `<h2>React Hooks là gì?</h2>
<p>Hooks cho phép bạn sử dụng state và các tính năng khác của React mà không cần class component.</p>
<h3>useState - Quản lý State</h3>
<p>useState là Hook cơ bản nhất, cho phép bạn thêm state vào functional component.</p>
<pre><code>const [count, setCount] = useState(0);</code></pre>
<h3>useEffect - Side Effects</h3>
<p>useEffect cho phép bạn thực hiện side effects trong functional components.</p>
<pre><code>useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);</code></pre>`,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tutorial',
        tags: ['React', 'Hooks', 'Frontend'],
        readTime: 8,
        isPublished: true
      },
      {
        title: 'Node.js vs Python: Ngôn ngữ nào tốt hơn cho Backend?',
        slug: 'nodejs-vs-python-backend',
        excerpt: 'So sánh chi tiết giữa Node.js và Python để giúp bạn chọn ngôn ngữ phù hợp cho dự án backend của mình.',
        content: `<h2>So sánh Node.js và Python</h2>
<p>Cả hai đều là những lựa chọn phổ biến cho backend development. Hãy cùng điểm qua ưu nhược điểm của từng công nghệ.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Technology',
        tags: ['Node.js', 'Python', 'Backend'],
        readTime: 7,
        isPublished: true
      },
      {
        title: '10 Mẹo Viết Code Sạch Mà Mọi Developer Cần Biết',
        slug: '10-meo-viet-code-sach',
        excerpt: 'Những nguyên tắc vàng giúp bạn viết code dễ đọc, dễ bảo trì và chuyên nghiệp hơn.',
        content: `<h2>Viết Code Sạch Là Nghệ Thuật</h2>
<p>Code sạch không chỉ giúp bạn mà còn giúp đồng nghiệp và dự án của bạn phát triển bền vững.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tips',
        tags: ['Coding Tips', 'Best Practices'],
        readTime: 6,
        isPublished: true
      },
      {
        title: 'Cách Xây Dựng Portfolio Developer Để Thu Hút Nhà Tuyển Dụng',
        slug: 'cach-xay-dung-portfolio-developer',
        excerpt: 'Hướng dẫn tạo portfolio ấn tượng giúp bạn nổi bật giữa hàng ngàn ứng viên khác.',
        content: `<h2>Tại Sao Portfolio Quan Trọng?</h2>
<p>Portfolio là cách tốt nhất để thể hiện kỹ năng thực tế của bạn.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Career',
        tags: ['Portfolio', 'Career', 'Job'],
        readTime: 5,
        isPublished: true
      },
      {
        title: 'Giải Thích Độ Phức Tạp Thuật Toán: Big O Notation',
        slug: 'giai-thich-big-o-notation',
        excerpt: 'Hiểu rõ Big O Notation để viết thuật toán hiệu quả và vượt qua vòng phỏng vấn kỹ thuật.',
        content: `<h2>Big O Notation Là Gì?</h2>
<p>Big O Notation mô tả hiệu suất của thuật toán khi kích thước dữ liệu tăng lên.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Programming',
        tags: ['Algorithm', 'Big O', 'Interview'],
        readTime: 10,
        isPublished: true
      },
      {
        title: 'TypeScript Hay JavaScript: Nên Chọn Gì Năm 2026?',
        slug: 'typescript-hay-javascript-2026',
        excerpt: 'Phân tích chi tiết ưu nhược điểm của TypeScript và JavaScript để đưa ra quyết định đúng đắn.',
        content: `<h2>TypeScript vs JavaScript</h2>
<p>JavaScript là ngôn ngữ, TypeScript là superset của nó với type system.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Technology',
        tags: ['TypeScript', 'JavaScript', 'Comparison'],
        readTime: 6,
        isPublished: true
      },
      {
        title: 'Học Lập Trình Từ Con Số 0: Lộ Trình Chi Tiết 12 Tháng',
        slug: 'lo-trinh-hoc-lap-trinh-12-thang',
        excerpt: 'Lộ trình học lập trình từ A đến Z, phù hợp cho người hoàn toàn không có nền tảng.',
        content: `<h2>Bắt Đầu Từ Đâu?</h2>
<p>Đừng lo lắng nếu bạn chưa biết gì. Chúng tôi sẽ hướng dẫn bạn từng bước.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tutorial',
        tags: ['Beginner', 'Roadmap', 'Learning'],
        readTime: 12,
        isPublished: true
      },
      {
        title: 'Git và GitHub: Hướng Dẫn Cho Người Mới Bắt Đầu',
        slug: 'git-github-cho-nguoi-moi',
        excerpt: 'Tìm hiểu cách sử dụng Git để quản lý version code và GitHub để chia sẻ dự án.',
        content: `<h2>Git Là Gì?</h2>
<p>Git là hệ thống quản lý phiên bản phân tán, giúp theo dõi thay đổi trong code.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tutorial',
        tags: ['Git', 'GitHub', 'Version Control'],
        readTime: 7,
        isPublished: true
      },
      {
        title: 'Cách Trả Lời Khi Được Hỏi "Tại Sao Bạn Muốn Làm Việc Ở Đây?"',
        slug: 'cach-tra-loi-why-do-you-want-to-work-here',
        excerpt: 'Những câu trả lời mẫu và chiến lược để gây ấn tượng với nhà tuyển dụng.',
        content: `<h2>Câu Hỏi Phỏng Vấn Quan Trọng</h2>
<p>Đây là cơ hội để bạn thể hiện sự chuẩn bị và đam mê của mình.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Career',
        tags: ['Interview', 'Job Search', 'Tips'],
        readTime: 4,
        isPublished: true
      },
      {
        title: 'RESTful API là gì? Giải Thích Đơn Giản Cho Developer',
        slug: 'restful-api-la-gi',
        excerpt: 'Hiểu rõ về RESTful API - chuẩn giao tiếp phổ biến nhất trong lập trình hiện đại.',
        content: `<h2>RESTful API</h2>
<p>REST (Representational State Transfer) là một kiểu kiến trúc để xây dựng web service.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Programming',
        tags: ['API', 'REST', 'Backend'],
        readTime: 6,
        isPublished: true
      },
      {
        title: '5 Sai Lầm Thường Gặp Khi Học Lập Trình',
        slug: '5-sai-lam-khi-hoc-lap-trinh',
        excerpt: 'Tránh những bẫy phổ biến này để quá trình học của bạn hiệu quả hơn.',
        content: `<h2>Những Sai Lầm Cần Tránh</h2>
<p>Nhiều người mới học mắc phải những sai lầm cơ bản mà có thể tránh được.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tips',
        tags: ['Beginner', 'Mistakes', 'Learning'],
        readTime: 5,
        isPublished: true
      },
      {
        title: 'Cấu Trúc Dữ Liệu Cây: Từ Cơ Bản Đến Nâng Cao',
        slug: 'cau-truc-du-lieu-cay',
        excerpt: 'Tìm hiểu sâu về Binary Tree, BST và các thuật toán duyệt cây quan trọng.',
        content: `<h2>Cây Trong Khoa Học Máy Tính</h2>
<p>Cấu trúc dữ liệu cây là một trong những cấu trúc quan trọng nhất.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Programming',
        tags: ['Data Structure', 'Tree', 'Algorithm'],
        readTime: 10,
        isPublished: true
      },
      {
        title: 'Xu Hướng IT Năm 2026: Những Công Nghệ Nào Đang Hot?',
        slug: 'xu-huong-it-2026',
        excerpt: 'Khám phá những công nghệ và xu hướng mới nổi bật trong ngành IT năm 2026.',
        content: `<h2>Công Nghệ Của Tương Lai</h2>
<p>Năm 2026 hứa hẹn mang đến nhiều đổi mới trong ngành công nghệ.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'News',
        tags: ['Trends', '2026', 'Technology'],
        readTime: 6,
        isPublished: true
      },
      {
        title: 'MongoDB vs MySQL: Khi Nào Nên Dùng Database Nào?',
        slug: 'mongodb-vs-mysql',
        excerpt: 'So sánh hai loại database phổ biến để chọn giải pháp phù hợp cho dự án của bạn.',
        content: `<h2>SQL vs NoSQL</h2>
<p>Việc chọn đúng database có thể ảnh hưởng lớn đến hiệu suất dự án.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Technology',
        tags: ['MongoDB', 'MySQL', 'Database'],
        readTime: 7,
        isPublished: true
      },
      {
        title: 'Cách Debug Hiệu Quả: Kỹ Năng Không Thể Thiếu Của Developer',
        slug: 'cach-debug-hieu-qua',
        excerpt: 'Những kỹ thuật và công cụ giúp bạn tìm và sửa lỗi nhanh chóng.',
        content: `<h2>Debug Là Nghệ Thuật</h2>
<p>Biết cách debug giỏi sẽ giúp bạn tiết kiệm hàng giờ đồng hồ.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tips',
        tags: ['Debug', 'Tools', 'Productivity'],
        readTime: 5,
        isPublished: true
      },
      {
        title: 'Từ Sinh Viên Đến Senior Developer: Hành Trình 5 Năm Của Tôi',
        slug: 'sinh-vien-den-senior-developer',
        excerpt: 'Chia sẻ kinh nghiệm thực tế và những bài học quý giá trong hành trình trở thành Senior Developer.',
        content: `<h2>Hành Trình Của Một Developer</h2>
<p>Mỗi cấp bậc đều có những thử thách và bài học riêng.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Career',
        tags: ['Career Path', 'Senior', 'Experience'],
        readTime: 8,
        isPublished: true
      },
      {
        title: 'Docker Cho Người Mới: Triển Khai Ứng Dụng Dễ Dàng',
        slug: 'docker-cho-nguoi-moi',
        excerpt: 'Tìm hiểu cách sử dụng Docker để đóng gói và triển khai ứng dụng một cách nhất quán.',
        content: `<h2>Docker Là Gì?</h2>
<p>Docker giúp bạn đóng gói ứng dụng vào container để chạy ở bất kỳ đâu.</p>`,
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=80',
        author: 'HK Learning',
        category: 'Tutorial',
        tags: ['Docker', 'DevOps', 'Deployment'],
        readTime: 9,
        isPublished: true
      }
    ];

    await Blog.insertMany(blogs);

    console.log('\n🎉 ĐÃ CẤY THÀNH CÔNG 18 BÀI VIẾT BLOG:');
    console.log('----------------------------------------------------');
    console.log('1. 5 Lý Do Tại Sao Bạn Nên Học JavaScript Ngay Hôm Nay');
    console.log('2. Hướng Dẫn Từ A-Z Về React Hooks Cho Người Mới Bắt Đầu');
    console.log('3. Node.js vs Python: Ngôn ngữ nào tốt hơn cho Backend?');
    console.log('4. 10 Mẹo Viết Code Sạch Mà Mọi Developer Cần Biết');
    console.log('5. Cách Xây Dựng Portfolio Developer Để Thu Hút Nhà Tuyển Dụng');
    console.log('6. Giải Thích Độ Phức Tạp Thuật Toán: Big O Notation');
    console.log('7. TypeScript Hay JavaScript: Nên Chọn Gì Năm 2026?');
    console.log('8. Học Lập Trình Từ Con Số 0: Lộ Trình Chi Tiết 12 Tháng');
    console.log('9. Git và GitHub: Hướng Dẫn Cho Người Mới Bắt Đầu');
    console.log('10. Cách Trả Lời Khi Được Hỏi "Tại Sao Bạn Muốn Làm Việc Ở Đây?"');
    console.log('11. RESTful API là gì? Giải Thích Đơn Giản Cho Developer');
    console.log('12. 5 Sai Lầm Thường Gặp Khi Học Lập Trình');
    console.log('13. Cấu Trúc Dữ Liệu Cây: Từ Cơ Bản Đến Nâng Cao');
    console.log('14. Xu Hướng IT Năm 2026: Những Công Nghệ Nào Đang Hot?');
    console.log('15. MongoDB vs MySQL: Khi Nào Nên Dùng Database Nào?');
    console.log('16. Cách Debug Hiệu Quả: Kỹ Năng Không Thể Thiếu Của Developer');
    console.log('17. Từ Sinh Viên Đến Senior Developer: Hành Trình 5 Năm Của Tôi');
    console.log('18. Docker Cho Người Mới: Triển Khai Ứng Dụng Dễ Dàng');
    console.log('----------------------------------------------------');
    console.log(`📄 Truy cập: ${(process.env.FRONTEND_URL || 'http://127.0.0.1:5173').replace(/\/+$/, '')}/blog`);
    console.log('\n');

    process.exit();
  } catch (err) {
    console.error('❌ Lỗi cấy dữ liệu blog:', err);
    process.exit(1);
  }
};

seedBlogs();
