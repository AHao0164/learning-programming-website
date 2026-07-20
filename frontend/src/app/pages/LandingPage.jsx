import React, { useState, useEffect } from 'react';
import { Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/ui/spinner';
import { getAllCourses } from '../../../services/course.service';
import { resolveAssetUrl } from '../../../services/config';
import '../../styles/f8-theme.css';

export const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getAllCourses('limit=100'); // Fetch đủ để hiển thị cả free và pro
        setCourses(res.data || []);
      } catch (error) {
        console.error('Lỗi tải danh sách khóa học:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const proCourses = courses.filter((course) => course.price > 0);
  const freeCourses = courses.filter((course) => !course.price || course.price === 0);
  const totalStudents = courses.reduce((acc, course) => acc + (course.studentCount || 0), 0);

  const [showAllPro, setShowAllPro] = useState(false);
  const [showAllFree, setShowAllFree] = useState(false);

  const displayedProCourses = showAllPro ? proCourses : proCourses.slice(0, 3);
  const displayedFreeCourses = showAllFree ? freeCourses : freeCourses.slice(0, 3);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spinner /></div>;
  }

  return (
    <div>
      <section style={{ padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', minHeight: '360px' }}>
          <div style={{ flex: 1, background: 'linear-gradient(to right, #fe215e, #ff9402)', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', lineHeight: '1.2' }}>Nền tảng học lập trình trực tuyến hàng đầu</h1>
            <p style={{ fontSize: '16px', maxWidth: '500px', lineHeight: '1.6', marginBottom: '32px', opacity: 0.9 }}>
              Khóa học lập trình từ cơ bản đến nâng cao. Thực chiến dự án, review code 1-1. Hơn {totalStudents > 0 ? totalStudents : '300.000'} học viên đã tham gia.
            </p>
            <div>
              <Link to="/courses" className="btn" style={{ backgroundColor: 'white', color: '#fe215e', fontWeight: 700, padding: '12px 28px', borderRadius: '24px', fontSize: '16px' }}>
                Đăng ký học ngay
              </Link>
            </div>
          </div>
          <div className="hero-image-desktop" style={{ flex: 1.2, backgroundImage: `url('https://images.unsplash.com/photo-1529429612779-c8e40ef2f36d?auto=format&fit=crop&w=1200&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '300px' }}></div>
        </div>
      </section>

      <section style={{ padding: '20px 0 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '40px', padding: '0 20px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#242424', margin: 0 }}>{totalStudents > 0 ? totalStudents.toLocaleString() : '285.904'}+</h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Học viên</p>
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#242424', margin: 0 }}>{courses.length > 0 ? courses.length : '108'}+</h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0' }}>Khóa học</p>
            </div>
          </div>
        </div>
      </section>

      {proCourses.length > 0 && (
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Khóa học Pro <span style={{ backgroundColor: '#1473e6', color: 'white', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '8px' }}>Mới</span></h2>
              {!showAllPro && proCourses.length > 3 && (
                <Link to="/courses?filter=pro" style={{ color: '#f05123', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Xem thêm &gt;</Link>
              )}
            </div>

            <div className="grid-cols-3">
              {displayedProCourses.map((course) => (
                <Link to={`/courses/${course.slug}`} key={course._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#f0f0f0' }}>
                      <img
                        src={resolveAssetUrl(course.thumbnail, 'https://images.unsplash.com/photo-1672307974995-cd253f7f7eeb?auto=format&fit=crop&w=600&q=80')}
                        alt={course.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#1c1c1c', color: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>📑 PRO</div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', minHeight: '40px', lineHeight: '1.4' }}>{course.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                        <Users size={16} /> <span>{course.studentCount > 0 ? course.studentCount : 'Mới ra mắt'} học viên</span>
                      </div>
                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#f05123', fontWeight: 'bold', fontSize: '18px' }}>{course.price.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {freeCourses.length > 0 && (
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Khóa học miễn phí</h2>
              {!showAllFree && freeCourses.length > 3 && (
                <Link to="/courses?filter=free" style={{ color: '#f05123', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Xem thêm &gt;</Link>
              )}
            </div>

            <div className="grid-cols-3">
              {displayedFreeCourses.map((course) => (
                <Link to={`/courses/${course.slug}`} key={course._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#f0f0f0' }}>
                      <img
                        src={resolveAssetUrl(course.thumbnail, 'https://images.unsplash.com/photo-1529429612779-c8e40ef2f36d?auto=format&fit=crop&w=600&q=80')}
                        alt={course.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', minHeight: '40px', lineHeight: '1.4' }}>{course.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                        <Users size={16} /> <span>{course.studentCount > 0 ? course.studentCount : 'Mới ra mắt'} học viên</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '60px 0', backgroundColor: '#f5f5f5' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Bạn nhận được gì từ các khóa học này?</h2>
            <p style={{ maxWidth: '600px', color: '#666', marginTop: '10px' }}>Hệ thống học tập bài bản, chi tiết và có tính thực chiến cao.</p>

            <div className="grid-cols-3" style={{ width: '100%', marginTop: '40px', textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ color: '#f05123' }}><CheckCircle /></div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Lộ trình rõ ràng</h3>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Chương trình học được thiết kế bài bản từ cơ bản tới nâng cao.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ color: '#f05123' }}><CheckCircle /></div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Học qua dự án</h3>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Mỗi khóa học đều đi kèm với các dự án thực tế để bạn thực hành.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ color: '#f05123' }}><CheckCircle /></div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Hỗ trợ tận tình</h3>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Đội ngũ trợ giảng và cộng đồng luôn sẵn sàng giải đáp thắc mắc của bạn.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
