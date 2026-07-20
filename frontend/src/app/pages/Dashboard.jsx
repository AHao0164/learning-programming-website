import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Award, CheckCircle, Flame, Target, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { enrollmentService } from '../../../services/enrollment.service';
import { resolveAssetUrl } from '../../../services/config';
import { Spinner } from '../components/ui/spinner';
import '../../styles/f8-theme.css';

const SidebarItem = ({ icon: Icon, label, active, to }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: active ? '#e8ebed' : 'transparent',
      color: active ? '#1a1a1a' : '#404040',
      textDecoration: 'none',
      marginBottom: '8px',
      fontWeight: active ? 600 : 500,
      fontSize: '14px',
    }}
  >
    <Icon size={20} style={{ marginRight: '12px' }} />
    {label}
  </Link>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ completedLessons: 0, recentActivities: [] });
  const [continueCourse, setContinueCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStr));

    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/progress/dashboard');
        const coursesRes = await enrollmentService.getMyCourses();

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        if (coursesRes.data.success) {
          const learning = coursesRes.data.data.filter((c) => c.progress < 100 && c.progress > 0);
          if (learning.length > 0) {
            setContinueCourse(learning[0]);
          } else if (coursesRes.data.data.length > 0) {
            setContinueCourse(coursesRes.data.data[0]);
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spinner /></div>;
  if (!user) return null;

  return (
    <div className="container dashboard-container" style={{ display: 'flex', gap: '40px', maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <aside className="sidebar-desktop" style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '86px', height: 'fit-content' }}>
        <nav>
          <SidebarItem icon={Home} label="Tổng quan" active to="/dashboard" />
          <SidebarItem icon={BookOpen} label="Khóa học của tôi" to="/my-courses" />
          <SidebarItem icon={Award} label="Chứng chỉ" to="/profile" />
        </nav>
      </aside>

      <main style={{ flex: 1 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Chào mừng trở lại, {user.name}! 👋</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ background: 'rgba(240, 81, 35, 0.1)', padding: '16px', borderRadius: '50%', marginRight: '16px' }}>
              <CheckCircle size={28} color="#f05123" />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{stats.completedLessons}</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Bài đã hoàn thành</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '16px', borderRadius: '50%', marginRight: '16px' }}>
              <Target size={28} color="#eab308" />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{user.xp || 0}</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Điểm kinh nghiệm</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '16px', borderRadius: '50%', marginRight: '16px' }}>
              <Flame size={28} color="#f97316" fill="#f97316" />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{user.streak || 0}</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Ngày Streak</div>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>Tiếp tục học</h2>
        {continueCourse ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', marginBottom: '40px', display: 'flex', gap: '24px', flexWrap: 'wrap', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <img
              src={resolveAssetUrl(continueCourse.thumbnail)}
              alt="Course"
              style={{ width: '240px', height: '140px', borderRadius: '12px', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>{continueCourse.title}</h3>

              <div style={{ marginBottom: '20px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>
                  <span>Tiến độ học tập</span>
                  <span style={{ color: '#f05123' }}>{continueCourse.progress || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${continueCourse.progress || 0}%`, height: '100%', backgroundColor: '#f05123', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>

              <div>
                <Link to={`/learning/${continueCourse.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f05123', color: 'white', textDecoration: 'none', borderRadius: '24px', padding: '10px 24px', fontWeight: 'bold', fontSize: '14px' }}>
                  Học tiếp <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '40px 20px', borderRadius: '16px', marginBottom: '40px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', color: '#475569', marginBottom: '16px' }}>Bạn chưa tham gia khóa học nào!</h3>
            <Link to="/" style={{ backgroundColor: '#f05123', color: 'white', textDecoration: 'none', borderRadius: '24px', padding: '10px 24px', fontWeight: 'bold' }}>Khám phá khóa học ngay</Link>
          </div>
        )}

        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>Hoạt động gần đây</h2>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => {
              const timeAgo = (dateStr) => {
                const diff = new Date() - new Date(dateStr);
                const minutes = Math.floor(diff / 60000);
                if (minutes < 60) return `${minutes} phút trước`;
                const hours = Math.floor(minutes / 60);
                if (hours < 24) return `${hours} giờ trước`;
                return `${Math.floor(hours / 24)} ngày trước`;
              };

              return (
                <div key={index} style={{ padding: '20px', borderBottom: index < stats.recentActivities.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={20} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                      Bạn đã hoàn thành bài học <span style={{ color: '#0f172a' }}>"{activity.lessonId?.title || 'Bài học'}"</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                      {timeAgo(activity.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có hoạt động học tập nào.</div>
          )}
        </div>
      </main>
    </div>
  );
};
