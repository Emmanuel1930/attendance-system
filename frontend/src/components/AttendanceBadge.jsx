export default function AttendanceBadge({ percentage }) {
  let bgColor = 'var(--success-bg)';
  let textColor = 'var(--success-text)';
  let text = 'On Track';

  if (percentage < 60) {
    bgColor = 'var(--danger-bg)';
    textColor = 'var(--danger-text)';
    text = 'Below Threshold';
  } else if (percentage < 70) {
    bgColor = 'var(--warning-bg)';
    textColor = 'var(--warning-text)';
    text = 'At Risk';
  }

  return (
    <span style={{
      backgroundColor: bgColor,
      color: textColor,
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: 500,
      display: 'inline-block'
    }}>
      {text}
    </span>
  );
}
