import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';

export default function ScanQR() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const startScanner = () => {
    setScanResult(null);
    setError(null);
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          scannerRef.current = null;
          
          let token = decodedText;
          if (decodedText.includes('/attend/')) {
            token = decodedText.split('/attend/')[1];
          }
          
          const userStr = localStorage.getItem('run_user');
          const user = JSON.parse(userStr);
          
          try {
            const res = await axios.post('/api/attendance/scan', {
              qr_token: token,
              student_id: user.db_id || 1
            });
            setScanResult(res.data);
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to record attendance');
          }
        },
        (err) => { /* ignore normal scanning errors */ }
      );

      scannerRef.current = scanner;
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <button onClick={() => navigate('/student')} className="btn mb-4" style={{ background: 'none', border: '1px solid var(--border-color)' }}>
        <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
      </button>

      <div className="card text-center">
        <h1 className="mb-2" style={{ fontSize: '1.5rem' }}>Scan Attendance QR</h1>
        <p className="text-muted mb-4">Point your camera at the QR code displayed by your lecturer.</p>
        
        {!scanResult && !error && (
          <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
        )}

        {scanResult && (
          <div style={{ backgroundColor: 'var(--success-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--success-text)' }}>
            <CheckCircle size={48} color="var(--success-text)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ color: 'var(--success-text)', marginBottom: '0.5rem' }}>Attendance Recorded!</h2>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{scanResult.course_name}</div>
            <div className="mono text-muted" style={{ fontSize: '0.875rem' }}>{scanResult.timestamp}</div>
            
            <button onClick={() => navigate('/student')} className="btn mt-4" style={{ backgroundColor: 'var(--success-text)', color: 'white' }}>
              Return to Dashboard
            </button>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: error.includes('Already') ? 'var(--warning-bg)' : 'var(--danger-bg)', padding: '2rem', borderRadius: '8px', border: `1px solid ${error.includes('Already') ? 'var(--warning-text)' : 'var(--danger-text)'}` }}>
            {error.includes('Already') ? (
              <AlertTriangle size={48} color="var(--warning-text)" style={{ margin: '0 auto 1rem auto' }} />
            ) : (
              <XCircle size={48} color="var(--danger-text)" style={{ margin: '0 auto 1rem auto' }} />
            )}
            <h2 style={{ color: error.includes('Already') ? 'var(--warning-text)' : 'var(--danger-text)', marginBottom: '0.5rem' }}>
              {error.includes('Already') ? 'Already Scanned' : 'Scan Failed'}
            </h2>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={startScanner} className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { border-radius: 8px; overflow: hidden; }
        #qr-reader__dashboard_section_csr button {
          background-color: var(--primary-blue) !important;
          color: white !important;
          border: none !important;
          padding: 0.5rem 1rem !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}
