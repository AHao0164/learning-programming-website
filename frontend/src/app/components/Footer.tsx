import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Github, ArrowUp } from 'lucide-react';
import '../../styles/f8-theme.css';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#181821', color: '#a9b3bb', padding: '60px 0', marginTop: '60px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', marginBottom: '20px' }}>
             <div style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                cursor: 'pointer'
              }}
              onClick={scrollToTop}>HK</div>
             <span style={{ fontWeight: 700, fontSize: '18px', cursor: 'pointer' }} onClick={scrollToTop}>HK Learning Coding Platform</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
            Điện thoại: 039.458.5077<br/>
            Email: 52300032@student.tdtu.edu.vn<br/>
            Địa chỉ: 19 Nguyễn Hữu Thọ, phường Tân Hưng, Thành phố Hồ Chí Minh
          </p>
        </div>

        <div>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '20px' }}>Về HK</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
            <li style={{ marginBottom: '10px' }}><Link to="/about" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Giới thiệu</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/contact" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Liên hệ</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/faq" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/blog" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '20px' }}>Blog</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
            <li style={{ marginBottom: '10px' }}><Link to="/blog?category=Programming" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Lập trình</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/blog?category=Technology" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Công nghệ</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/blog?category=Career" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Sự nghiệp</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/blog?category=Tutorial" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Hướng dẫn</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/blog" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Xem tất cả</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '20px' }}>Thông tin</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
            <li style={{ marginBottom: '10px' }}><Link to="/courses" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Khóa học</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/leaderboard" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Bảng xếp hạng</Link></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Chính sách bảo mật</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={scrollToTop} style={{ color: 'inherit', textDecoration: 'none' }}>Điều khoản sử dụng</a></li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #2c2c36' }}>
        <div style={{ fontSize: '13px' }}>© 2026 HK. Nền tảng học lập trình hàng đầu Tân Hưng</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Youtube color="#a9b3bb" size={20} />
            <Facebook color="#a9b3bb" size={20} />
            <Github color="#a9b3bb" size={20} />
            <button 
              onClick={scrollToTop}
              style={{
                background: 'none',
                border: '1px solid #3a3a4a',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#a9b3bb',
                marginLeft: '8px'
              }}
              title="Cuộn lên đầu trang"
            >
              <ArrowUp size={16} />
            </button>
        </div>
      </div>
    </footer>
  );
};
