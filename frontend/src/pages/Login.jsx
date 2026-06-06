import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    if (activeTab === 'student') {
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    } else if (activeTab === 'lecturer') {
      setEmail('lecturer@run.edu.ng');
      setPassword('lecturer123');
      setIsSignUp(false);
    } else {
      setEmail('admin@run.edu.ng');
      setPassword('admin123');
      setIsSignUp(false);
    }
    setError('');
  }, [activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp && activeTab === 'lecturer') {
        const res = await axios.post('/api/auth/register_lecturer', { name, email, password, department });
        if (res.data.success) {
          setIsSignUp(false);
          alert('Lecturer registered successfully. Please log in.');
        }
      } else {
        const res = await axios.post('/api/auth/login', { email, password });
        if (res.data.success) {
          localStorage.setItem('run_user', JSON.stringify(res.data.user));
          navigate(`/${res.data.user.role}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, #003087, #001a4d)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '2px', marginBottom: '0.5rem' }}>RUN</h1>
        <p style={{ color: 'var(--light-gold)', fontSize: '1.1rem' }}>Redeemer's University Nigeria</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '0', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          {['student', 'lecturer', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === role ? '2px solid var(--gold-accent)' : '2px solid transparent',
                fontWeight: activeTab === role ? 600 : 500,
                color: activeTab === role ? 'var(--primary-blue)' : 'var(--muted-text)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {role}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {isSignUp && activeTab === 'lecturer' && (
              <>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Department</label>
                  <input
                    type="text"
                    className="input-field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@run.edu.ng or name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pattern=".*@(gmail\.com|run\.edu\.ng)$"
                title="Please enter a valid @gmail.com or @run.edu.ng email address"
                required
              />
            </div>

            <div className="mb-4" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                {activeTab === 'student' ? 'Matric Number / Password' : 'Password'}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '2.4rem', background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isSignUp && activeTab === 'lecturer' ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {activeTab === 'lecturer' && (
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: 500 }}
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          )}

          {activeTab !== 'student' && !isSignUp && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--off-white)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Demo Credentials</div>
              <div className="mono" style={{ color: 'var(--muted-text)' }}>
                Email: {activeTab}@run.edu.ng<br/>
                Password: {activeTab}123
              </div>
            </div>
          )}
        </div>

      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
