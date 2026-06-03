import { useEffect } from 'react';
import { formatDisplayDate, isRegistrationClosed } from '../lib/eventFormat';
import './EventDetailsModal.css';

export default function EventDetailsModal({ event, onClose }) {
  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!event) return null;

  const regClosed = isRegistrationClosed(event.registration_end_date);
  const statusLabel = regClosed ? 'Registration Closed' : 'Registration Open';
  const statusClass = regClosed ? 'status-badge--closed' : 'status-badge--open';

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        
        {event.image_url && (
          <div className="modal-image-wrapper">
            <img src={event.image_url} alt={event.title} className="modal-image" />
          </div>
        )}
        
        <div className="modal-body">
          <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
          <h2 id="modal-title" className="modal-title">{event.title}</h2>
          
          <div className="modal-info-grid">
            <div className="modal-info-item">
              <strong>Venue</strong>
              <p>{event.venue || 'To Be Announced'}</p>
            </div>
            
            <div className="modal-info-item">
              <strong>Start Date</strong>
              <p>{formatDisplayDate(event.start_date || event.event_date)}</p>
            </div>
            
            <div className="modal-info-item">
              <strong>End Date</strong>
              <p>{formatDisplayDate(event.end_date) || '—'}</p>
            </div>
            
            <div className="modal-info-item">
              <strong>Registration Ends</strong>
              <p>{formatDisplayDate(event.registration_end_date) || '—'}</p>
            </div>
          </div>
          
          <div className="modal-description">
            <h3>Event Details</h3>
            <p className="modal-desc-text" style={{ whiteSpace: 'pre-wrap' }}>
              {event.description || `Join us for ${event.title} at ${event.venue || 'TBA'} starting on ${formatDisplayDate(event.start_date || event.event_date)}. Stay updated for further details.`}
            </p>
            {regClosed && (
              <p className="modal-warning-text" style={{ marginTop: '0.75rem', fontWeight: 600 }}>
                ⚠️ Registration for this event has officially closed.
              </p>
            )}
          </div>

          {event.form_link && (
            <div className="modal-actions">
              <a
                href={regClosed ? undefined : event.form_link}
                target="_blank"
                rel="noreferrer"
                className={`btn ${regClosed ? 'btn--disabled' : 'btn--secondary'}`}
                aria-disabled={regClosed}
                style={{ width: '100%', textAlign: 'center', display: 'inline-block' }}
              >
                {regClosed ? 'Registration Closed' : 'Register Now'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
