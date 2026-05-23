import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUpcomingEvents,
  addUpcomingEvent,
  toggleUpcomingEvent,
  deleteUpcomingEvent,
} from '../../store/slices/adminEventsSlice';
import { formatEventDateLabel } from '../../lib/eventFormat';
import { DEFAULT_EVENT_VENUE, formatEventVenue } from '../../lib/eventVenue';
import { uploadEventImage } from '../../lib/storage';
import './Admin.css';

export default function UpcomingEvents() {
  const dispatch = useDispatch();
  const { upcoming: rows, loadingUpcoming: loading, error } = useSelector((state) => state.adminEvents);
  
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [formLink, setFormLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchUpcomingEvents());
  }, [dispatch]);

  async function handleAdd(e) {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile);
      }
      
      const result = await dispatch(addUpcomingEvent({
        title: title.trim(),
        event_date: eventDate || null,
        venue: venue.trim() || null,
        form_link: formLink.trim() || null,
        image_url: imageUrl,
      }));
      
      if (result.error) {
        setLocalError(result.payload || 'Failed to add event');
        return;
      }
      
      setTitle('');
      setEventDate('');
      setVenue('');
      setFormLink('');
      setImageFile(null);
    } catch (err) {
      setLocalError(err.message || 'Upload failed');
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

  return (
    <div className="admin-card">
      <h2>Upcoming events</h2>
      <form className="admin-form" onSubmit={handleAdd}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Event date
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
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
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add event'}
        </button>
      </form>
      {(error || localError) && <p className="admin-error">{error || localError}</p>}
      {loading ? (
        <p className="admin-muted">Loading…</p>
      ) : (
        <ul className="admin-list">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`admin-list__item${row.enabled ? '' : ' admin-list__item--disabled'}`}
            >
              <div>
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
                </div>
                <p className="admin-muted">
                  {formatEventDateLabel(row.event_date)}
                  {' · '}
                  {formatEventVenue(row.venue)}
                  {row.form_link && (
                    <>
                      {' '}
                      ·{' '}
                      <a href={row.form_link} target="_blank" rel="noreferrer">
                        Form link
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="admin-actions">
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
          ))}
        </ul>
      )}
    </div>
  );
}
