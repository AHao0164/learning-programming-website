import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getLessonComments, createComment } from '../../../../services/comment.service';
import { SOCKET_URL, resolveAssetUrl } from '../../../../services/config';
import { toast } from 'sonner';

const socket = io(SOCKET_URL);

export const CommentSection = ({ lessonId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!lessonId) return;

    const fetchComments = async () => {
      try {
        const res = await getLessonComments(lessonId);
        if (res.success) setComments(res.data);
      } catch (error) {
        console.error('Lỗi tải bình luận:', error);
      }
    };

    fetchComments();
    socket.emit('join_lesson', lessonId);

    socket.on('receive_new_comment', (incomingComment) => {
      setComments((prevComments) => {
        if (incomingComment.parentCommentId) {
          return prevComments.map((c) => {
            if (c._id === incomingComment.parentCommentId) {
              return { ...c, replies: [...(c.replies || []), incomingComment] };
            }
            return c;
          });
        }

        return [incomingComment, ...prevComments];
      });
    });

    return () => {
      socket.off('receive_new_comment');
    };
  }, [lessonId]);

  const handleSubmitRootComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Vui lòng đăng nhập để bình luận!');
    if (!newComment.trim()) return;

    try {
      await createComment(lessonId, newComment);
      setNewComment('');
    } catch (error) {
      toast.error('Lỗi gửi bình luận');
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Vui lòng đăng nhập để bình luận!');
    if (!replyText.trim()) return;

    try {
      await createComment(lessonId, replyText, parentId);
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      toast.error('Lỗi gửi câu trả lời');
    }
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', marginLeft: isReply ? '40px' : '0' }}>
      <img
        src={resolveAssetUrl(comment.userId?.avatar, `https://ui-avatars.com/api/?name=${comment.userId?.name}&background=random`)}
        alt="avatar"
        style={{ width: isReply ? '30px' : '40px', height: isReply ? '30px' : '40px', borderRadius: '50%' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '12px', display: 'inline-block', minWidth: '200px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{comment.userId?.name}</div>
          <div style={{ fontSize: '14px', color: '#334155', marginTop: '4px' }}>{comment.content}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginLeft: '8px', display: 'flex', gap: '16px' }}>
          <span>{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
          {!isReply && (
            <span style={{ cursor: 'pointer', fontWeight: 'bold', color: '#3b82f6' }} onClick={() => { setReplyingTo(comment._id); setReplyText(''); }}>
              Trả lời
            </span>
          )}
        </div>

        {replyingTo === comment._id && (
          <form onSubmit={(e) => handleSubmitReply(e, comment._id)} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
            <input
              autoFocus
              type="text"
              placeholder="Viết câu trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Gửi</button>
            <button type="button" onClick={() => setReplyingTo(null)} style={{ backgroundColor: '#e2e8f0', color: '#475569', border: 'none', padding: '0 12px', borderRadius: '20px', cursor: 'pointer' }}>Hủy</button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a' }}>Hỏi đáp & Bình luận</h3>

      <form onSubmit={handleSubmitRootComment} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
        <img
          src={resolveAssetUrl(currentUser?.avatar, `https://ui-avatars.com/api/?name=${currentUser?.name || 'Guest'}&background=random`)}
          alt="my-avatar"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
        <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder={currentUser ? 'Bạn có thắc mắc gì về bài học này?' : 'Vui lòng đăng nhập để bình luận'}
            disabled={!currentUser}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: currentUser ? '#fff' : '#f1f5f9' }}
          />
          <button disabled={!currentUser} type="submit" style={{ backgroundColor: '#005baa', color: 'white', border: 'none', padding: '0 24px', borderRadius: '24px', cursor: currentUser ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
            Bình luận
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '20px' }}>Chưa có bình luận nào. Hãy là người đầu tiên đặt câu hỏi!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id}>
              <CommentItem comment={comment} />
              {comment.replies && comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
