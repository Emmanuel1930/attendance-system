import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

export default function AttendSession() {
  const { sessionToken } = useParams();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/sessions/info/${sessionToken}`);
        setSessionInfo(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !matricNumber) return;
    
    setSubmitting(true);
    try {
      const res = await axios.post('/api/attendance/submit', {
        name,
        email,
        matric_number: matricNumber,
        session_token: sessionToken
      });
      setResult({ type: 'success', data: res.data });
    } catch (err) {
      if (err.response?.status === 409) {
        setResult({ type: 'duplicate', message: 'You are already marked present for this session' });
      } else if (err.response?.status === 400 && err.response?.data?.message.includes('active')) {
        setResult({ type: 'closed', message: 'This session is no longer active' });
      } else {
        setResult({ type: 'error', message: err.response?.data?.message || 'Submission failed' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container text-center mt-4">Loading session...</div>;
  if (error) return <div className="page-container text-center mt-4" style={{ color: 'var(--danger-red)' }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--off-white)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--primary-blue)', padding: '1rem', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          <span>RUN</span> <span style={{ color: 'var(--gold-accent)' }}>Attendance</span>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card w-full" style={{ maxWidth: '400px' }}>
          
          <div className="text-center mb-4">
            <h1 style={{ fontSize: '1.25rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
              {sessionInfo?.course_name}
            </h1>
            <p className="text-muted">{sessionInfo?.date}</p>
          </div>

          {!sessionInfo?.is_active && !result ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <AlertCircle size={48} color="var(--warning-amber)" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Session Closed</h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>This attendance session has been closed by your lecturer. Please contact your lecturer if you believe this is an error.</p>
              <button onClick={() => window.history.back()} className="btn btn-primary">
                Go Back
              </button>
            </div>
          ) : result ? (
            <div style={{ 
              backgroundColor: result.type === 'success' ? 'var(--success-bg)' : result.type === 'duplicate' ? 'var(--warning-bg)' : 'var(--danger-bg)',
              padding: '1.5rem', borderRadius: '8px', textAlign: 'center',
              border: `1px solid ${result.type === 'success' ? 'var(--success-text)' : result.type === 'duplicate' ? 'var(--warning-text)' : 'var(--danger-text)'}`
            }}>
              {result.type === 'success' && <CheckCircle size={48} color="var(--success-text)" style={{ margin: '0 auto 1rem' }} />}
              {result.type === 'duplicate' && <AlertTriangle size={48} color="var(--warning-text)" style={{ margin: '0 auto 1rem' }} />}
              {(result.type === 'closed' || result.type === 'error') && <XCircle size={48} color="var(--danger-text)" style={{ margin: '0 auto 1rem' }} />}
              
              {result.type === 'success' ? (
                <>
                  <h2 style={{ color: 'var(--success-text)', marginBottom: '0.5rem' }}>Attendance Recorded!</h2>
                  <p style={{ color: 'var(--success-text)' }}>{result.data.course_name} — {result.data.timestamp}</p>
                  
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ color: 'var(--muted-text)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Want to track your attendance?<br/>Your dashboard has been created.</p>
                    <a href="/login" className="btn btn-gold w-full" style={{ display: 'inline-block', textDecoration: 'none' }}>
                      View My Dashboard
                    </a>
                  </div>
                </>
              ) : result.type === 'duplicate' ? (
                <p style={{ color: 'var(--warning-text)', fontWeight: 500 }}>{result.message}</p>
              ) : (
                <p style={{ color: 'var(--danger-text)', fontWeight: 500 }}>{result.message}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Adebayo Okonkwo" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>School Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="yourname@run.edu.ng" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Matric Number</label>
                <input 
                  type="text" 
                  className="input-field mono" 
                  placeholder="e.g. CSC/2021/001" 
                  value={matricNumber} 
                  onChange={(e) => setMatricNumber(e.target.value)} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-full" 
                style={{ padding: '1rem', fontSize: '1.1rem' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Mark Present'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
