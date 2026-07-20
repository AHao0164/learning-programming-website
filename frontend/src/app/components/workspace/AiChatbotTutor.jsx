import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send, Bot, User, Code2 } from 'lucide-react';
import api from '../../../../services/api';

export const AiChatbotTutor = ({ problem, currentCode, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'model', text: 'Chào em, Thầy là Bác Học HK. Em đang vướng mắc đoạn nào hay lỗi gì thì nhắn thầy nhé! Thầy sẽ kiểm tra code trên màn hình giúp em.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMsg = { id: Date.now(), sender: 'user', text: input };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        messages: updatedMessages,
        currentCode,
        language,
        problemTitle: problem?.title || 'Tự do',
      });

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'model', text: response.data.data },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'model', text: '❌ Thầy đang bận chút do mạng nghẽn, em gửi lại câu hỏi giúp Thầy nhé!' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 99999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#6f42c1', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(111,66,193,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={32} />
        </button>
      )}

      {isOpen && (
        <div style={{ width: '380px', height: '550px', backgroundColor: '#1e1e1e', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', border: '1px solid #444', overflow: 'hidden' }}>
          <div style={{ padding: '16px', backgroundColor: '#6f42c1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', borderBottom: '1px solid #5a329e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'white', color: '#6f42c1', borderRadius: '50%', padding: '6px' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Bác Học HK</h3>
                <div style={{ fontSize: '12px', color: '#e0caff', marginTop: '2px' }}>Sẵn sàng nhận diện code</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }} onMouseOver={(e) => (e.currentTarget.style.opacity = 1)} onMouseOut={(e) => (e.currentTarget.style.opacity = 0.8)}>
              <X size={24} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '20px 15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#252526' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', gap: '12px', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: msg.sender === 'user' ? '#007acc' : '#444', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div style={{ backgroundColor: msg.sender === 'user' ? '#007acc' : '#333333', color: 'white', padding: '12px 16px', borderRadius: '16px', borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.sender === 'model' ? '4px' : '16px', maxWidth: '82%', fontSize: '14.5px', lineHeight: '1.6', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  {msg.sender === 'model' ? (
                    <div className="prose prose-invert prose-sm" style={{ margin: 0, color: 'white' }}>
                      <ReactMarkdown
                        components={{
                          p: (props) => <p style={{ margin: '0 0 10px 0' }} {...props} />,
                          pre: (props) => <pre style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '6px', overflowX: 'auto', marginTop: '10px' }} {...props} />,
                          code: ({ inline, ...props }) => inline ? <code style={{ backgroundColor: '#444', padding: '2px 4px', borderRadius: '4px', color: '#ffb86c' }} {...props} /> : <code {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#444', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}><Bot size={20} /></div>
                <div style={{ backgroundColor: '#333', color: '#aaa', padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '4px', fontSize: '14px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="dot-flashing">...</span> Đang gõ
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ backgroundColor: '#1e1e1e', padding: '10px 16px', fontSize: '12px', color: '#88e08d', borderTop: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={14} /> Hệ thống tự động đính kèm Code trên màn hình
          </div>

          <div style={{ padding: '14px', backgroundColor: '#1e1e1e', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập lỗi bạn đang gặp phải..."
              rows={1}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', backgroundColor: '#2d2d2d', border: '1px solid #555', color: 'white', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px', lineHeight: '20px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: isLoading || !input.trim() ? '#444' : '#6f42c1', border: 'none', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}
            >
              <Send size={20} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
