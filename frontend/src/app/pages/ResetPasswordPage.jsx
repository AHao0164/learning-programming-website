import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
    if (password !== confirmPassword) return toast.error('Mật khẩu xác nhận không khớp!');

    setIsLoading(true);
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, { password });

      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công! Chào mừng bạn quay lại.', { duration: 3000 });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShieldCheck size={32} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>Tạo mật khẩu mới</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
            Vui lòng nhập mật khẩu mới bảo mật cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Mật khẩu mới</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Xác nhận mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '16px', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
            <ArrowLeft size={18} /> Hủy và quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};
