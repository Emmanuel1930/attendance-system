import { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceBadge from '../../components/AttendanceBadge';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const userStr = localStorage.getItem('run_user');
    const userData = JSON.parse(userStr);

    const fetchData = async () => {
      try {
        const [histRes, attRes] = await Promise.all([
          axios.get(`/api/attendance/student/${userData.db_id || 1}/history`),
          axios.get(`/api/attendance/student/${userData.db_id || 1}`)
        ]);
        setHistory(histRes.data.history || []);
        setAttendanceSummary(attRes.data.records || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="page-container text-center mt-4">Loading history...</div>;

  const courses = ['All', ...new Set(history.map(item => item.course))];
  
  const filteredHistory = history.filter(item => {
    const matchCourse = filterCourse === 'All' || item.course === filterCourse;
    const matchStatus = filterStatus === 'All' || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchCourse && matchStatus;
  });

  return (
    <div className="page-container">
      <h1 className="mb-4" style={{ color: 'var(--primary-blue)' }}>Attendance History</h1>

      {attendanceSummary.map(course => {
        if (course.percentage < 70) {
          return (
            <div key={course.course_id} className="mb-4" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-text)', padding: '1rem', borderRadius: '8px', color: 'var(--warning-text)' }}>
              <strong>⚠ Warning:</strong> Your attendance in {course.course_code} {course.course_name} is {course.percentage}%.<br/>
              You must improve your attendance to meet the 70% requirement.
            </div>
          );
        }
        return null;
      })}

      <div className="card mb-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Filter by Course</label>
          <select className="input-field" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
            {courses.map(course => <option key={course} value={course}>{course}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Filter by Status</label>
          <select className="input-field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Session Time</th>
                <th>Status</th>
                <th>Week</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td style={{ fontWeight: 500 }}>{record.course}</td>
                    <td>{record.time}</td>
                    <td>
                      <AttendanceBadge percentage={record.status === 'present' ? 100 : 0} />
                    </td>
                    <td>{record.week}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '2rem', color: 'var(--muted-text)' }}>No records found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-center text-muted mt-4" style={{ fontSize: '0.875rem' }}>
        Report generated as of {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
