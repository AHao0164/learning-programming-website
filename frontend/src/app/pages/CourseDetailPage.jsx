import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseBySlug } from '../../../services/course.service';
import { enrollmentService } from '../../../services/enrollment.service';
import { resolveAssetUrl } from '../../../services/config';
import { Spinner } from '../components/ui/spinner';
import { toast } from 'sonner';
import '../../styles/f8-theme.css';
import { createVnpayUrl } from '../../../services/payment.service';
import { CourseReviews } from '../components/CourseReviews';

export const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await getCourseBySlug(slug);
        const courseData = response.data;
        setCourse(courseData);

        const token = localStorage.getItem('token');
        if (token && courseData._id) {
          const statusRes = await enrollmentService.checkStatus(courseData._id);
          setIsEnrolled(statusRes.data.isEnrolled);
          setCourseProgress(statusRes.data.progress || 0);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu khóa học:', error);
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug]);

  const handleBuyCourse = async (courseId) => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      toast.error('Vui lòng đăng nhập để mua khóa học!');
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    setIsBuying(true);

    try {
      toast.loading('Đang kết nối cổng thanh toán VNPay...', { id: 'vnpay' });
      const res = await createVnpayUrl(courseId, user.id);

      if (res.success && res.url) {
        toast.success('Chuyển hướng...', { id: 'vnpay' });
        window.location.href = res.url;
      } else {
        toast.error('Không thể tạo giao dịch.', { id: 'vnpay' });
        setIsBuying(false);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống thanh toán.', { id: 'vnpay' });
      setIsBuying(false);
    }
  };

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập để đăng ký khóa học!');
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await enrollmentService.enrollCourse(course._id);
      if (res.data.success) {
        toast.success('Đăng ký thành công! Bắt đầu học thôi 🚀');
        setIsEnrolled(true);
        navigate(`/learning/${course.slug}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 402) {
        toast.info('Đây là khóa học trả phí. Vui lòng thanh toán!');
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spinner /></div>;
  if (!course) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Không tìm thấy khóa học!</div>;

  const totalLessons = course.chapters?.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const thumbnail = resolveAssetUrl(course.thumbnail);

  return (
    <div className="container" style={{ padding: '40px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>{course.title}</h1>
        <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6', marginBottom: '32px' }}>
          {course.description}
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Nội dung khóa học</h2>
        <div style={{ display: 'flex', gap: '15px', color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          <span><strong>{course.chapters?.length || 0}</strong> chương</span>
          <span>•</span>
          <span><strong>{totalLessons || 0}</strong> bài học</span>
        </div>

        <div style={{ border: '1px solid #ebebeb', borderRadius: '8px', overflow: 'hidden' }}>
          {course.chapters?.map((chapter) => (
            <div key={chapter._id}>
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px 20px', borderBottom: '1px solid #ebebeb', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                <span>{chapter.title}</span>
                <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{chapter.lessons?.length} bài học</span>
              </div>

              <div style={{ padding: '10px 0', backgroundColor: 'white' }}>
                {chapter.lessons?.map((lesson) => (
                  <div key={lesson._id} style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f1f1' }}>
                    <span style={{ color: '#333' }}>
                      <span style={{ marginRight: '10px', color: '#fe215e' }}>
                        {lesson.type === 'video' ? '▶' : '📄'}
                      </span>
                      {lesson.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <CourseReviews courseId={course._id} isCompleted={courseProgress >= 100} />
      </div>

      <div style={{ width: '350px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'sticky', top: '86px' }}>
        <div style={{ position: 'relative', height: '200px', backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', backgroundColor: 'white', color: '#fe215e', fontSize: '24px', cursor: 'pointer' }}>▶</button>
          </div>
        </div>

        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', color: '#fe215e', fontWeight: '700', marginBottom: '20px' }}>
            {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
          </h2>

          {isEnrolled ? (
            <button onClick={() => navigate(`/learning/${course.slug}`)} className="btn btn-primary" style={{ width: '100%', marginBottom: '16px', borderRadius: '30px', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              TIẾP TỤC HỌC ➡️
            </button>
          ) : course.price > 0 ? (
            <button onClick={() => handleBuyCourse(course._id)} disabled={isBuying} style={{ width: '100%', marginBottom: '16px', borderRadius: '30px', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#005baa', color: 'white', border: 'none', cursor: isBuying ? 'not-allowed' : 'pointer', opacity: isBuying ? 0.7 : 1 }}>
              {isBuying ? 'ĐANG CHUYỂN HƯỚNG...' : 'THANH TOÁN QUA VNPAY'}
            </button>
          ) : (
            <button onClick={handleEnroll} disabled={isEnrolling} className="btn btn-primary" style={{ width: '100%', marginBottom: '16px', borderRadius: '30px', padding: '12px', fontSize: '16px', fontWeight: 'bold', opacity: isEnrolling ? 0.7 : 1 }}>
              {isEnrolling ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ HỌC NGAY'}
            </button>
          )}

          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: '#444', fontSize: '14px', lineHeight: '2.2' }}>
            <li>🎓 Trình độ: {course.level || 'Cơ bản'}</li>
            <li>📚 Tổng số <strong>{totalLessons}</strong> bài học</li>
            <li>♾️ Truy cập trọn đời</li>
            <li>🏆 Cấp chứng chỉ hoàn thành</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
