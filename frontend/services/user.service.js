import api from './api';

export const getLeaderboardData = async () => {
  const response = await api.get('/users/leaderboard');
  return response.data;
};
