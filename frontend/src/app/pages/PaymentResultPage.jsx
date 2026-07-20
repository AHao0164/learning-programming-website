import React from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

export const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isSuccess = location.pathname.includes('success');
    const courseId = searchParams.get('courseId');
    const courseSlug = searchParams.get('courseSlug');

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {isSuccess ? (
                    <>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                        <h1 style={{ color: '#16a34a', fontSize: '24px', fontWeight: 800 }}>Thanh toán thành công!</h1>
                        <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>Khóa học đã được thêm vào tài khoản của bạn.</p>
                        <button 
                            onClick={() => navigate(`/learning/${courseSlug}`)}
                            style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Vào học ngay
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
                        <h1 style={{ color: '#dc2626', fontSize: '24px', fontWeight: 800 }}>Thanh toán thất bại</h1>
                        <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>Giao dịch đã bị hủy hoặc có lỗi xảy ra.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => navigate('/')} 
                                style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Về trang chủ
                            </button>
                            {courseId && (
                                <button 
                                    onClick={() => navigate(`/courses/${courseSlug}`)}
                                    style={{ backgroundColor: '#dc2626', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Thử lại thanh toán
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};