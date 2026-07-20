import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllCourses } from '../../../services/course.service';
import { resolveAssetUrl } from '../../../services/config';
import { Spinner } from '../components/ui/spinner';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all');
  const [level, setLevel] = useState(searchParams.get('level') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const searchQuery = searchParams.get('search') || '';
  const limit = 9;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', limit);
        
        if (filter !== 'all') {
          params.append('filter', filter);
        }
        if (level !== 'all') {
          params.append('level', level);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        const res = await getAllCourses(params.toString());
        
        if (res.success) {
          setCourses(res.data || []);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
        } else {
          setCourses([]);
          setTotal(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Không thể lấy dữ liệu khóa học:', error);
        setError('Không thể tải danh sách khóa học lúc này.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, filter, level, searchQuery]);

  // Update URL params when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (newFilter === 'all') {
      newParams.delete('filter');
    } else {
      newParams.set('filter', newFilter);
    }
    setSearchParams(newParams);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (newLevel === 'all') {
      newParams.delete('level');
    } else {
      newParams.set('level', newLevel);
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
            color: currentPage === 1 ? '#ccc' : '#333',
            borderRadius: '8px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          &lt;
        </button>
        
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} style={{ padding: '8px 12px', color: '#666' }}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: currentPage === page ? '#fe215e' : 'white',
                color: currentPage === page ? 'white' : '#333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: currentPage === page ? 700 : 500,
                minWidth: '40px'
              }}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
            color: currentPage === totalPages ? '#ccc' : '#333',
            borderRadius: '8px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          &gt;
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spinner /> <span style={{ marginLeft: '10px' }}>Đang tải khóa học...</span>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>{error}</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Khóa học nổi bật</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Tham gia các khóa học chất lượng để nâng cao kỹ năng lập trình của bạn.</p>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'free', 'pro'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              style={{
                padding: '10px 20px',
                border: filter === f ? 'none' : '1px solid #ddd',
                backgroundColor: filter === f ? '#fe215e' : 'white',
                color: filter === f ? 'white' : '#333',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: filter === f ? 700 : 500,
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'Tất cả' : f === 'free' ? 'Miễn phí' : 'Trả phí'}
            </button>
          ))}
        </div>
        
        <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '12px', display: 'flex', gap: '8px' }}>
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              style={{
                padding: '10px 16px',
                border: level === l ? 'none' : '1px solid #ddd',
                backgroundColor: level === l ? '#1473e6' : 'white',
                color: level === l ? 'white' : '#333',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: level === l ? 700 : 500,
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {l === 'all' ? 'Mọi cấp độ' : l}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div style={{ marginBottom: '24px', color: '#666' }}>
        {total > 0 ? (
          <p style={{ margin: 0 }}>
            Hiển thị <strong>{courses.length}</strong> trong <strong>{total}</strong> khóa học
          </p>
        ) : (
          <p style={{ margin: 0 }}>Không có khóa học nào</p>
        )}
      </div>

      {/* Search Result Notice */}
      {searchQuery && (
        <div style={{ marginBottom: '24px', padding: '12px 20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#2e7d32' }}>
            Kết quả tìm kiếm cho: <strong>"{searchQuery}"</strong>
          </p>
        </div>
      )}

      {/* Course Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {courses.map((course) => (
          <div
            key={course._id}
            style={{ border: '1px solid #eee', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease-in-out' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#f0f0f0' }}>
              <img 
                src={resolveAssetUrl(course.thumbnail, 'https://images.unsplash.com/photo-1627398240309-08a9a21dc314?auto=format&fit=crop&w=800&q=80')} 
                alt={course.title} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              {course.price > 0 && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#1c1c1c', color: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>📑 PRO</div>
              )}
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', lineHeight: '1.4', minHeight: '44px' }}>
                {course.title}
              </h3>

              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#fe215e', fontSize: '18px' }}>
                  {!course.price || course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                </span>

                <Link to={`/courses/${course.slug}`} style={{ backgroundColor: '#fe215e', color: 'white', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            {searchQuery 
              ? `Không tìm thấy khóa học nào phù hợp với từ khóa "${searchQuery}"`
              : 'Không có khóa học nào trong danh mục này'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
