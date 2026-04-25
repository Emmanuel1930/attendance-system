export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--dark-text)', color: 'var(--muted-text)', padding: '1.5rem', marginTop: 'auto' }}>
      <div className="page-container" style={{ padding: '0', minHeight: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '0.875rem' }}>
          RUN Attendance System &copy; 2024 &mdash; Redeemer's University Nigeria
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }} className="mono">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-green)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          System Operational
        </div>

        <div style={{ fontSize: '0.875rem' }}>
          Department of Computer Science
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </footer>
  );
}
