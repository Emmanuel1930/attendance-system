import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/admin/overview');
        setStats(res.data.stats);
        setRecentSessions(res.data.recent_sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-container text-center mt-4">Loading overview...</div>;

  return (
    <div className="page-container">
      <h1 className="mb-4" style={{ color: 'var(--primary-blue)' }}>System Overview</h1>
      
      <div className="grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Students</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{stats?.total_students}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Lecturers</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{stats?.total_lecturers}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Courses</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{stats?.total_courses}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Sessions Today</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{stats?.sessions_today}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/users')} className="btn btn-primary">
            View All Users
          </button>
          <button onClick={() => navigate('/admin/overview')} className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
            System Overview
          </button>
        </div>
        <button 
          onClick={async () => {
            if (window.confirm("Are you sure? This will delete all attendance records and sessions.")) {
              try {
                await axios.delete('/api/admin/clear');
                alert("All session data cleared successfully.");
                window.location.reload();
              } catch (err) {
                alert("Failed to clear data.");
              }
            }
          }}
          className="btn btn-danger"
        >
          Clear Session Data
        </button>
      </div>

      <h2 className="mb-2" style={{ fontSize: '1.25rem' }}>Recent Sessions (All Courses)</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr>
                <th>Course</th>
                <th>Lecturer</th>
                <th>Date</th>
                <th>Students Attended</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{s.course}</td>
                  <td>{s.lecturer}</td>
                  <td>{s.date}</td>
                  <td>{s.students_attended}</td>
                  <td>
                    <span style={{
                      backgroundColor: s.status === 'Active' ? 'var(--success-bg)' : 'var(--off-white)',
                      color: s.status === 'Active' ? 'var(--success-text)' : 'var(--muted-text)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentSessions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>No recent sessions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
