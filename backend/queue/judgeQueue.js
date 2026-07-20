const { Queue } = require('bullmq');

const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null
};

const judgeQueue = new Queue('code-judging', {
    connection: redisOptions
});

// console.log('Đã khởi tạo Message Queue chấm bài tập: code-judging');

module.exports = judgeQueue;
