const { Worker } = require('bullmq');
const axios = require('axios');
const mongoose = require('mongoose');
const Submission = require('../models/submission.model');

const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null
};

const LOCAL_PISTON_API = process.env.PISTON_API_URL || 'http://127.0.0.1:2000/api/v2/execute';

const codeJudgeWorker = new Worker('code-judging', async job => {
    // console.log(`🔨 [Worker] Đang xử lý Job ID: ${job.id}`);
    const { language, code, problemId, userId, testCases, pistonLang } = job.data;
    
    const judgeResults = [];
    let isAllPassed = true;
    let finalOutputLog = "";

    await job.updateProgress({ status: 'running' });

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let finalCodeToRun = code;
        
        if (pistonLang === 'javascript') {
            let functionName = null;
            let callPrefix = '';
            
            const funcMatch = code.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/);
            const arrowMatch = code.match(/(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/);
            const exportMatch = code.match(/module\.exports\.([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*/);

            if (funcMatch) {
                functionName = funcMatch[1];
            } else if (arrowMatch) {
                functionName = arrowMatch[1];
            } else if (exportMatch) {
                functionName = exportMatch[1];
                callPrefix = 'module.exports.';
            }

            if (functionName) {
                finalCodeToRun += `
                    \n// --- WRAPPER TỰ ĐỘNG ---
                    const fs = require('fs');
                    try {
                        const rawInput = fs.readFileSync(0, 'utf-8').trim();
                        if (rawInput) {
                            const parsed = JSON.parse(rawInput);
                            const funcParamsLength = ${callPrefix}${functionName}.length;
                            let finalArgs = [];
                            if (Array.isArray(parsed)) {
                                if (funcParamsLength === 1 && parsed.length > 1 && !Array.isArray(parsed[0])) {
                                    finalArgs = [parsed];
                                } else if (funcParamsLength === 1 && parsed.length === 1 && !Array.isArray(parsed[0])) {
                                    finalArgs = parsed;
                                } else {
                                    finalArgs = parsed;
                                }
                            } else {
                                finalArgs = [parsed];
                            }
                            const result = ${callPrefix}${functionName}(...finalArgs);
                            console.log(typeof result === 'object' ? JSON.stringify(result) : result);
                        }
                    } catch(e) {
                        console.error(e);
                    }
                `;
            }
        }

        const payload = {
            language: pistonLang,
            version: "*",
            files: [{ content: finalCodeToRun }],
            stdin: tc.input
        };

        let response;
        try {
            response = await axios.post(LOCAL_PISTON_API, payload);
        } catch (err) {
            throw new Error('Không thể kết nối Piston Server: ' + err.message);
        }
        
        const runResult = response.data.run;
        const actualOutput = runResult.stdout || "";
        const errorOutput = runResult.stderr || "";

        const cleanActual = actualOutput.replace(/\s+/g, '');
        const cleanExpected = tc.expected.replace(/\s+/g, '');

        const isPassed = errorOutput === "" && cleanActual === cleanExpected;
        if (!isPassed) isAllPassed = false;

        if (i === 0) finalOutputLog = errorOutput || actualOutput;

        judgeResults.push({
            testCase: i + 1,
            passed: isPassed,
            input: tc.input,
            expected: tc.expected,
            actual: actualOutput.trim(),
            error: errorOutput
        });

        await job.updateProgress({ 
            status: 'running', 
            testCaseDone: i + 1, 
            totalTestCases: testCases.length 
        });
    }

    const hasTestCases = testCases && testCases.length > 0;
    const finalStatus = hasTestCases ? (isAllPassed ? 'success' : 'failed') : (finalOutputLog ? 'error' : 'success');
    const passedCount = judgeResults.filter(r => r.passed).length;

    if (userId && problemId) {
        try {
            await Submission.create({
                userId,
                problemId,
                code,
                language,
                status: finalStatus,
                testCasesPassed: passedCount,
                totalTestCases: testCases.length
            });
            // console.log(`✅ [Worker] Đã lưu lịch sử chấm bài: ${finalStatus}`);
        } catch (subErr) {
            // console.error("❌ [Worker] Lỗi lưu DB Submission:", subErr);
        }
    }

    return {
        isJudge: hasTestCases,
        status: finalStatus,
        output: finalOutputLog,
        judgeResults
    };

}, { connection: redisOptions });

codeJudgeWorker.on('completed', job => {
    // console.log(`✅ [Worker] Hoàn thành Job: ${job.id}`);
});
codeJudgeWorker.on('failed', (job, err) => {
    // console.log(`❌ [Worker] Thất bại Job ${job.id}: ${err.message}`);
});

module.exports = codeJudgeWorker;
