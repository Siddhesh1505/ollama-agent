import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2'); // Default
  const scrollEndRef = useRef(null);

  // Fetch models from your Backend on load
  useEffect(() => {
    fetch('http://localhost:8080/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.models) {
          setModels(data.models);
          setSelectedModel(data.models[0].name);
        }
      })
      .catch(err => console.error("Could not fetch models from backend", err));
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Passes the selectedModel to your Spring Boot Controller
      const response = await fetch(
        `http://localhost:8080/api/chat?prompt=${encodeURIComponent(userMessage)}&model=${selectedModel}`
      );
      const botResponse = await response.text();
      setMessages(prev => [...prev, { role: 'ai', text: botResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Ensure backend is up." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="chat-window">
        {/* Header with Reactive Model Switcher */}
        <header className="header">
          <div className="header-left">
            <div className="status-dot"></div>
            <span>M4 Engine</span>
          </div>
          <select 
            className="model-selector"
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </header>

        <main className="messages-area">
          <div className="reading-lane">
            {messages.length === 0 && (
              <div className="hero">
                <h1>Local Intelligence</h1>
                <p>Currently using <strong>{selectedModel}</strong></p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`bubble-row ${m.role}`}>
                <div className="bubble">
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="bubble-row ai loading-text">M4 is processing...</div>}
            <div ref={scrollEndRef} />
          </div>
        </main>

        <footer className="input-footer">
          <div className="input-box">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Message ${selectedModel}...`}
            />
            <button onClick={handleSend} disabled={loading}>Send</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;