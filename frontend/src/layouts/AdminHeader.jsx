import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { resolveAssetUrl } from '../../services/config';
import { toast } from 'sonner';

export const AdminHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <header style={{ height: '64px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{ backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 'bold', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
          title="Về trang chủ"
        >
          HK
        </div>
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#333' }}>
          Admin Panel
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={resolveAssetUrl(user.avatar, `https://ui-avatars.com/api/?name=${user.name}&background=random`)}
              alt="avatar"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
              </span>
            </div>
          </div>
        )}

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#475569' }}
          title="Về trang chủ"
        >
          <Home size={16} />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: 'none', borderRadius: '8px', backgroundColor: '#fef2f2', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#ef4444' }}
          title="Đăng xuất"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};
