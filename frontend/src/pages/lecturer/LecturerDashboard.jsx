import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const myCourses = [
    { code: 'CSC 401', name: 'Software Engineering', id: 1 },
    { code: 'CSC 403', name: 'Computer Networks', id: 2 },
    { code: 'CSC 405', name: 'Artificial Intelligence', id: 3 },
  ];

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
        const res = await axios.get(`/api/sessions/active?lecturer_id=${userData.db_id || 1}`);
        setActiveSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="page-container text-center mt-4">Loading dashboard...</div>;

  const greetingTime = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-container">
      <h1 className="mb-4" style={{ color: 'var(--primary-blue)' }}>{greetingTime}, {user?.name}</h1>

      <div className="grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Sessions</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{activeSessions.length}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Students</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>145</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Courses Teaching</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{myCourses.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-2">
        <h2 style={{ fontSize: '1.25rem' }}>My Courses</h2>
      </div>

      <div className="card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.map(course => (
                <tr key={course.id}>
                  <td style={{ fontWeight: 600 }}>{course.code}</td>
                  <td>{course.name}</td>
                  <td>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 1rem', minHeight: 'auto' }}
                      onClick={() => navigate('/lecturer/session', { state: { courseId: course.id } })}
                    >
                      Start Session
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeSessions.length > 0 && (
        <>
          <h2 className="mb-2" style={{ fontSize: '1.25rem' }}>Active Sessions</h2>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {activeSessions.map(session => (
              <div key={session.id} className="card" style={{ borderLeft: '4px solid var(--success-green)' }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{session.course_code}</div>
                <div className="text-muted mb-2">{session.course_name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono text-muted" style={{ fontSize: '0.875rem' }}>{session.start_time}</span>
                  <button onClick={() => navigate(`/lecturer/report/${session.id}`)} className="btn" style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
                    View Live
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
