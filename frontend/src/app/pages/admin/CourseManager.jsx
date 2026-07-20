import React, { useState, useEffect } from 'react';
import { Edit, Trash, BookOpen, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { 
    getAdminCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    togglePublishCourse,
    uploadFile
} from '../../../../services/admin.service';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export const CourseManager = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseForm, setCourseForm] = useState({ name: '', price: '', description: '', thumbnail: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: 'Xác nhận', message: '', onConfirm: () => {} });

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const res = await getAdminCourses(page, limit, searchQuery);
                if (res.data) {
                    const formattedCourses = res.data.map(course => ({
                        ...course,
                        id: course._id,
                        name: course.title,
                    }));
                    setCourses(formattedCourses);
                }
                
                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                    setTotalCourses(res.pagination.total);
                }
            } catch (error) {
                toast.error("Không thể tải danh sách khóa học.");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCourses();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [page, limit, searchQuery]);

    const handleTogglePublish = async (courseId, currentStatus) => {
        try {
            toast.loading(currentStatus ? 'Đang ẩn khóa học...' : 'Đang xuất bản...', { id: 'toggle-pub' });
            
            const res = await togglePublishCourse(courseId);
            
            setCourses(prev => prev.map(course => 
                course.id === courseId ? { ...course, isPublished: res.isPublished } : course
            ));
            
            toast.success(res.message, { id: 'toggle-pub' });
        } catch (error) {
            toast.error('Lỗi khi đổi trạng thái', { id: 'toggle-pub' });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        toast.loading('Đang tải ảnh lên...', { id: 'upload-img' });
        try {
            const res = await uploadFile(file);
            // Lưu path tương đối để resolveAssetUrl ghép đúng domain production
            setCourseForm(prev => ({ ...prev, thumbnail: res.imageUrl }));
            toast.success('Tải ảnh thành công!', { id: 'upload-img' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh', { id: 'upload-img' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        if (!courseForm.name.trim()) return;

        try {
            if (editingCourseId) {
                toast.loading('Đang cập nhật khóa học...', { id: 'save-course' });
                await updateCourse(editingCourseId, {
                    title: courseForm.name,
                    description: courseForm.description,
                    price: courseForm.price || 0,
                    thumbnail: courseForm.thumbnail
                });

                setCourses((prev) => prev.map((course) => 
                    course.id === editingCourseId 
                    ? { ...course, name: courseForm.name, description: courseForm.description, price: courseForm.price, thumbnail: courseForm.thumbnail } 
                    : course
                ));
                toast.success('Cập nhật khóa học thành công!', { id: 'save-course' });
            } else {
                toast.loading('Đang tạo khóa học...', { id: 'save-course' });
                const res = await createCourse({
                    title: courseForm.name,
                    description: courseForm.description,
                    price: courseForm.price || 0,
                    thumbnail: courseForm.thumbnail
                });
                
                const newCourse = {
                    ...res.data,
                    id: res.data._id,
                    name: res.data.title,
                    modules: []
                };
                
                setCourses((prev) => [newCourse, ...prev]);
                toast.success('Tạo khóa học thành công!', { id: 'save-course' });
            }
            
            setCourseForm({ name: '', price: '', description: '', thumbnail: '' });
            setShowAddCourseModal(false);
            setEditingCourseId(null);
            setIsUploading(false);
        } catch (error) {
            toast.error('Lỗi khi lưu khóa học.', { id: 'save-course' });
        }
    };

    const handleDeleteCourse = (courseId) => {
        setConfirmConfig({
            isOpen: true,
            message: 'CẢNH BÁO: Xóa khóa học sẽ XÓA SẠCH toàn bộ Chương, Bài học và Bài tập bên trong. Bác chắc chắn chứ?',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xóa khóa học...', { id: 'delete-course' });
                try {
                    await deleteCourse(courseId);
                    setCourses((prev) => prev.filter((item) => item.id !== courseId));
                    toast.success('Đã xóa khóa học vĩnh viễn!', { id: 'delete-course' });
                } catch (error) {
                    toast.error('Lỗi khi xóa khóa học.', { id: 'delete-course' });
                }
            }
        });
    };

    // if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Quản lý khóa học</h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên khóa học..." 
                        className="form-input"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        style={{ padding: '8px 12px', width: '250px' }}
                    />
                    <div style={{ fontSize: '14px', color: '#666', backgroundColor: '#e2e8f0', padding: '8px 16px', borderRadius: '20px', fontWeight: 600 }}>
                        Tổng số: {totalCourses} khóa học
                    </div>
                    <button className="btn btn-primary" style={{ borderRadius: '20px', marginLeft: '8px' }} onClick={() => {
                        setCourseForm({ name: '', price: '', description: '' });
                        setEditingCourseId(null);
                        setShowAddCourseModal(true);
                    }}>
                        + Thêm khóa học
                    </button>
                </div>
            </div>

            {/* Bảng Danh sách */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, width: '10%' }}>ID</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, width: '20%' }}>Tên khóa học</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, width: '25%' }}>Mô tả</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, width: '10%' }}>Giá</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, width: '15%' }}>Trạng thái</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, width: '20%' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Đang tải dữ liệu...</td></tr>
                            ) : courses.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Không tìm thấy khóa học nào.</td></tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace', color: '#64748b' }}>
                                                #{course.id?.slice(-6).toUpperCase()}
                                            </span>
                                        </td>
                                        
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '15px' }}>{course.name}</div>
                                        </td>

                                        <td style={{ padding: '16px', color: '#666' }}>
                                            <div style={{ 
                                                display: '-webkit-box', 
                                                WebkitLineClamp: 2, 
                                                WebkitBoxOrient: 'vertical', 
                                                overflow: 'hidden',
                                                lineHeight: '1.4'
                                            }}>
                                                {course.description || <span style={{ fontStyle: 'italic', color: '#aaa' }}>Không có mô tả</span>}
                                            </div>
                                        </td>

                                        <td style={{ padding: '16px', color: '#f05123', fontWeight: 600, textAlign: 'right' }}>
                                            {Number(course.price || 0).toLocaleString('vi-VN')}đ
                                        </td>

                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleTogglePublish(course.id, course.isPublished)}
                                                style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                                    border: `1px solid ${course.isPublished ? '#16a34a' : '#d1d5db'}`,
                                                    backgroundColor: course.isPublished ? '#dcfce7' : '#f3f4f6',
                                                    color: course.isPublished ? '#16a34a' : '#6b7280',
                                                    fontWeight: 600, fontSize: '12px', transition: 'all 0.2s'
                                                }}
                                            >
                                                {course.isPublished ? <><Globe size={14}/> Đã xuất bản</> : <><Lock size={14}/> Bản nháp</>}
                                            </button>
                                        </td>

                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button 
                                                title="Cấu hình giáo trình" 
                                                className="btn btn-primary" 
                                                style={{ padding: '6px 12px', fontSize: '13px', marginRight: '12px' }}
                                                onClick={() => navigate(`/admin/courses/${course.id}/builder`)}
                                            >
                                                <BookOpen size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Giáo trình
                                            </button>
                                            <button 
                                                title="Sửa thông tin" 
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '12px', color: '#666' }}
                                                onClick={() => {
                                                    setEditingCourseId(course.id);
                                                    setCourseForm({ name: course.name, price: course.price, description: course.description, thumbnail: course.thumbnail || '' });
                                                    setShowAddCourseModal(true);
                                                }}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                title="Xóa khóa học" 
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f05123' }}
                                                onClick={() => handleDeleteCourse(course.id)}
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    
                    {/* PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                Trang {page} / {totalPages}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="btn btn-outline" 
                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Trước
                                </button>
                                <button 
                                    className="btn btn-outline" 
                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
            </div>

            {/* MODAL THÊM / SỬA KHÓA HỌC */}
            {showAddCourseModal && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                    }}
                    onClick={() => setShowAddCourseModal(false)}>
                    <div
                        className="card"
                        style={{ width: '90%', maxWidth: '500px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
                            {editingCourseId ? 'Cập nhật thông tin khóa học' : 'Thêm khóa học mới'}
                        </h2>
                        <form onSubmit={handleSaveCourse}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                                    Tên khóa học <span style={{ color: '#f05123' }}>*</span>
                                </label>
                                <input
                                    type="text" className="form-input" placeholder="Nhập tên khóa học..."
                                    value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                    style={{ width: '100%' }} required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Giá</label>
                                <input
                                    type="number" className="form-input" placeholder="VD: 1299000"
                                    value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Mô tả</label>
                                <textarea
                                    className="form-input" placeholder="Nhập mô tả khóa học..."
                                    value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    rows={4} style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>
                            {/* KHU VỰC UPLOAD ẢNH BÌA */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>Ảnh bìa khóa học</label>
                                
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    {/* Nút chọn file */}
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="form-input"
                                            style={{ padding: '8px', cursor: 'pointer' }}
                                        />
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Định dạng: JPG, PNG, GIF, WEBP. Tối đa 5MB.</div>
                                    </div>
                                    
                                    {/* Khung Preview Ảnh */}
                                    <div style={{ 
                                        width: '120px', height: '80px', borderRadius: '8px', border: '1px dashed #cbd5e1', 
                                        backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                                    }}>
                                        {isUploading ? (
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Đang tải...</span>
                                        ) : courseForm.thumbnail ? (
                                            <img src={courseForm.thumbnail} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có ảnh</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setShowAddCourseModal(false)} style={{ border: '1px solid #ddd' }}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCourseId ? 'Cập nhật' : 'Thêm khóa học'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};