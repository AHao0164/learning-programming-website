import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Code2, TrendingUp, Activity, Cpu, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
    PieChart, Pie, Cell, Tooltip as PieTooltip, Legend, 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer 
} from 'recharts';

import { getAdminDashboardStats } from '../../../../services/admin.service';

export const DashboardPage = () => {
    const [stats, setStats] = useState({
        overview: { totalUsers: 0, totalCourses: 0, totalProblems: 0, totalEnrollments: 0, totalSubmissions: 0 },
        charts: { difficulty: [], submissions: [] },
        topCourses: []
    });
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await getAdminDashboardStats(startDate, endDate);
            if (res.data) setStats(res.data);
        } catch (error) {
            toast.error("Không thể tải dữ liệu thống kê từ Server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '24px', fontWeight: 500, color: '#64748b' }}>Đang tổng hợp số liệu thống kê...</div>;

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Tổng quan hệ thống</h1>
                {/* THANH CÔNG CỤ LỌC NGÀY THÁNG */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '24px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Từ ngày</label>
                        <input 
                            type="date" 
                            className="form-input" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: '8px 12px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Đến ngày</label>
                        <input 
                            type="date" 
                            className="form-input" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '8px 12px' }}
                        />
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={fetchStats}
                        style={{ padding: '8px 20px', height: '40px' }}
                    >
                        Lọc dữ liệu
                    </button>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setTimeout(() => getAdminDashboardStats('', '').then(res => setStats(res.data)), 0);
                        }}
                        style={{ padding: '8px 20px', height: '40px' }}
                    >
                        Xóa lọc
                    </button>
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Dữ liệu được cập nhật theo thời gian thực từ Database</p>
            </div>

            {/* 1. THẺ SỐ LIỆU TỔNG QUAN (CARDS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {/* Tổng Học Viên */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                        <Users size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Tổng Học Viên</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.overview.totalUsers}</div>
                    </div>
                </div>

                {/* Tổng Khóa Học */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                        <BookOpen size={24} color="#ef4444" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Khóa Học Đã Tạo</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.overview.totalCourses}</div>
                    </div>
                </div>

                {/* Tổng Bài Tập Code */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                        <Code2 size={24} color="#22c55e" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Bài Tập Code (Problems)</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.overview.totalProblems}</div>
                    </div>
                </div>

                {/* Tổng Lượt Đăng Ký */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                        <TrendingUp size={24} color="#f97316" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Lượt Đăng Ký (Enrollments)</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.overview.totalEnrollments}</div>
                    </div>
                </div>

                {/* Tổng Lượt Chấm Code */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                        <Cpu size={24} color="#a855f7" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>Tổng lượt chấm Code</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.overview.totalSubmissions}</div>
                    </div>
                </div>
            </div>

            {/* 2. KHU VỰC BIỂU ĐỒ (CHARTS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                
                {/* Biểu đồ Pie Chart: Tỉ lệ nộp bài */}
                <div className="card" style={{ padding: '24px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} color="#3b82f6" /> Tỉ lệ chấm Code
                    </h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
                        {(!stats.charts.submissions || stats.overview.totalSubmissions === 0) ? (
                            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Chưa có lượt chấm code nào</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.charts.submissions}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.charts.submissions.map((entry, index) => (
                                            <Cell key={`cell-sub-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Biểu đồ Pie Chart: Độ khó bài tập */}
                <div className="card" style={{ padding: '24px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>Phân bổ độ khó bài tập</h3>
                    
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
                        {stats.charts.difficulty.length === 0 || stats.overview.totalProblems === 0 ? (
                            <div style={{ color: '#94a3b8', fontSize: '14px' }}>Chưa có dữ liệu bài tập</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.charts.difficulty}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.charts.difficulty.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <PieTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
                
                {/* Bảng Top Khóa Học (Cột bên phải) */}
                <div className="card" style={{ padding: '24px', borderRadius: '12px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={20} color="#f59e0b" /> Top Khóa học phổ biến
                    </h3>
                    {stats.topCourses && stats.topCourses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {stats.topCourses.map((course, index) => (
                                <div key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: index < stats.topCourses.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: index === 0 ? '#fef3c7' : '#f1f5f9', color: index === 0 ? '#d97706' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                        #{index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</div>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '20px' }}>
                                        {course.studentsCount} học viên
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>Chưa có lượt đăng ký nào</div>
                    )}
                </div>

            </div>
        </div>
    );
};