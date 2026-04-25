import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AttendanceBadge from '../../components/AttendanceBadge';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [history, setHistory] = useState([]);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('run_user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/attendance/student/me?email=${userData.email}`);
        setAttendance(res.data.courses || []);
        setHistory(res.data.history || []);
        setRecent(res.data.recent);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) return <div className="page-container text-center mt-4">Loading dashboard...</div>;

  return (
    <div className="page-container">
      {attendance.filter(c => c.percentage < 70).map(course => {
        const sessionsNeeded = Math.ceil((0.7 * course.sessions_held - course.sessions_attended) / (1 - 0.7));
        return (
          <div key={`warning-${course.course_id}`} style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderLeft: '4px solid #D97706', padding: '12px 16px', borderRadius: '8px', width: '100%', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              ⚠ You are at risk in {course.course_code} {course.course_name} — {course.percentage}% attendance.
            </div>
            <div>
              You need to attend the next {sessionsNeeded} session{sessionsNeeded !== 1 ? 's' : ''} to meet the 70% requirement.
            </div>
          </div>
        );
      })}
      
      <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]}</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="mono" style={{ backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>ID: {user?.id}</span>
            <span style={{ backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>Level {user?.level}</span>
            <span style={{ backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>{user?.department}</span>
          </div>
        </div>
        <button onClick={() => navigate('/student/scan')} className="btn btn-gold" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
          Scan QR Code
        </button>
      </div>

      <div className="card mb-4" style={{ borderLeft: '4px solid var(--success-green)' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>🕐 Last Attendance Marked</h2>
        {recent ? (
          <div>
            <div style={{ fontWeight: 600 }}>{recent.course_name}</div>
            <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span>{recent.date === new Date().toISOString().split('T')[0] ? 'Today' : recent.date} at {recent.time}</span>
              <span style={{ color: 'var(--success-green)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                ✅ Present
              </span>
            </div>
          </div>
        ) : (
          <div className="text-muted">No attendance recorded yet. Scan a QR code to get started.</div>
        )}
      </div>

      <h2 className="mb-2" style={{ fontSize: '1.25rem' }}>Attendance Summary</h2>
      <div className="grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {attendance.map((course, idx) => (
          <div key={`course-${idx}`} className="card">
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{course.course_code}</div>
            <div className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>{course.course_name}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>{course.percentage}%</span>
              <AttendanceBadge percentage={course.percentage} />
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{ 
                height: '100%', 
                width: `${course.percentage}%`, 
                backgroundColor: course.percentage >= 70 ? 'var(--success-green)' : course.percentage >= 60 ? 'var(--warning-amber)' : 'var(--danger-red)',
                transition: 'width 0.5s ease-out'
              }}></div>
            </div>
            
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {course.sessions_attended} of {course.sessions_held} sessions attended
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-2" style={{ fontSize: '1.25rem' }}>Recent Activity</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {history.length > 0 ? (
          <table className="w-full">
            <tbody>
              {history.map((record, idx) => (
                <tr key={`history-${idx}`}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{record.course_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>{record.date} at {record.time}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <AttendanceBadge percentage={record.status === 'present' ? 100 : 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-text)' }}>No recent activity found.</div>
        )}
      </div>
    </div>
  );
}
