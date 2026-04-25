import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import AttendanceBadge from '../../components/AttendanceBadge';

export default function SessionReport() {
  const { session_id } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  // hardcoded totals for demo
  const totalEnrolled = 145;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/sessions/${session_id}/report`);
        setAttendees(res.data.attendees || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session_id]);

  if (loading) return <div className="page-container text-center mt-4">Loading report...</div>;

  const percentage = Math.round((attendees.length / totalEnrolled) * 100);

  return (
    <div className="page-container">
      <button onClick={() => navigate('/lecturer')} className="btn mb-4" style={{ background: 'none', border: '1px solid var(--border-color)' }}>
        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Session Report</h1>
          <div className="text-muted mb-4">Review attendance data for the closed session.</div>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-muted">Attendance Rate</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{percentage}%</span>
            </div>
            
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ 
                height: '100%', 
                width: `${percentage}%`, 
                backgroundColor: 'var(--success-green)'
              }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--success-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)' }}>{attendees.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', textTransform: 'uppercase', fontWeight: 600 }}>Present</div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--danger-bg)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-text)' }}>{totalEnrolled - attendees.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--danger-text)', textTransform: 'uppercase', fontWeight: 600 }}>Absent</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ flex: '2', minWidth: '300px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Check-in Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{a.name}</td>
                      <td className="mono" style={{ fontSize: '0.875rem' }}>{a.student_id}</td>
                      <td>{a.timestamp}</td>
                      <td><AttendanceBadge percentage={100} /></td>
                    </tr>
                  ))}
                  {attendees.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted" style={{ padding: '2rem' }}>No attendees recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
