import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Lock, Save, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import { resolveAssetUrl } from '../../../services/config';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user);
    setName(user.name || '');
    setAvatar(user.avatar || '');
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else {
        formData.append('avatar', avatar);
      }

      const res = await api.put('/auth/updatedetails', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        const updatedUser = { ...currentUser, name: res.data.data.name, avatar: res.data.data.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated'));
        toast.success('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật!');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp!');
    }
    if (newPassword.length < 6) {
      return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
    }

    try {
      const res = await api.put('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { duration: 3000 });
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!');
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex' }}>
          <ArrowLeft size={20} color="#334155" />
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Cài đặt tài khoản</h1>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ width: '240px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <button onClick={() => setActiveTab('profile')} style={{ width: '100%', textAlign: 'left', padding: '16px 20px', border: 'none', background: activeTab === 'profile' ? '#f0fdf4' : 'white', color: activeTab === 'profile' ? '#16a34a' : '#475569', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: activeTab === 'profile' ? '4px solid #16a34a' : '4px solid transparent', transition: 'all 0.2s' }}>
            <User size={18} /> Thông tin cá nhân
          </button>
          <button onClick={() => setActiveTab('password')} style={{ width: '100%', textAlign: 'left', padding: '16px 20px', border: 'none', background: activeTab === 'password' ? '#f0fdf4' : 'white', color: activeTab === 'password' ? '#16a34a' : '#475569', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: activeTab === 'password' ? '4px solid #16a34a' : '4px solid transparent', transition: 'all 0.2s' }}>
            <Lock size={18} /> Đổi mật khẩu
          </button>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#0f172a' }}>Hồ sơ công khai</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : resolveAssetUrl(avatar, `https://ui-avatars.com/api/?name=${name}&background=random`)}
                  alt="preview"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                />
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Ảnh đại diện</label>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} style={{ marginBottom: '8px', display: 'block', width: '350px', fontSize: '14px' }} />
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Hoặc dùng link ảnh có sẵn (URL):</div>
                  <input
                    type="text"
                    value={avatarFile ? '' : avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Nhập link ảnh..."
                    disabled={!!avatarFile}
                    style={{ width: '350px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: avatarFile ? '#f1f5f9' : 'white' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Họ và tên</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Email (Không thể thay đổi)</label>
                <input type="email" value={currentUser.email} disabled style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
              </div>

              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f05123', color: 'white', fontWeight: 'bold', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
                <Save size={18} /> Lưu thay đổi
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#0f172a' }}>Thay đổi mật khẩu</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Mật khẩu hiện tại</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Mật khẩu mới</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Xác nhận mật khẩu mới</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f05123', color: 'white', fontWeight: 'bold', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
                <Lock size={18} /> Cập nhật mật khẩu
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
