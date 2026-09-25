import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../../services/chatbotService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatbotService.getHistory();
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendMessage = async (customText = null) => {
    const text = (customText !== null ? customText : inputMessage).trim();
    if (!text || sending) return;

    setInputMessage('');
    setError('');
    setSending(true);

    // Optimistically append user's message
    const tempUserMsg = {
      id: Date.now(),
      message: text,
      response: null,
      created_at: 'Just now',
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatbotService.sendMessage(text);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempUserMsg.id ? { ...msg, response: res.data.response } : msg
          )
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to send message to AI tutor');
      // Set error message in bubble
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempUserMsg.id
            ? { ...msg, response: '⚠️ An error occurred while retrieving the answer. Please try again.' }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatbotService.clearHistory();
      setMessages([]);
    } catch (err) {
      setError(err.message || 'Failed to clear conversation history');
    }
  };

  const promptChips = [
    'What are the ACID properties in DBMS?',
    'Explain the difference between List and Tuple in Python',
    'What is the difference between 2NF and 3NF?',
    'Explain CSS Flexbox vs CSS Grid simply',
    'What is a Primary Key vs Foreign Key?',
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <div className="d-flex align-items-center">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 me-2 fw-semibold">
                <i className="bi bi-robot me-1"></i> AI Study Assistant
              </span>
            </div>
            <h2 className="fw-bold text-dark mb-1">Interactive Academic Tutor</h2>
            <p className="text-muted small mb-0">Ask questions about Python, DBMS, Web Development, or quiz concepts</p>
          </div>
          {messages.length > 0 && (
            <button
              className="btn btn-outline-secondary rounded-pill px-3 mt-3 mt-md-0 btn-sm"
              onClick={handleClearHistory}
            >
              <i className="bi bi-trash3 me-1"></i> Clear History
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden max-w-1000">
          {/* Chat Window */}
          <div className="chat-window d-flex flex-column gap-3 p-4">
            {/* Welcome message bubble */}
            <div className="d-flex align-items-start gap-2">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-robot fs-5"></i>
              </div>
              <div className="chat-bubble-ai">
                <div className="fw-bold text-primary small mb-1">QuizMaster AI Tutor</div>
                <div>
                  Hello! I'm your academic study assistant. I can help explain programming topics, database normalization, SQL queries, HTML/CSS rules, and quiz questions. What would you like to review today?
                </div>
              </div>
            </div>

            {loadingHistory ? (
              <Loading message="Restoring your conversation history..." />
            ) : (
              messages.map((m, idx) => (
                <React.Fragment key={m.id || idx}>
                  {/* User Bubble */}
                  <div className="d-flex justify-content-end align-items-start gap-2">
                    <div className="chat-bubble-user">
                      <div>{m.message}</div>
                      <div className="text-white-50 text-end" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                        {m.created_at}
                      </div>
                    </div>
                  </div>

                  {/* AI Bubble */}
                  {m.response && (
                    <div className="d-flex align-items-start gap-2">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '36px', height: '36px' }}
                      >
                        <i className="bi bi-robot fs-5"></i>
                      </div>
                      <div className="chat-bubble-ai">
                        <div className="fw-bold text-primary small mb-1">QuizMaster AI Tutor</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.response}</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                          {m.created_at}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}

            {/* Thinking / Typing indicator */}
            {sending && (
              <div className="d-flex align-items-start gap-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '36px', height: '36px' }}
                >
                  <i className="bi bi-robot fs-5"></i>
                </div>
                <div className="chat-bubble-ai d-flex align-items-center gap-2 py-3">
                  <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                  <span className="text-muted small">AI Tutor is formulating your answer...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="p-3 bg-light border-top">
            <div className="text-muted small fw-semibold mb-2">Suggested Questions:</div>
            <div className="d-flex flex-wrap gap-2">
              {promptChips.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 small text-secondary hover-bg-light"
                  onClick={() => handleSendMessage(chip)}
                  disabled={sending}
                >
                  <i className="bi bi-chat-left-text me-1 text-primary"></i> {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-top">
            <div className="input-group">
              <input
                type="text"
                className="form-control border-secondary-subtle py-2.5 ps-3"
                placeholder="Ask any educational question (e.g. 'What is ACID in DBMS?')..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold d-flex align-items-center"
                onClick={() => handleSendMessage()}
                disabled={sending || !inputMessage.trim()}
              >
                <span>Send</span>
                <i className="bi bi-send-fill ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
