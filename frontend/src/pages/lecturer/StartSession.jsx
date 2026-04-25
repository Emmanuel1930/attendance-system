import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export default function StartSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courseId, setCourseId] = useState(location.state?.courseId || '');
  const [session, setSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const myCourses = [
    { code: 'CSC 401', name: 'Software Engineering', id: 1 },
    { code: 'CSC 403', name: 'Computer Networks', id: 2 },
    { code: 'CSC 405', name: 'Artificial Intelligence', id: 3 },
  ];

  useEffect(() => {
    let interval;
    if (session) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/sessions/${session.session_id}/report`);
          setAttendees(res.data.attendees || []);
        } catch (err) {
          console.error(err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [session]);

  const handleGenerate = async () => {
    if (!courseId) {
      setError('Please select a course');
      return;
    }
    setLoading(true);
    setError('');
    
    const userStr = localStorage.getItem('run_user');
    const user = JSON.parse(userStr);

    try {
      const res = await axios.post('/api/sessions/start', {
        course_id: courseId,
        lecturer_id: user.db_id || 1,
        base_url: window.location.origin
      });
      setSession(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try {
      await axios.post('/api/sessions/close', { session_id: session.session_id });
      navigate(`/lecturer/report/${session.session_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCourse = myCourses.find(c => c.id === parseInt(courseId));

  return (
    <div className="page-container">
      <button onClick={() => navigate('/lecturer')} className="btn mb-4" style={{ background: 'none', border: '1px solid var(--border-color)' }}>
        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
      </button>

      {!session ? (
        <div className="card mx-auto" style={{ maxWidth: '500px' }}>
          <h1 className="mb-4" style={{ fontSize: '1.5rem', color: 'var(--primary-blue)' }}>Start Attendance Session</h1>
          
          {error && <div className="mb-4" style={{ color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)', padding: '1rem', borderRadius: '8px' }}>{error}</div>}
          
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Course</label>
            <select className="input-field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">-- Select a Course --</option>
              {myCourses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>
          
          <button onClick={handleGenerate} className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div className="card text-center" style={{ marginBottom: '1.5rem' }}>
              <h2 className="mb-2" style={{ fontSize: '1.25rem' }}>{selectedCourse?.code}</h2>
              <div className="text-muted mb-4">{selectedCourse?.name}</div>
              
              <div style={{ padding: '1rem', backgroundColor: 'white', display: 'inline-block', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <img src={session.qr_image} alt="Session QR Code" style={{ width: '280px', height: '280px' }} />
              </div>
              
              <div className="card" style={{ backgroundColor: 'var(--off-white)', textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Date:</span>
                  <span style={{ fontWeight: 500 }}>{new Date().toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Time Started:</span>
                  <span style={{ fontWeight: 500 }}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Session Code:</span>
                  <span className="mono" style={{ fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.session_code}</span>
                </div>
              </div>
              
              <button onClick={handleCloseSession} className="btn btn-danger w-full">
                Close Session
              </button>
            </div>
          </div>
          
          <div style={{ flex: '2', minWidth: '300px' }}>
            <div className="card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Live Attendance</h2>
                <div style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--success-green)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                  {attendees.length} students checked in
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Full Name</th>
                      <th>Matric Number</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a, idx) => (
                      <tr key={idx} style={{ animation: 'fadeIn 0.5s' }}>
                        <td style={{ fontWeight: 500 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 500 }}>{a.name}</td>
                        <td className="mono" style={{ fontSize: '0.875rem' }}>{a.student_id}</td>
                        <td className="text-muted">{a.timestamp}</td>
                      </tr>
                    ))}
                    {attendees.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted" style={{ padding: '2rem' }}>
                          Waiting for students to scan the QR code...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; background-color: var(--success-bg); } to { opacity: 1; background-color: transparent; } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
