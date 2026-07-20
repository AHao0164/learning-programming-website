import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import api from '../../../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Vui lòng nhập email!');

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      if (res.data.success) {
        setIsSent(true);
        toast.success('Đã gửi email khôi phục!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <KeyRound size={32} color="#f05123" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>Quên mật khẩu?</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0, lineHeight: '1.5' }}>
            Đừng lo lắng! Nhập email liên kết với tài khoản của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>Địa chỉ Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ví dụ: hocvien@gmail.com"
                  required
                  style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#f05123', color: 'white', fontWeight: 'bold', fontSize: '16px', border: 'none', borderRadius: '12px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ color: '#16a34a', margin: '0 0 10px 0', fontSize: '18px' }}>Kiểm tra hộp thư của bạn!</h3>
            <p style={{ color: '#15803d', fontSize: '14px', margin: 0 }}>
              Chúng tôi đã gửi một đường link khôi phục đến <strong>{email}</strong>. Vui lòng kiểm tra cả thư mục Spam nhé.
            </p>
          </div>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
            <ArrowLeft size={18} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
