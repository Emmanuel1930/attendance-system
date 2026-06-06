import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Course State
  const [showForm, setShowForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_name: '',
    units: '',
    level: '100'
  });

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
        const lecturerId = userData.db_id || userData.id || 1;
        const [sessionsRes, coursesRes] = await Promise.all([
          axios.get(`/api/sessions/active?lecturer_id=${lecturerId}`),
          axios.get(`/api/courses?lecturer_id=${lecturerId}`)
        ]);
        setActiveSessions(sessionsRes.data.sessions || []);
        setMyCourses(coursesRes.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const lecturerId = user.db_id || user.id || 1;
      const res = await axios.post('/api/courses', {
        ...newCourse,
        lecturer_id: lecturerId
      });
      if (res.data.success) {
        setMyCourses([...myCourses, res.data.course]);
        setShowForm(false);
        setNewCourse({ course_code: '', course_name: '', units: '', level: '100' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will delete all its attendance records!')) {
      return;
    }
    try {
      const res = await axios.delete(`/api/courses/${courseId}`);
      if (res.data.success) {
        setMyCourses(myCourses.filter(c => c.id !== courseId));
        // Remove related active sessions from UI
        setActiveSessions(activeSessions.filter(s => s.course_id !== courseId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting course');
    }
  };

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
        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Course'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 className="mb-4" style={{ fontSize: '1.2rem', color: 'var(--primary-blue)', fontWeight: '600' }}>Create a New Course</h3>
          <form onSubmit={handleCreateCourse} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Course Code (e.g. CSC 201)</label>
              <input type="text" style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} placeholder="CSC 201" value={newCourse.course_code} onChange={e => setNewCourse({...newCourse, course_code: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Course Name</label>
              <input type="text" style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} placeholder="Intro to Programming" value={newCourse.course_name} onChange={e => setNewCourse({...newCourse, course_name: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Units</label>
              <input type="number" style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', outline: 'none' }} value={newCourse.units} onChange={e => setNewCourse({...newCourse, units: e.target.value})} min="1" max="6" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Level</label>
              <select style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }} value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})}>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>Save Course</button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Level</th>
                <th>Units</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">No courses added yet.</td>
                </tr>
              ) : (
                myCourses.map(course => (
                  <tr key={course.id}>
                    <td style={{ fontWeight: 600 }}>{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.level}L</td>
                    <td>{course.units}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 1rem', minHeight: 'auto' }}
                        onClick={() => navigate('/lecturer/session', { state: { courseId: course.id } })}
                      >
                        Start Session
                      </button>
                      <button 
                        className="btn" 
                        style={{ padding: '0.4rem 1rem', minHeight: 'auto', backgroundColor: '#fee2e2', color: '#dc2626' }}
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
