import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, BookOpen, Settings, BarChart2, Menu } from 'lucide-react';
import '../styles/f8-theme.css';
import { AdminHeader } from './AdminHeader';

const SidebarItem = ({ icon: Icon, label, path, collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

    return (
        <button
            type="button"
            onClick={() => navigate(path)}
            title={label}
            style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: '8px', marginBottom: '8px', cursor: 'pointer',
                backgroundColor: isActive ? '#e8ebed' : 'transparent',
                color: isActive ? '#1a1a1a' : '#404040',
                fontWeight: isActive ? 600 : 500, fontSize: '14px', border: 'none', textAlign: 'left'
            }}>
            <Icon size={20} style={{ marginRight: collapsed ? 0 : '12px' }} />
            {!collapsed && label}
        </button>
    );
};

export const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
            
            {/* ADMIN HEADER */}
            <AdminHeader />

            {/* CONTENT AREA: Sidebar + Main */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            {/* SIDEBAR */}
            <aside style={{ 
                width: sidebarCollapsed ? '76px' : '240px',
                flexShrink: 0, padding: '20px 8px 20px 16px', 
                backgroundColor: '#fff', borderRight: '1px solid #e5e7eb',
                transition: 'width 0.2s ease', display: 'flex', flexDirection: 'column',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', marginBottom: '24px' }}>
                    {!sidebarCollapsed && <span style={{ fontSize: '12px', color: '#888', fontWeight: 700, textTransform: 'uppercase' }}>Quản trị viên</span>}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d0d0d0', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Menu size={16} color="#666"/>
                    </button>
                </div>
                
                <nav style={{ flex: 1 }}>
                    <SidebarItem icon={BarChart2} label="Thống kê" path="/admin" collapsed={sidebarCollapsed} />
                    <SidebarItem icon={Users} label="Người dùng" path="/admin/users" collapsed={sidebarCollapsed} />
                    <SidebarItem icon={BookOpen} label="Khóa học" path="/admin/courses" collapsed={sidebarCollapsed} />
                </nav>
            </aside>

            {/* MAIN CONTENT (Khu vực thay đổi theo từng trang) */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                <Outlet />
            </main>

            </div>
        </div>
    );
};