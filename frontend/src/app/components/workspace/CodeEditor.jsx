import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { AiChatbotTutor } from './AiChatbotTutor';
import ConfirmDialog from '../ui/ConfirmDialog';

export const CodeEditor = ({ lessonSlug, problem, onSuccess }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  
  const [output, setOutput] = useState('');
  const [judgeResults, setJudgeResults] = useState(null); 
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);

  const [activeTab, setActiveTab] = useState('terminal');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [showSolutionDialog, setShowSolutionDialog] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: 'Xác nhận', message: '', onConfirm: () => {} });

  useEffect(() => {
      const handleBeforeUnload = (e) => {
          if (code && problem && code !== problem.starterCode) {
              e.preventDefault();
              e.returnValue = '';
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, problem]);

  const fetchSubmissions = async () => {
      if (!problem) return;
      setIsLoadingHistory(true);
      try {
          const user = JSON.parse(localStorage.getItem('user'));
          const res = await api.get(`/judge/submissions/${problem._id}?userId=${user?.id}`);
          setSubmissions(res.data.data || []);
      } catch (error) {
          console.error("Lỗi lấy lịch sử:", error);
      } finally {
          setIsLoadingHistory(false);
      }
  };

  useEffect(() => {
      if (activeTab === 'history') {
          fetchSubmissions();
      }
  }, [activeTab, problem]);

  const handleRestoreOldCode = (oldCode) => {
      setConfirmConfig({
          isOpen: true,
          message: "Bạn có chắc chắn muốn ghi đè code hiện tại bằng phiên bản này không?",
          onConfirm: () => {
              setCode(oldCode);
              localStorage.setItem(`draft_code_${problem._id}`, oldCode); 
              setActiveTab('terminal');
              setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const formatDateTime = (dateString) => {
      const d = new Date(dateString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    if (problem) {
      const savedDraft = localStorage.getItem(`draft_code_${problem._id}`);
      
      if (savedDraft) {
          setCode(savedDraft); 
      } else {
          setCode(problem.starterCode || '');
      }

      setLanguage(problem.language || 'javascript');
      setOutput('');
      setJudgeResults(null);
      setIsError(false);
      setAiResponse(null);
      setActiveTab('terminal');
    }
  }, [problem]);

  const handleResetCode = () => {
      setConfirmConfig({
          isOpen: true,
          message: "Bạn có chắc chắn muốn xóa hết code hiện tại và quay về code mẫu ban đầu?",
          onConfirm: () => {
              setCode(problem.starterCode || '');
              localStorage.removeItem(`draft_code_${problem._id}`);
              setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleShowSolution = () => {
      setShowSolutionDialog(true);
  };

  const confirmShowSolution = () => {
      setCode(problem.solutionCode || '// Chưa có lời giải cho bài này');
      localStorage.setItem(`draft_code_${problem._id}`, problem.solutionCode || '');
      setShowSolutionDialog(false);
  };

  const handleEditorChange = (value) => {
      setCode(value);
      
      if (problem && problem._id) {
          localStorage.setItem(`draft_code_${problem._id}`, value);
      }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('⏳ Code đang được đẩy vào hàng đợi (Message Queue)...');
    setJudgeResults(null);
    setIsError(false);
    setActiveTab('terminal');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      const response = await api.post('/judge/run', { 
        language: problem.language,
        code,
        problemId: problem._id,
        userId: user?.id
      });
      
      const jobId = response.data.data.jobId;
      if (!jobId) throw new Error("Không nhận được Job ID từ hàng đợi");

      let jobStatus = 'queued';
      let result = null;

      while (jobStatus === 'queued' || jobStatus === 'waiting' || jobStatus === 'active') {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const pollRes = await api.get(`/judge/job/${jobId}`);
          jobStatus = pollRes.data.state;

          if (jobStatus === 'waiting' || jobStatus === 'active') {
              setOutput(`Hệ thống đang chấm...`);
          }

          if (jobStatus === 'completed') {
              result = pollRes.data.data;
          } else if (jobStatus === 'failed') {
              setIsError(true);
              setOutput(`Lỗi Worker khi chạy Code: ${pollRes.data.error}`);
              setIsRunning(false);
              return;
          }
      }

      if (result) {
          if (result.isJudge) {
            setJudgeResults(result.judgeResults);
            setOutput(result.output);
            
            if (result.status === 'failed') {
                setIsError(true);
            } else if (result.status === 'success') {
                if (onSuccess) {
                    onSuccess(); 
                }
            }
          } 
          else {
            if (result.status === 'success') {
              setOutput(result.output || 'Code chạy xong không có log xuất ra màn hình.');
            } else {
              setIsError(true);
              setOutput(result.output || 'Có lỗi khi chạy code chay.');
            }
          }
          
          fetchSubmissions();
      }

    } catch (error) {
      console.error(error);
      setIsError(true);
      setOutput('Không thể kết nối vào Queue chấm code. Web Server sập mạng!');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    setActiveTab('ai');
    setAiResponse({ analysis: 'AI Mentor đang đọc code và suy nghĩ... ', suggestedCode: null });
    try {
      const response = await api.post('/ai/analyze', {
        code, language, errorMessage: isError ? output : null 
      });
      
      let aiText = response.data.data;
      if (typeof aiText === 'string') {
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(aiText);
          setAiResponse(parsed);
        } catch (e) {
          setAiResponse({ analysis: aiText, suggestedCode: null });
        }
      } else {
        setAiResponse(aiText);
      }
    } catch (error) {
      setAiResponse({ analysis: 'Lỗi kết nối với AI Mentor. Vui lòng thử lại sau.', suggestedCode: null });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!problem) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#1e1e1e', color: '#abb2bf', borderRadius: '8px' }}>
            <Loader2 className="animate-spin" size={32} />
            <span style={{ marginLeft: '10px' }}>Đang nạp môi trường code...</span>
        </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      
      <div style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <select disabled value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', backgroundColor: '#e9ecef', cursor: 'not-allowed' }}>
            <option value={language}>{language.toUpperCase()}</option>
          </select>
          <button 
              onClick={handleResetCode} 
              style={{ background: 'transparent', border: 'none', color: '#6c757d', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Khôi phục code ban đầu"
          >
              Làm lại từ đầu
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleShowSolution} style={{ backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(255, 193, 7, 0.3)' }}>
            💡 Xem lời giải
          </button>
          <button onClick={handleAskAI} disabled={isAiLoading || isRunning} style={{ backgroundColor: '#6f42c1', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: (isAiLoading || isRunning) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(111, 66, 193, 0.3)' }}>
            {isAiLoading ? 'Đang phân tích...' : 'Hỏi AI Mentor'}
          </button>
          <button onClick={handleRunCode} disabled={isRunning || isAiLoading} style={{ backgroundColor: isRunning ? '#6c757d' : '#28a745', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: (isRunning || isAiLoading) ? 'not-allowed' : 'pointer' }}>
            {isRunning ? 'Đang xử lý...' : '▶ Chạy Code'}
          </button>
        </div>
      </div>

      <div style={{ flex: 6 }}>
        <Editor 
          height="100%" 
          language={language === 'nodejs' ? 'javascript' : language} 
          theme="vs-dark" 
          value={code} 
          onChange={handleEditorChange} 
          options={{ minimap: { enabled: false }, fontSize: 14 }} 
        />
      </div>

      <div style={{ flex: 4, backgroundColor: '#1e1e1e', borderTop: '2px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', backgroundColor: '#2d2d2d', borderBottom: '1px solid #444' }}>
          <button onClick={() => setActiveTab('terminal')} style={{ flex: 1, padding: '10px 15px', backgroundColor: activeTab === 'terminal' ? '#1e1e1e' : 'transparent', color: activeTab === 'terminal' ? '#fff' : '#888', border: 'none', borderTop: activeTab === 'terminal' ? '2px solid #28a745' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
            TERMINAL OUTPUT
          </button>
          <button onClick={() => setActiveTab('ai')} style={{ flex: 1, padding: '10px 15px', backgroundColor: activeTab === 'ai' ? '#1e1e1e' : 'transparent', color: activeTab === 'ai' ? '#fff' : '#888', border: 'none', borderTop: activeTab === 'ai' ? '2px solid #6f42c1' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
            AI MENTOR {isAiLoading && '...'}
          </button>
          <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: '10px 15px', backgroundColor: activeTab === 'history' ? '#1e1e1e' : 'transparent', color: activeTab === 'history' ? '#fff' : '#888', border: 'none', borderTop: activeTab === 'history' ? '2px solid #f05123' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
            LỊCH SỬ NỘP BÀI
          </button>
        </div>

        <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
          
          {activeTab === 'terminal' && (
            <div>
              {judgeResults && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '15px' }}>Kết quả chấm điểm:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {judgeResults.map((res) => (
                      <div key={res.testCase} style={{ 
                        padding: '10px', borderRadius: '6px', 
                        backgroundColor: res.passed ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                        border: res.passed ? '1px solid #28a745' : '1px solid #dc3545'
                      }}>
                        <div style={{ color: res.passed ? '#28a745' : '#ff6b6b', fontWeight: 'bold', marginBottom: '4px' }}>
                          {res.passed ? '✅ Test Case' : '❌ Test Case'} {res.testCase}
                        </div>
                        {!res.passed && (
                          <div style={{ fontSize: '13px', color: '#ccc', marginLeft: '20px' }}>
                            <div><b>Input:</b> <code>{res.input}</code></div>
                            <div><b>Expected:</b> <code>{res.expected}</code></div>
                            <div><b>Your Output:</b> <code style={{ color: '#ff6b6b' }}>{res.actual || res.error}</code></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(output || (!judgeResults && !output)) && (
                <div style={{ color: isError && !judgeResults ? '#ff6b6b' : '#4af626', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', borderTop: judgeResults ? '1px dashed #444' : 'none', paddingTop: judgeResults ? '10px' : '0' }}>
                  {output || (judgeResults ? '' : 'Nhấn "Chạy Code" để xem kết quả...')}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ color: '#e0e0e0', fontSize: '15px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
              {aiResponse ? (
                  <>
                      <ReactMarkdown>{aiResponse.analysis}</ReactMarkdown>
                      {aiResponse.suggestedCode && aiResponse.suggestedCode.trim() !== code.trim() && (
                          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px', borderLeft: '4px solid #f05123' }}>
                              <h4 style={{ margin: '0 0 10px 0', color: '#f05123' }}>Code Gợi ý</h4>
                              <pre style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '6px', overflowX: 'auto', fontSize: '13px', color: '#abb2bf', border: '1px solid #444', marginBottom: '15px' }}>
                                  <code>{aiResponse.suggestedCode}</code>
                              </pre>
                              <button
                                  onClick={() => {
                                      setConfirmConfig({
                                          isOpen: true,
                                          message: "Bạn có chắc chắn muốn ghi đè đoạn code hiện tại bằng phiên bản gợi ý này không?",
                                          onConfirm: () => {
                                              setCode(aiResponse.suggestedCode);
                                              setActiveTab('terminal');
                                              setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                          }
                                      });
                                  }}
                                  style={{
                                      padding: '8px 16px', backgroundColor: '#f05123', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                  }}
                              >
                                  ✨ Áp dụng Code này
                              </button>
                          </div>
                      )}
                  </>
              ) : <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Bạn đang gặp lỗi khó hiểu, hoặc muốn tối ưu code cho xịn hơn? <br/>Hãy nhấn nút <b>"✨ Hỏi AI Mentor"</b> ở phía trên nhé!</div>}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ color: '#e0e0e0', fontSize: '14px', fontFamily: 'sans-serif' }}>
              {isLoadingHistory ? (
                  <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>⏳ Đang tải lịch sử...</div>
              ) : submissions.length === 0 ? (
                  <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                      Bạn chưa nộp bài lần nào. Hãy chạy code thử nhé!
                  </div>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {submissions.map((sub) => (
                          <div key={sub._id} style={{ 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '12px 15px', borderRadius: '6px', 
                              backgroundColor: '#2d2d2d', borderLeft: sub.status === 'success' ? '4px solid #28a745' : '4px solid #dc3545'
                          }}>
                              <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: sub.status === 'success' ? '#28a745' : '#ff6b6b', marginBottom: '4px' }}>
                                      {sub.status === 'success' ? 'Thành công (Accepted)' : 'Thất bại (Failed/Error)'}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', gap: '15px' }}>
                                      <span>⏰ {formatDateTime(sub.createdAt)}</span>
                                      {sub.totalTestCases > 0 && (
                                          <span>🎯 Test Case: {sub.testCasesPassed}/{sub.totalTestCases}</span>
                                      )}
                                  </div>
                              </div>
                              <button 
                                  onClick={() => handleRestoreOldCode(sub.code)}
                                  style={{ 
                                      backgroundColor: '#444', color: '#fff', border: 'none', 
                                      padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', 
                                      fontSize: '12px', transition: '0.2s'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#444'}
                              >
                                  👁️ Xem / Phục hồi
                              </button>
                          </div>
                      ))}
                  </div>
              )}
            </div>
          )}

        </div>
      </div>
      <AiChatbotTutor problem={problem} currentCode={code} language={language} />

      {showSolutionDialog && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999,
              display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
              <div style={{
                  backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                  width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  textAlign: 'center'
              }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤔</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', margin: 0 }}>Bạn đã chắc chắn chưa?</h3>
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                      Xem lời giải quá sớm có thể làm giảm đi tư duy logic và khả năng tự giải quyết vấn đề của bạn. Hãy cố gắng suy nghĩ thêm một chút nữa nhé!
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button 
                          onClick={() => setShowSolutionDialog(false)}
                          style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                          Tiếp tục suy nghĩ
                      </button>
                      <button 
                          onClick={confirmShowSolution}
                          style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                          Vẫn xem lời giải
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      <ConfirmDialog 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};