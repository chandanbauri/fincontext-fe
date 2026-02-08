import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Wallet, Send, User as UserIcon, Bot, LogOut, PlusCircle, Menu, X } from 'lucide-react'
import { Auth } from './Auth'
import { Upload } from './Upload'

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

interface UserInfo {
    username: string;
    email: string;
}

interface Stats {
    total_spending: number;
    total_income: number;
    top_category: string;
    balance: number;
}

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<UserInfo | null>(null);
    const [stats, setStats] = useState<Stats>({ total_spending: 0, total_income: 0, top_category: 'N/A', balance: 0 });
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hello! Log in to get personalized financial insights.", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            fetchUser();
            fetchStats();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setMessages([{ text: "Hello! Log in to get personalized financial insights.", sender: 'bot' }]);
        }
    }, [token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(response.data);
            setMessages([{ text: `Welcome back ${response.data.username}! I've loaded your context. How can I help?`, sender: 'bot' }]);
        } catch (error) {
            handleLogout();
        }
    }

    const fetchStats = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }

    const handleLogin = (newToken: string) => {
        setToken(newToken);
    }

    const handleLogout = () => {
        setToken(null);
        setShowSidebar(false);
    }

    const handleSend = async () => {
        if (!input.trim() || !token) return;

        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/chat`,
                { message: input },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const botResponse = response.data.response;
            const botText = typeof botResponse === 'string'
                ? botResponse
                : (botResponse?.message || JSON.stringify(botResponse));

            const botMessage: Message = { text: botText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { text: "Connection error. Is the backend running?", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return <Auth onLogin={handleLogin} />;
    }

    return (
        <div className="layout">
            {}
            {showSidebar && (
                <div
                    onClick={() => setShowSidebar(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 90,
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <div className={`sidebar ${showSidebar ? 'show' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>{user?.username}'s Vault</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleLogout} style={{ background: 'transparent', padding: '4px', border: 'none', cursor: 'pointer' }}>
                            <LogOut size={18} color="#8b949e" />
                        </button>
                        <button
                            className="mobile-only"
                            onClick={() => setShowSidebar(false)}
                            style={{
                                background: 'transparent',
                                padding: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                display: window.innerWidth <= 768 ? 'block' : 'none'
                            }}
                        >
                            <X size={18} color="#8b949e" />
                        </button>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)', border: '1px solid #30363d' }}>
                    <div className="label">Total Balance</div>
                    <div className="value" style={{ color: stats.balance >= 0 ? '#3fb950' : '#f85149', fontSize: '1.5rem' }}>
                        ₹{stats.balance.toLocaleString()}
                    </div>
                </div>

                <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                    <div className="stat-card" style={{ margin: 0, padding: '0.75rem' }}>
                        <div className="label" style={{ fontSize: '0.7rem' }}>Monthly Spending</div>
                        <div className="value" style={{ fontSize: '1rem', color: '#ff7b72' }}>₹{stats.total_spending.toLocaleString()}</div>
                    </div>
                    <div className="stat-card" style={{ margin: 0, padding: '0.75rem' }}>
                        <div className="label" style={{ fontSize: '0.7rem' }}>Total Income</div>
                        <div className="value" style={{ fontSize: '1rem', color: '#3fb950' }}>₹{stats.total_income.toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="label">Top Category</div>
                    <div className="value" style={{ fontSize: '1.1rem', color: '#a5d6ff' }}>{stats.top_category}</div>
                </div>

                <button
                    onClick={() => {
                        setShowUpload(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        background: 'rgba(56,139,253,0.1)',
                        border: '1px solid #388bfd',
                        color: '#58a6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <PlusCircle size={18} />
                    Upload Documents
                </button>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #30363d', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#8b949e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950' }}></div>
                        Secure Pipeline Active
                    </div>
                </div>
            </div>

            <div className="chat-container">
                <div className="chat-header">
                    <button
                        onClick={() => setShowSidebar(true)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#8b949e',
                            marginRight: '8px'
                        }}
                        className="mobile-menu-btn"
                    >
                        <Menu size={24} />
                    </button>

                    <div style={{
                        background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                        padding: '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Wallet color="white" size={20} />
                    </div>
                    <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                        <h1 style={{ margin: 0 }}>FinContext AI</h1>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>Powered by Elastic Agent Builder</div>
                    </div>
                    {user && (
                        <div className="user-info" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user.username}</div>
                            <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Personal Workspace</div>
                        </div>
                    )}
                </div>

                <div className="messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.sender}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', opacity: 0.7 }}>
                                {msg.sender === 'user' ? <UserIcon size={12} /> : <Bot size={12} />}
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {msg.sender === 'user' ? 'You' : 'FinAI'}
                                </span>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message bot" style={{ width: 'fit-content' }}>
                            <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
                                <div className="dot" style={{ width: 6, height: 6, background: '#8b949e', borderRadius: '50%' }}></div>
                                <div className="dot" style={{ width: 6, height: 6, background: '#8b949e', borderRadius: '50%', animationDelay: '0.2s' }}></div>
                                <div className="dot" style={{ width: 6, height: 6, background: '#8b949e', borderRadius: '50%', animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your financial data..."
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        style={{
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            {showUpload && <Upload token={token} onClose={() => setShowUpload(false)} onSuccess={() => fetchStats()} />}
        </div>
    )
}

export default App

