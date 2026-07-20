import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAdminUsers, toggleUserStatus, getUserProgressAdmin } from '../../../../services/admin.service';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const cellStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #eee'
};

export const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: 'Xác nhận', message: '', onConfirm: () => {} });

    const [selectedUserForProgress, setSelectedUserForProgress] = useState(null);
    const [showUserProgressModal, setShowUserProgressModal] = useState(false);
    const [progressData, setProgressData] = useState(null);
    
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await getAdminUsers(page, limit, searchQuery);
                
                if (res.data) {
                    const formattedUsers = res.data.map(u => ({ 
                        ...u, 
                        id: u._id,
                        status: u.status || 'active' 
                    }));
                    setUsers(formattedUsers);
                }

                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                    setTotalUsers(res.pagination.total);
                }
            } catch (error) {
                toast.error("Không thể tải danh sách người dùng.");
            } finally {
                setLoading(false);
            }
        };
        
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [page, limit, searchQuery]);

    const handleToggleStatus = (userId, currentStatus) => {
        setConfirmConfig({
            isOpen: true,
            message: `Bạn có chắc muốn ${currentStatus === 'active' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản này?`,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                toast.loading('Đang xử lý...', { id: 'toggle-status' });
                try {
                    const res = await toggleUserStatus(userId);
                    
                    setUsers(prev => prev.map(user => 
                        user.id === userId ? { ...user, status: res.status } : user
                    ));
                    
                    toast.success(res.message, { id: 'toggle-status' });
                } catch (error) {
                    toast.error('Lỗi hệ thống khi đổi trạng thái.', { id: 'toggle-status' });
                }
            }
        });
    };

    // if (loading) return <div style={{ padding: '24px' }}>Đang tải danh sách người dùng...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Quản lý người dùng</h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, email..." 
                        className="form-input"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        style={{ padding: '8px 12px', width: '250px' }}
                    />
                    <div style={{ fontSize: '14px', color: '#666', backgroundColor: '#e2e8f0', padding: '8px 16px', borderRadius: '20px', fontWeight: 600 }}>
                        Tổng số: {totalUsers} học viên
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={cellStyle}>ID / Ngày tham gia</th>
                            <th style={cellStyle}>Học viên</th>
                            <th style={cellStyle}>Trạng thái</th>
                            <th style={{ ...cellStyle, textAlign: 'center' }}>Tiến độ</th>
                            <th style={{ ...cellStyle, textAlign: 'right' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Không tìm thấy học viên nào.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={cellStyle}>
                                        <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#64748b', fontSize: '12px', display: 'block', width: 'fit-content', marginBottom: '4px' }}>
                                            #{user.id.slice(-6).toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </td>
                                    
                                    <td style={cellStyle}>
                                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>{user.name}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</div>
                                    </td>
                                    
                                    <td style={cellStyle}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                                            backgroundColor: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                                            color: user.status === 'active' ? '#16a34a' : '#dc2626'
                                        }}>
                                            {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    
                                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '6px 12px', fontSize: '13px', color: '#3b82f6', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                                            onClick={async () => {
                                                setSelectedUserForProgress(user);
                                                setShowUserProgressModal(true);
                                                setProgressData(null);
                                                
                                                try {
                                                    const res = await getUserProgressAdmin(user.id);
                                                    setProgressData(res.data);
                                                } catch (err) {
                                                    toast.error("Không thể lấy tiến độ học tập");
                                                }
                                            }}>
                                            Xem báo cáo
                                        </button>
                                    </td>
                                    
                                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                                        <button
                                            className="btn"
                                            style={{ 
                                                padding: '6px 16px', fontSize: '13px', fontWeight: 600,
                                                backgroundColor: user.status === 'active' ? '#fff' : '#f05123',
                                                border: `1px solid ${user.status === 'active' ? '#ef4444' : '#f05123'}`,
                                                color: user.status === 'active' ? '#ef4444' : '#fff'
                                            }}
                                            onClick={() => handleToggleStatus(user.id, user.status)}>
                                            {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
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

            {/* Modal Báo cáo tiến độ */}
            {showUserProgressModal && selectedUserForProgress && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowUserProgressModal(false)}>
                    <div className="card" style={{ width: '90%', maxWidth: '800px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Báo cáo học tập: <span style={{ color: '#f05123' }}>{selectedUserForProgress.name}</span></h2>
                            <button style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }} onClick={() => setShowUserProgressModal(false)}>&times;</button>
                        </div>
                        
                        {!progressData ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu tiến độ...</div>
                        ) : (
                            <>
                                {/* Thông tin tổng quan */}
                                <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e3e6ea' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                        <div><div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Ngày tham gia</div><div style={{ fontSize: '16px', fontWeight: 600 }}>{progressData.joinedDate}</div></div>
                                        <div><div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Khóa học đăng ký</div><div style={{ fontSize: '16px', fontWeight: 600, color: '#3b82f6' }}>{progressData.enrolledCourses.length}</div></div>
                                        <div><div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Bài tập hoàn thành</div><div style={{ fontSize: '16px', fontWeight: 600, color: '#16a34a' }}>{progressData.totalProblemsCompleted}</div></div>
                                    </div>
                                </div>

                                {/* Danh sách khóa học */}
                                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Chi tiết khóa học</h3>
                                {progressData.enrolledCourses.length === 0 ? (
                                    <div style={{ color: '#777', padding: '20px', textAlign: 'center', border: '1px dashed #ddd', borderRadius: '8px' }}>Học viên chưa đăng ký khóa học nào.</div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {progressData.enrolledCourses.map((course, idx) => (
                                            <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{course.courseName}</div>
                                                        <div style={{ fontSize: '13px', color: '#777' }}>Truy cập gần nhất: {course.lastAccessed}</div>
                                                    </div>
                                                    <div style={{ fontSize: '18px', fontWeight: 700, color: course.progress >= 80 ? '#16a34a' : course.progress >= 50 ? '#3b82f6' : '#f97316' }}>{course.progress}%</div>
                                                </div>

                                                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                                                    <div style={{ width: `${course.progress}%`, height: '100%', backgroundColor: course.progress >= 80 ? '#16a34a' : course.progress >= 50 ? '#3b82f6' : '#f97316', transition: 'width 0.3s ease' }} />
                                                </div>

                                                <div style={{ fontSize: '14px', color: '#777' }}>
                                                    Tiến độ bài học: <strong style={{ color: '#333' }}>{course.completedLessons}/{course.totalLessons}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
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