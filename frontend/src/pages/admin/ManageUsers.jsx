import { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceBadge from '../../components/AttendanceBadge';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page-container text-center mt-4">Loading users...</div>;

  return (
    <div className="page-container">
      <h1 className="mb-4" style={{ color: 'var(--primary-blue)' }}>User Management</h1>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Level / Dept</th>
                <th>Overall Attendance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={idx} style={{ backgroundColor: u.overall_attendance < 70 ? 'var(--danger-bg)' : 'transparent' }}>
                  <td style={{ fontWeight: 500, color: u.overall_attendance < 70 ? 'var(--danger-text)' : 'inherit' }}>{u.name}</td>
                  <td className="mono" style={{ fontSize: '0.875rem' }}>{u.student_id}</td>
                  <td className="text-muted">{u.level} | {u.department}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, minWidth: '40px' }}>{u.overall_attendance}%</span>
                      <AttendanceBadge percentage={u.overall_attendance} />
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted" style={{ padding: '2rem' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
