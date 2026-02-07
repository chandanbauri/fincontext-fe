import { useState } from 'react'
import axios from 'axios'

interface AuthProps {
    onLogin: (token: string) => void;
}

export function Auth({ onLogin }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const params = new URLSearchParams();
                params.append('username', username);
                params.append('password', password);

                const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/token`, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                onLogin(response.data.access_token);
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/signup`, {
                    username,
                    password,
                    email
                });
                setIsLogin(true);
                alert('Signup successful! Please login.');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'An error occurred');
        }
    }

    return (
        <div className="auth-container" style={{
            maxWidth: '400px',
            margin: '100px auto',
            padding: '2rem',
            background: '#161b22',
            borderRadius: '16px',
            border: '1px solid #30363d',
            textAlign: 'left'
        }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                {isLogin ? 'Login to FinContext' : 'Create Account'}
            </h2>

            {error && <div style={{ color: '#ff7b72', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                {!isLogin && (
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" style={{ width: '100%' }}>
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                <a
                    href="#"
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ color: '#58a6ff', textDecoration: 'none' }}
                >
                    {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                </a>
            </div>
        </div>
    )
}
