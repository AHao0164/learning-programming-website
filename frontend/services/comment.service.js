import api from './api';

export const getLessonComments = async (lessonId) => {
  const res = await api.get(`/comments/${lessonId}`);
  return res.data;
};

export const createComment = async (lessonId, content, parentCommentId = null) => {
  const res = await api.post('/comments', {
    lessonId,
    content,
    parentCommentId,
  });

  return res.data;
};
