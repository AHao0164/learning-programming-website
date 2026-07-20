import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Award, Home } from 'lucide-react';
import { enrollmentService } from '../../../services/enrollment.service';
import { resolveAssetUrl } from '../../../services/config';
import { Spinner } from '../components/ui/spinner';
import '../../styles/f8-theme.css';

const SidebarItem = ({ icon: Icon, label, active, to }) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', backgroundColor: active ? '#e8ebed' : 'transparent', color: active ? '#1a1a1a' : '#404040', textDecoration: 'none', marginBottom: '8px', fontWeight: active ? 600 : 500, fontSize: '14px' }}>
    <Icon size={20} style={{ marginRight: '12px' }} />
    {label}
  </Link>
);

export const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentService.getMyCourses()
      .then((res) => setMyCourses(res.data.data))
      .catch((err) => console.error('Lỗi lấy khóa học', err))
      .finally(() => setLoading(false));
  }, []);

  const handleContinueLearning = (courseSlug) => {
    navigate(`/learning/${courseSlug}`);
  };

  return (
    <div className="container dashboard-container">
      <aside className="sidebar-desktop" style={{ width: '240px', flexShrink: 0, paddingRight: '20px', position: 'sticky', top: '86px', height: 'fit-content' }}>
        <nav>
          <SidebarItem icon={Home} label="Tổng quan" to="/dashboard" />
          <SidebarItem icon={BookOpen} label="Khóa học của tôi" active to="/my-courses" />
          <SidebarItem icon={Award} label="Chứng chỉ" to="/profile" />
        </nav>
      </aside>

      <main style={{ flex: 1 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Khóa học của tôi</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}><Spinner /></div>
        ) : myCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
            <p>Bạn chưa đăng ký khóa học nào.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: '10px', display: 'inline-block', borderRadius: '20px', padding: '8px 24px' }}>Khám phá ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {myCourses.map((course) => (
              <div key={course.enrollmentId} className="card" style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <img src={resolveAssetUrl(course.thumbnail, 'https://images.unsplash.com/photo-1672307974995-cd253f7f7eeb?auto=format&fit=crop&w=300&q=80')} alt={course.title} style={{ width: '240px', height: '140px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{course.title}</h3>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                    {course.lastLessonSlug ? 'Đang học dở...' : 'Hãy bắt đầu bài học đầu tiên!'}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{course.progress || 0}% hoàn thành</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${course.progress || 0}%`, height: '100%', backgroundColor: '#f05123', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>

                  <button onClick={() => handleContinueLearning(course.slug)} className="btn btn-primary" style={{ borderRadius: '20px', padding: '8px 24px', fontWeight: 'bold' }}>
                    {course.progress > 0 ? 'Học tiếp ➡️' : 'Bắt đầu học 🚀'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
