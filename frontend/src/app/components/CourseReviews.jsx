import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Star, MessageCircle } from 'lucide-react';
import api from '../../../services/api';
import { resolveAssetUrl } from '../../../services/config';

export const CourseReviews = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${courseId}`);
        if (res.data.success) {
          setReviews(res.data.data);
          setAverage(res.data.averageRating);
          setCount(res.data.count);
        }
      } catch (error) {
        console.error('Lỗi tải đánh giá', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchReviews();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Vui lòng đăng nhập để đánh giá!');
    if (!comment.trim()) return toast.error('Vui lòng nhập nội dung đánh giá!');

    setIsSubmitting(true);
    try {
      const res = await api.post(`/reviews/${courseId}`, { rating, comment });

      if (res.data.success) {
        toast.success('Cảm ơn bạn đã đánh giá!');
        setReviews([res.data.data, ...reviews]);

        const newCount = count + 1;
        const currentTotalStars = parseFloat(average || 0) * count;
        const newAverage = (currentTotalStars + rating) / newCount;

        setCount(newCount);
        setAverage(newAverage.toFixed(1));
        setComment('');
        setRating(5);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (numStars, interactive = false) =>
    [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={index}
          size={interactive ? 28 : 16}
          color={starValue <= numStars ? '#eab308' : '#cbd5e1'}
          fill={starValue <= numStars ? '#eab308' : 'transparent'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.2s' }}
          onClick={() => interactive && setRating(starValue)}
        />
      );
    });

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải đánh giá...</div>;

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageCircle size={24} color="#f05123" /> Đánh giá từ học viên
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: '#fffbeb', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #fef3c7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: '#d97706', lineHeight: '1' }}>{average}</div>
          <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', margin: '8px 0' }}>
            {renderStars(Math.round(average))}
          </div>
          <div style={{ fontSize: '14px', color: '#b45309', fontWeight: 'bold' }}>{count} đánh giá</div>
        </div>
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Bạn cảm thấy khóa học này thế nào?</h3>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {renderStars(rating, true)}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về nội dung, giảng viên, chất lượng video..."
            rows="4"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '14px', marginBottom: '16px', fontFamily: 'inherit', boxSizing: 'border-box' }}
          ></textarea>

          <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#f05123', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {reviews.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
              <img
                src={resolveAssetUrl(rev.userId?.avatar, `https://ui-avatars.com/api/?name=${rev.userId?.name}&background=random`)}
                alt="avatar"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>{rev.userId?.name || 'Học viên'}</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                  {renderStars(rev.rating)}
                </div>
                <p style={{ margin: 0, color: '#334155', fontSize: '15px', lineHeight: '1.6' }}>
                  {rev.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
