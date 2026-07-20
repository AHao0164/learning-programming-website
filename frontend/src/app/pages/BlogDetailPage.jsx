import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Eye, Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import { blogService } from '../../../services/blog.service';
import { resolveAssetUrl } from '../../../services/config';
import { Spinner } from '../components/ui/spinner';

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await blogService.getBySlug(slug);
        if (res.success) {
          setBlog(res.data);
        } else {
          navigate('/blog');
        }
      } catch (error) {
        console.error('Lỗi tải blog:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, navigate]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner /></div>;
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/blog" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', backgroundColor: '#f05123', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
          Quay lại Blog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
        <img src={resolveAssetUrl(blog.thumbnail)} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)' }} />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ paddingTop: '24px' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            <ArrowLeft size={18} />
            Quay lại Blog
          </Link>
        </div>

        <article style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', marginTop: '24px', marginBottom: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <span style={{ display: 'inline-block', backgroundColor: '#f05123', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {blog.category}
          </span>

          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.3, marginBottom: '20px' }}>
            {blog.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0', marginBottom: '32px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '14px' }}>
              <Calendar size={16} />
              {formatDate(blog.createdAt)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '14px' }}>
              <Clock size={16} />
              {blog.readTime} phút đọc
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '14px' }}>
              <Eye size={16} />
              {blog.views} lượt xem
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '14px' }}>
              <BookOpen size={16} />
              Tác giả: {blog.author}
            </span>
          </div>

          <p style={{ fontSize: '18px', color: '#444', lineHeight: 1.7, marginBottom: '32px', fontStyle: 'italic', paddingLeft: '20px', borderLeft: '4px solid #f05123' }}>
            {blog.excerpt}
          </p>

          <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#333' }} dangerouslySetInnerHTML={{ __html: blog.content }} />

          {blog.tags && blog.tags.length > 0 && (
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '12px', fontWeight: 600 }}>
                Tags:
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {blog.tags.map((tag, index) => (
                  <span key={index} style={{ padding: '6px 14px', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '13px', color: '#666' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <div style={{ backgroundColor: '#fff7ed', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>
            Bạn có thấy bài viết hữu ích?
          </h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Hãy bắt đầu học lập trình ngay hôm nay để nâng cao kỹ năng của bạn!
          </p>
          <Link to="/courses" style={{ display: 'inline-block', padding: '12px 32px', backgroundColor: '#f05123', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Khám phá khóa học
          </Link>
        </div>
      </div>
    </div>
  );
};
