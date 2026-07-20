import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Users, Award, Zap, Heart } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #f05123 0%, #ff6b35 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>
          Về Chúng Tôi
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          Nền tảng học lập trình hàng đầu Việt Nam
        </p>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
        
        {/* Giới thiệu */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px', color: '#1a1a1a' }}>
            Chào mừng đến với HK Learning!
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
            <strong>HK Learning Coding Platform</strong> là nền tảng học lập trình trực tuyến được thành lập với sứ mệnh 
            mang đến cho người Việt Nam những khóa học lập trình chất lượng cao, dễ tiếp cận và thực tế.
          </p>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444' }}>
            Chúng tôi tin rằng mọi người đều có thể học lập trình, bất kể tuổi tác hay nền tảng kiến thức. 
            Với đội ngũ giảng viên giàu kinh nghiệm từ các công ty công nghệ hàng đầu, chúng tôi cam kết 
            mang đến những bài học thực tế và cập nhật xu hướng công nghệ mới nhất.
          </p>
        </div>

        {/* Số liệu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {[
            { icon: Users, label: 'Học viên', value: '10,000+' },
            { icon: Code, label: 'Bài học', value: '500+' },
            { icon: Award, label: 'Khóa học', value: '50+' },
            { icon: Zap, label: 'Bài tập Code', value: '1000+' }
          ].map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <stat.icon size={40} color="#f05123" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sứ mệnh */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '60px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: '#1a1a1a' }}>
            Sứ mệnh của chúng tôi
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
            Chúng tôi không chỉ đơn thuần dạy lập trình. Chúng tôi đang xây dựng một cộng đồng 
            những người đam mê công nghệ, nơi mọi người có thể học hỏi, chia sẻ và phát triển cùng nhau.
          </p>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444' }}>
            Với sự kết hợp giữa <strong>AI Trợ giảng</strong> và <strong>Trình biên dịch code trực tuyến</strong>, 
            chúng tôi mang đến trải nghiệm học tập tương tác và hiệu quả nhất.
          </p>
        </div>

        {/* Giá trị cốt lõi */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#1a1a1a' }}>
            Giá trị cốt lõi
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Chất lượng', desc: 'Nội dung được nghiên cứu kỹ lưỡng và cập nhật liên tục' },
              { title: 'Thực tế', desc: 'Bài tập và dự án bám sát nhu cầu thị trường lao động' },
              { title: 'Hỗ trợ', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp thắc mắc' },
              { title: 'Cộng đồng', desc: 'Kết nối hàng nghìn học viên trên khắp Việt Nam' }
            ].map((value, index) => (
              <div key={index} style={{
                backgroundColor: '#fff7ed',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f05123' }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #f05123 0%, #ff6b35 100%)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
            Đăng ký ngay hôm nay và nhận ưu đãi học phí lên đến 50%
          </p>
          <Link 
            to="/courses"
            style={{
              display: 'inline-block',
              padding: '14px 40px',
              backgroundColor: 'white',
              color: '#f05123',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '16px'
            }}
          >
            Khám phá khóa học
          </Link>
        </div>
      </div>
    </div>
  );
};
