import { useState } from 'react'
import axios from 'axios'
import { Upload as UploadIcon, X } from 'lucide-react'

interface UploadProps {
    token: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function Upload({ token, onClose, onSuccess }: UploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('bank_statement');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data.message);
            setFile(null);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setMessage(err.response?.data?.detail || 'Upload failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: '#161b22',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #30363d',
                width: '100%',
                maxWidth: '500px',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '1rem', right: '1rem',
                    background: 'transparent',
                    padding: '4px'
                }}>
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '1.5rem' }}>Upload Personal Finance Docs</h2>

                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Document Type</label>
                        <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#0d1117',
                                border: '1px solid #30363d',
                                color: 'white',
                                padding: '0.75rem',
                                borderRadius: '8px'
                            }}
                        >
                            <option value="bank_statement">Bank Statement (CSV)</option>
                            <option value="salary_slip">Salary Slip (PDF/TXT)</option>
                            <option value="health_insurance">Health Insurance (PDF/MD)</option>
                            <option value="investment_record">Investment Record (CSV)</option>
                        </select>
                    </div>

                    <div style={{
                        border: '2px dashed #30363d',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer'
                    }} onClick={() => document.getElementById('file-input')?.click()}>
                        <UploadIcon size={32} style={{ color: '#8b949e', marginBottom: '1rem' }} />
                        <p style={{ margin: 0, color: '#8b949e' }}>
                            {file ? file.name : "Click to select or drag and drop"}
                        </p>
                        <input
                            id="file-input"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <button type="submit" disabled={!file || loading} style={{ width: '100%' }}>
                        {loading ? 'Uploading...' : 'Upload & Ingest'}
                    </button>
                </form>

                {message && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        borderRadius: '8px',
                        background: message.includes('failed') ? 'rgba(248,81,73,0.1)' : 'rgba(46,160,67,0.1)',
                        color: message.includes('failed') ? '#ff7b72' : '#3fb950',
                        fontSize: '0.9rem'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
