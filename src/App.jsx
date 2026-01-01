import { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/ai/chat?message=${encodeURIComponent(input)}`);
      const data = await res.text();
      setMessages(prev => [...prev, { role: 'ai', text: data }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Is Spring running?" }]);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <button className="new-chat-btn">+ New Chat</button>
        <div style={{marginTop: '20px', color: '#8b949e', fontSize: '0.8rem'}}>HISTORY</div>
        {/* Placeholder for history items */}
      </div>

      <div className="chat-window">
        <div className="messages-container">
          <div className="messages-inner">
            {messages.length === 0 && (
              <div style={{textAlign: 'center', marginTop: '100px'}}>
                <h1 style={{color: 'var(--accent-orange)'}}>M4 AI Agent</h1>
                <p style={{opacity: 0.6}}>How can I power your workflow today?</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}>
                <div className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="message-row ai-row"><div className="message-bubble ai-message">Thinking...</div></div>}
          </div>
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Message Llama 3.2..." 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;