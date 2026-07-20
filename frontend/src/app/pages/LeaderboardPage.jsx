import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Flame } from 'lucide-react';
import { getLeaderboardData } from '../../../services/user.service';
import { resolveAssetUrl } from '../../../services/config';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboardData();

        if (res && res.success) {
          setLeaderboard(res.data || []);
        } else {
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Lỗi lấy bảng xếp hạng:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const renderRankIcon = (index) => {
    if (index === 0) return <Trophy size={28} color="#fbbf24" fill="#fef3c7" />;
    if (index === 1) return <Medal size={28} color="#94a3b8" fill="#f1f5f9" />;
    if (index === 2) return <Medal size={28} color="#b45309" fill="#fef3c7" />;
    return <span style={{ fontSize: '18px', fontWeight: 700, color: '#64748b', width: '28px', textAlign: 'center' }}>#{index + 1}</span>;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải bảng vàng...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbeb', padding: '12px 24px', borderRadius: '50px', marginBottom: '16px' }}>
          <Flame size={24} color="#f59e0b" fill="#f59e0b" style={{ marginRight: '8px' }} />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#b45309' }}>BẢNG VÀNG THÀNH TÍCH</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0' }}>Bảng Xếp Hạng Học Tập</h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>Đua top nhận XP - Chinh phục đỉnh cao tri thức lập trình</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          <div style={{ width: '80px', textAlign: 'center' }}>Hạng</div>
          <div style={{ flex: 1 }}>Học viên</div>
          <div style={{ width: '120px', textAlign: 'right' }}>Điểm XP</div>
        </div>

        {!leaderboard || leaderboard.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu xếp hạng.</div>
        ) : (
          leaderboard.map((user, index) => (
            <div key={user._id} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: index === leaderboard.length - 1 ? 'none' : '1px solid #f1f5f9', backgroundColor: index === 0 ? '#fffbeb' : index === 1 ? '#f8fafc' : index === 2 ? '#fef2f2' : '#fff' }}>
              <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                {renderRankIcon(index)}
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={resolveAssetUrl(user.avatar, `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`)}
                  alt={user.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: index < 3 ? `2px solid ${index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'}` : 'none' }}
                />
                <div style={{ fontSize: '16px', fontWeight: index < 3 ? 800 : 600, color: '#0f172a' }}>
                  {user.name}
                </div>
              </div>

              <div style={{ width: '120px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: index === 0 ? '#d97706' : '#334155' }}>
                  {user.xp?.toLocaleString() || 0}
                </span>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
