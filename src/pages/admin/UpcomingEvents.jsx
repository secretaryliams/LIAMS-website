import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUpcomingEvents,
  addUpcomingEvent,
  updateUpcomingEvent,
  toggleUpcomingEvent,
  deleteUpcomingEvent,
} from '../../store/slices/adminEventsSlice';
import { formatDisplayDate, isRegistrationClosed } from '../../lib/eventFormat';
import { DEFAULT_EVENT_VENUE, formatEventVenue } from '../../lib/eventVenue';
import { uploadEventImage } from '../../lib/storage';
import ImageViewer from '../../components/ImageViewer';
import './Admin.css';

export default function UpcomingEvents() {
  const dispatch = useDispatch();
  const { upcoming: rows, loadingUpcoming: loading, error } = useSelector((state) => state.adminEvents);
  
  // Form fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(''); // Keep for backward compatibility
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationEndDate, setRegistrationEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [formLink, setFormLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // UI states
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewPosterSrc, setPreviewPosterSrc] = useState(null);

  useEffect(() => {
    dispatch(fetchUpcomingEvents());
  }, [dispatch]);

  // Handle local image file preview
  useEffect(() => {
    if (!imageFile) {
      setPreviewImageUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImageUrl(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  // Set form fields for editing
  function handleStartEdit(row) {
    setEditingEvent(row);
    setTitle(row.title || '');
    setDescription(row.description || '');
    setEventDate(row.event_date || '');
    setStartDate(row.start_date || '');
    setEndDate(row.end_date || '');
    setRegistrationEndDate(row.registration_end_date || '');
    setVenue(row.venue || '');
    setFormLink(row.form_link || '');
    setImageFile(null);
    setLocalError('');
    
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cancel editing mode and reset form fields
  function handleCancelEdit() {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setEventDate('');
    setStartDate('');
    setEndDate('');
    setRegistrationEndDate('');
    setVenue('');
    setFormLink('');
    setImageFile(null);
    setLocalError('');
  }

  // Handle Form submit (add or update)
  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    try {
      let imageUrl = editingEvent ? editingEvent.image_url : null;
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile);
      }
      
      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        event_date: startDate || eventDate || null, // Map startDate as fallback
        start_date: startDate || null,
        end_date: endDate || null,
        registration_end_date: registrationEndDate || null,
        venue: venue.trim() || null,
        form_link: formLink.trim() || null,
        image_url: imageUrl,
      };

      let result;
      if (editingEvent) {
        result = await dispatch(updateUpcomingEvent({
          id: editingEvent.id,
          eventData,
        }));
      } else {
        result = await dispatch(addUpcomingEvent(eventData));
      }
      
      if (result.error) {
        setLocalError(result.payload || 'Failed to save event');
        return;
      }
      
      handleCancelEdit();
    } catch (err) {
      setLocalError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleToggle(id, enabled) {
    dispatch(toggleUpcomingEvent({ id, enabled }));
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    dispatch(deleteUpcomingEvent(id));
  }

  const regClosed = isRegistrationClosed(registrationEndDate);

  return (
    <div className="admin-card">
      <h2>{editingEvent ? `Edit Event: ${editingEvent.title}` : 'Upcoming events'}</h2>
      
      <div className="admin-two-cols">
        {/* Form Column */}
        <div className="admin-form-col">
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            
            <label>
              Short Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief summary of the event (2 lines max)..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </label>
            
            <div className="form-row-grid">
              <label>
                Start Date
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
              <label>
                End Date
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
            </div>

            <label>
              Registration End Date
              <input type="date" value={registrationEndDate} onChange={(e) => setRegistrationEndDate(e.target.value)} />
            </label>

            <label>
              Venue
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder={DEFAULT_EVENT_VENUE}
              />
            </label>
            
            <label>
              Form / registration link
              <input
                type="url"
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="https://..."
              />
            </label>
            
            <label>
              Cover image (optional)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
            
            <div className="form-actions-row">
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Saving…' : editingEvent ? 'Save Changes' : 'Add event'}
              </button>
              {editingEvent && (
                <button type="button" className="btn btn--outline" onClick={handleCancelEdit} style={{ color: 'var(--navy)', borderColor: 'var(--border)' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="admin-preview-col">
          <h3 className="preview-header">Live Event Preview</h3>
          <div className="event-preview-card-wrapper">
            <article className="card event-card preview-card">
              <div
                className="event-card__image-container"
                style={{ cursor: (previewImageUrl || editingEvent?.image_url) ? 'zoom-in' : 'default' }}
                onClick={() => {
                  if (previewImageUrl || editingEvent?.image_url) {
                    setPreviewPosterSrc(previewImageUrl || editingEvent.image_url);
                  }
                }}
                role="button"
                aria-label="Preview full poster image"
              >
                {previewImageUrl ? (
                  <img src={previewImageUrl} alt="Preview" className="event-card__image" />
                ) : editingEvent?.image_url ? (
                  <img src={editingEvent.image_url} alt="Preview" className="event-card__image" />
                ) : (
                  <div className="event-card__image-placeholder">
                    <span>No Cover Image Selected</span>
                  </div>
                )}
              </div>
              <div className="event-card__content">
                <div className="event-card__header-row">
                  <span className={`event-card__pill-badge ${regClosed ? 'pill-badge--closed' : 'pill-badge--open'}`}>
                    {regClosed ? '🔴 Registration Closed' : '🟢 Open for Registration'}
                  </span>
                </div>
                
                <h3 className="event-card__title">{title || 'Untitled Event'}</h3>
                
                {description && (
                  <p className="event-card__excerpt">{description}</p>
                )}
                
                <div className="event-card__divider" />
                
                <div className="event-card__metadata-grid">
                  <div className="metadata-item">
                    <span className="metadata-icon">📅</span>
                    <div className="metadata-text">
                      <strong>Event Dates</strong>
                      <span>{formatDisplayDate(startDate) || 'TBD'}{endDate ? ` – ${formatDisplayDate(endDate)}` : ''}</span>
                    </div>
                  </div>
                  
                  {registrationEndDate && (
                    <div className="metadata-item">
                      <span className="metadata-icon">⏰</span>
                      <div className="metadata-text">
                        <strong>Registration Deadline</strong>
                        <span>{formatDisplayDate(registrationEndDate)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="metadata-item">
                    <span className="metadata-icon">🌐</span>
                    <div className="metadata-text">
                      <strong>Venue</strong>
                      <span>{venue || 'To Be Announced'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="event-card__actions">
                  <button type="button" className="btn btn--outline-navy" disabled>
                    View Details
                  </button>
                  {formLink && (
                    <button type="button" className={`btn ${regClosed ? 'btn--disabled' : 'btn--primary'}`} disabled>
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {(error || localError) && <p className="admin-error">{error || localError}</p>}
      
      {/* Event management table/list */}
      <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--navy)' }}>Managed Events</h3>
      {loading ? (
        <p className="admin-muted">Loading…</p>
      ) : (
        <ul className="admin-list">
          {rows.map((row) => {
            const closed = isRegistrationClosed(row.registration_end_date);
            return (
              <li
                key={row.id}
                className={`admin-list__item${row.enabled ? '' : ' admin-list__item--disabled'}`}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {row.image_url && (
                    <img src={row.image_url} alt="" className="admin-thumb admin-thumb--wide" />
                  )}
                  <div className="admin-list__title-row">
                    <strong>{row.title}</strong>
                    <span
                      className={`admin-status-badge${row.enabled ? ' admin-status-badge--live' : ' admin-status-badge--hidden'}`}
                    >
                      {row.enabled ? 'Published' : 'Disabled'}
                    </span>
                    <span className={`admin-status-badge ${closed ? 'status-badge--closed' : 'status-badge--open'}`} style={{ color: 'var(--white)', fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.5rem' }}>
                      {closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  <div className="admin-list__date-details">
                    <p className="admin-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                      <strong>Start:</strong> {formatDisplayDate(row.start_date || row.event_date)}
                      {' | '}
                      <strong>End:</strong> {formatDisplayDate(row.end_date) || '—'}
                      {' | '}
                      <strong>Registration Ends:</strong> {formatDisplayDate(row.registration_end_date) || '—'}
                    </p>
                    <p className="admin-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                      <strong>Venue:</strong> {formatEventVenue(row.venue)}
                      {row.form_link && (
                        <>
                          {' · '}
                          <a href={row.form_link} target="_blank" rel="noreferrer">
                            Form link
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => handleStartEdit(row)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--navy)' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`btn ${row.enabled ? 'btn--toggle-disable' : 'btn--toggle-enable'}`}
                    onClick={() => handleToggle(row.id, row.enabled)}
                  >
                    {row.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" className="btn btn--navy" onClick={() => handleDelete(row.id)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {previewPosterSrc && (
        <ImageViewer
          imageSrc={previewPosterSrc}
          alt={title || 'Event poster preview'}
          onClose={() => setPreviewPosterSrc(null)}
        />
      )}
    </div>
  );
}
