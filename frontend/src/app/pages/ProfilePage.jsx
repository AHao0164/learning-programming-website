import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Zap, Award, BookOpen, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Spinner } from '../components/ui/spinner';
import { enrollmentService } from '../../../services/enrollment.service';
import { resolveAssetUrl } from '../../../services/config';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [learningCourses, setLearningCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('learning');
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Vui lòng đăng nhập!');
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStr));

    const fetchData = async () => {
      try {
        const res = await enrollmentService.getMyCourses();
        if (res.data.success) {
          const finished = res.data.data.filter((c) => c.progress === 100 || c.status === 'completed');
          const learning = res.data.data.filter((c) => c.progress < 100 && c.status !== 'completed');
          setCompletedCourses(finished);
          setLearningCourses(learning);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu', error);
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (certData) {
      const generateCertificate = async () => {
        const element = document.getElementById('certificate-template');
        if (element) {
          toast.loading('Đang tạo chứng chỉ...', { id: 'cert' });
          try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Chung_Chi_${certData.title.replace(/\s+/g, '_')}.png`;
            link.click();
            toast.success('Tải chứng chỉ thành công! 🎉', { id: 'cert' });
          } catch (err) {
            toast.error('Lỗi khi tạo chứng chỉ!', { id: 'cert' });
          } finally {
            setCertData(null);
          }
        }
      };

      setTimeout(generateCertificate, 300);
    }
  }, [certData]);

  const renderHeatmap = () => {
    const squares = [];
    const today = new Date();
    const activityLog = user.activityLog || {};

    for (let i = 179; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const count = activityLog[dateString] || 0;

      let intensity = 0;
      if (count > 0 && count <= 2) intensity = 1;
      else if (count > 2 && count <= 4) intensity = 2;
      else if (count > 4 && count <= 6) intensity = 3;
      else if (count > 6) intensity = 4;

      const bgColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

      squares.push(
        <div
          key={i}
          style={{ width: '12px', height: '12px', backgroundColor: bgColors[intensity], borderRadius: '2px', cursor: 'pointer' }}
          title={`${dateString}: Hoàn thành ${count} bài học`}
        ></div>
      );
    }

    return squares;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spinner /></div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
      <div style={{ width: '320px', backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={resolveAssetUrl(user.avatar, `https://ui-avatars.com/api/?name=${user.name}&background=random&size=200`)}
          alt="avatar"
          style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #f8fafc', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}
        />
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', color: '#0f172a', textAlign: 'center' }}>{user.name}</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>{user.email}</p>

        <Link to="/settings" style={{ width: '100%', padding: '10px 0', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '30px' }}>
          Chỉnh sửa hồ sơ
        </Link>

        <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600 }}>
              <Flame color="#f97316" fill="#f97316" size={20} /> Chuỗi ngày
            </div>
            <span style={{ fontWeight: 'bold', color: '#ea580c', fontSize: '18px' }}>{user.streak || 0}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600 }}>
              <Zap color="#eab308" fill="#eab308" size={20} /> Tổng XP
            </div>
            <span style={{ fontWeight: 'bold', color: '#ca8a04', fontSize: '18px' }}>{user.xp || 0}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>Hoạt động học tập</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'flex-start' }}>
            {renderHeatmap()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            <span>Ít</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((c) => (
                <div key={c} style={{ width: '12px', height: '12px', backgroundColor: c, borderRadius: '2px' }}></div>
              ))}
            </div>
            <span>Nhiều</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '32px', borderBottom: '2px solid #f1f5f9', marginBottom: '24px' }}>
            <button onClick={() => setActiveTab('learning')} style={{ padding: '0 0 12px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: activeTab === 'learning' ? '#f05123' : '#64748b', borderBottom: activeTab === 'learning' ? '3px solid #f05123' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}>
              Đang học ({learningCourses.length})
            </button>
            <button onClick={() => setActiveTab('completed')} style={{ padding: '0 0 12px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', color: activeTab === 'completed' ? '#10b981' : '#64748b', borderBottom: activeTab === 'completed' ? '3px solid #10b981' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }}>
              Đã hoàn thành ({completedCourses.length})
            </button>
          </div>

          {activeTab === 'learning' && (
            learningCourses.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>Bạn chưa đăng ký khóa học nào.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {learningCourses.map((course) => (
                  <div key={course.enrollmentId} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={resolveAssetUrl(course.thumbnail)} alt={course.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>{course.title}</h3>
                      <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', marginBottom: '8px' }}>
                        <div style={{ width: `${course.progress}%`, backgroundColor: '#f05123', height: '100%', borderRadius: '3px' }}></div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tiến độ</span>
                        <span style={{ fontWeight: 'bold', color: '#f05123' }}>{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'completed' && (
            completedCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Award size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#94a3b8' }}>Hãy hoàn thành 100% bài học để nhận chứng chỉ nhé!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {completedCourses.map((course) => (
                  <div key={course.enrollmentId} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0fdf4' }}>
                    <img src={resolveAssetUrl(course.thumbnail)} alt={course.title} style={{ width: '100%', height: '140px', objectFit: 'cover', opacity: 0.9 }} />
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#064e3b' }}>{course.title}</h3>
                      <button onClick={() => setCertData(course)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        <Download size={16} /> Tải chứng chỉ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {certData && (
          <div id="certificate-template" style={{ width: '1000px', height: '700px', backgroundColor: '#fff', padding: '40px', boxSizing: 'border-box', position: 'relative', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
            <div style={{ width: '100%', height: '100%', border: '12px solid #0f172a', padding: '10px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', height: '100%', border: '4px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f05123', letterSpacing: '2px', marginBottom: '40px' }}>HK LEARNING PLATFORM</div>
                <div style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '20px' }}>Giấy Chứng Nhận</div>
                <div style={{ fontSize: '20px', color: '#64748b', marginBottom: '20px' }}>Chứng nhận học viên</div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1d4ed8', fontStyle: 'italic', marginBottom: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px', display: 'inline-block', minWidth: '400px' }}>{user.name}</div>
                <div style={{ fontSize: '20px', color: '#64748b', marginBottom: '20px' }}>Đã hoàn thành xuất sắc khóa học</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginBottom: '60px', maxWidth: '800px' }}>{certData.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 60px', boxSizing: 'border-box', marginTop: 'auto' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>{new Date().toLocaleDateString('vi-VN')}</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Ngày cấp</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontFamily: "'Brush Script MT', cursive", color: '#0f172a', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px', fontWeight: 'bold' }}>H.Kha</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Giám đốc Đào tạo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
