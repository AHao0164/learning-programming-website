import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Home, Trophy, Flame, Zap, BookOpen } from 'lucide-react';
import '../../styles/f8-theme.css';
import { authService } from '../../../services/auth.service';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { SOCKET_URL, resolveAssetUrl } from '../../../services/config';

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true
});

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [currentUser, setCurrentUser] = useState(null);
  const isLogged = !!currentUser;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setCurrentUser(userObj);
      socket.connect();
      socket.emit('join_user_room', userObj.id || userObj._id);
      socket.on('new_notification', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    const handleUserUpdate = () => {
      const updatedUserStr = localStorage.getItem('user');
      if (updatedUserStr) {
        setCurrentUser(JSON.parse(updatedUserStr));
      }
    };

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
      socket.off('new_notification');
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    socket.disconnect();
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const handleToggleNotif = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      setUnreadCount(0);
    }
  };

  if (isAuthPage) return null;

  return (
    <header className="header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', zIndex: 1000, padding: '0 28px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 'bold', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>HK</div>
        </Link>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#000' }}>
          HK Learning Coding Platform
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '420px', margin: '0 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', border: '2px solid #e8e8e8', borderRadius: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 16px', height: '40px', width: '100%', transition: 'border-color 0.2s' }}>
          <Search size={16} color="#757575" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học, bài viết, video, ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchKeyword.trim()) {
                navigate(`/courses?search=${encodeURIComponent(searchKeyword.trim())}`);
              }
            }}
            style={{ border: 'none', outline: 'none', width: '100%', marginLeft: '8px', fontSize: '14px', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isLogged ? (
          <>
            <Link to="/blog" style={{ textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={18} />
              Blog
            </Link>

            <Link to="/leaderboard" style={{ textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={18} color="#eab308" />
              <span>Xếp hạng</span>
            </Link>

            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Home size={18} />
              <span>Dashboard</span>
            </Link>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#fff7ed', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ffedd5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: '#ea580c', fontSize: '14px' }} title="Chuỗi ngày học liên tiếp">
                <Flame size={18} color="#f97316" fill="#f97316" />
                <span>{currentUser.streak || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: '#ca8a04', fontSize: '14px' }} title="Điểm kinh nghiệm (XP)">
                <Zap size={18} color="#eab308" fill="#eab308" />
                <span>{currentUser.xp || 0}</span>
              </div>
            </div>

            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={handleToggleNotif} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell size={22} color="#475569" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '4px', right: '6px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', border: '2px solid white' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div style={{ position: 'absolute', top: '120%', right: '-60px', width: '320px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 1001 }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', fontSize: '15px' }}>Thông báo mới</div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Bạn không có thông báo nào.</div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: idx < unreadCount ? '#f0f9ff' : 'white' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', marginTop: '6px', flexShrink: 0, opacity: idx < unreadCount ? 1 : 0 }}></div>
                          <div>
                            <div style={{ fontSize: '14px', color: '#334155' }}>{notif.message}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Vừa xong</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={userMenuRef} style={{ position: 'relative', marginLeft: '10px', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
              <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <img
                  src={resolveAssetUrl(currentUser.avatar, `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`)}
                  alt="avatar"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {currentUser.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                  </span>
                </div>
              </div>

              {showUserMenu && (
                <div style={{ position: 'absolute', top: '120%', right: 0, width: '200px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 1005 }}>
                  {currentUser.role === 'admin' ? (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#334155', fontWeight: 500, borderBottom: '1px solid #f1f5f9', backgroundColor: '#f0fdf4' }}>
                      Bảng điều khiển
                    </Link>
                  ) : (
                    <>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#334155', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                        Trang cá nhân
                      </Link>
                      <Link to="/settings" onClick={() => setShowUserMenu(false)} style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#334155', fontWeight: 500, borderBottom: '1px solid #f1f5f9' }}>
                        Cài đặt
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '12px 16px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/blog" style={{ textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: '14px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={16} />
              Blog
            </Link>
            <Link to="/login" style={{ textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: '14px', padding: '8px 12px' }}>Đăng nhập</Link>
            <Link to="/register" className="btn btn-primary" style={{ borderRadius: '20px', padding: '8px 20px', fontSize: '14px', backgroundColor: '#f05123', color: 'white', fontWeight: 'bold' }}>Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  );
};
