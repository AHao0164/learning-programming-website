import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { blogService } from '../../../services/blog.service';
import { resolveAssetUrl } from '../../../services/config';
import { Spinner } from '../components/ui/spinner';

export const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchBlogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await blogService.getAll(page);
      if (res.success) {
        setBlogs(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error('Lỗi tải blog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(pagination.currentPage);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBlogs(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ background: 'linear-gradient(135deg, #f05123 0%, #ff6b35 100%)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>
          Blog Công Nghệ
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          Cập nhật những bài viết mới nhất về lập trình, công nghệ và sự nghiệp IT
        </p>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Spinner />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {blogs.map((blog) => (
                <Link to={`/blog/${blog.slug}`} key={blog._id} style={{ textDecoration: 'none' }}>
                  <article style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={resolveAssetUrl(blog.thumbnail)}
                        alt={blog.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      />
                      <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#f05123', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                        {blog.category}
                      </span>
                    </div>

                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {blog.title}
                      </h3>

                      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {blog.excerpt}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#888', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {blog.readTime} phút
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} />
                          {blog.views} lượt xem
                        </span>
                        <span style={{ marginLeft: 'auto' }}>
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '48px' }}>
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', color: pagination.hasPrevPage ? '#333' : '#ccc', fontWeight: 500 }}>
                  <ChevronLeft size={18} />
                  Trước
                </button>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => handlePageChange(page)} style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', backgroundColor: page === pagination.currentPage ? '#f05123' : 'white', color: page === pagination.currentPage ? 'white' : '#333', fontWeight: 600, cursor: 'pointer' }}>
                      {page}
                    </button>
                  ))}
                </div>

                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', color: pagination.hasNextPage ? '#333' : '#ccc', fontWeight: 500 }}>
                  Sau
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
