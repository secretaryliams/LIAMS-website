import { useCallback, useEffect, useState } from 'react';
import { formatEventDateLabel } from '../../lib/eventFormat';
import { DEFAULT_EVENT_VENUE, formatEventVenue } from '../../lib/eventVenue';
import { supabase } from '../../lib/supabase';
import './Admin.css';

export default function UpcomingEvents() {
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [formLink, setFormLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('upcoming_events')
      .select('*')
      .order('event_date', { ascending: true, nullsFirst: false });
    if (err) setError(err.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    const { error: err } = await supabase.from('upcoming_events').insert({
      title: title.trim(),
      event_date: eventDate || null,
      venue: venue.trim() || null,
      form_link: formLink.trim() || null,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setTitle('');
    setEventDate('');
    setVenue('');
    setFormLink('');
    load();
  }

  async function handleToggle(id, enabled) {
    await supabase.from('upcoming_events').update({ enabled: !enabled }).eq('id', id);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    await supabase.from('upcoming_events').delete().eq('id', id);
    load();
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
        <button type="submit" className="btn btn--primary">
          Add event
        </button>
      </form>
      {error && <p className="admin-error">{error}</p>}
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
