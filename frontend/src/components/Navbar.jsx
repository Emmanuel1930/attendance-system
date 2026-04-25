import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userStr = localStorage.getItem('run_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('run_user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="page-container" style={{ padding: '0', minHeight: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.5rem' }}>RUN</span>
          <span style={{ color: 'var(--gold-accent)', fontWeight: 600 }}>Attendance</span>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }}>
          {user.role === 'student' && (
            <>
              <Link to="/student" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/student/scan" style={{ color: 'white', textDecoration: 'none' }}>Scan QR</Link>
              <Link to="/student/history" style={{ color: 'white', textDecoration: 'none' }}>History</Link>
            </>
          )}
          {user.role === 'lecturer' && (
            <>
              <Link to="/lecturer" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/lecturer/session" style={{ color: 'white', textDecoration: 'none' }}>Start Session</Link>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
              <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>Users</Link>
              <Link to="/admin/overview" style={{ color: 'white', textDecoration: 'none' }}>Overview</Link>
            </>
          )}
        </div>

        <div className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 500 }}>{user.name}</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--gold-accent)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {user.role.toUpperCase()}
            </span>
          </div>
          <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" style={{ display: 'block', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {user.role === 'student' && (
            <>
              <Link to="/student" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/student/scan" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Scan QR</Link>
              <Link to="/student/history" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>History</Link>
            </>
          )}
          {user.role === 'lecturer' && (
            <>
              <Link to="/lecturer" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/lecturer/session" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Start Session</Link>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Users</Link>
              <Link to="/admin/overview" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Overview</Link>
            </>
          )}
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', width: '100%' }}>
            Logout
          </button>
        </div>
      )}
      
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
