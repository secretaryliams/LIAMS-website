import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnnouncements,
  addAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from '../../store/slices/adminAnnouncementsSlice';
import './Admin.css';

export default function Announcements() {
  const dispatch = useDispatch();
  const { items: rows, loading, error } = useSelector((state) => state.adminAnnouncements);
  const [text, setText] = useState('');

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const result = await dispatch(addAnnouncement(text));
    if (!result.error) {
      setText('');
    }
  }

  function handleToggle(id, enabled) {
    dispatch(toggleAnnouncement({ id, enabled }));
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return;
    dispatch(deleteAnnouncement(id));
  }

  return (
    <div className="admin-card">
      <h2>Announcements</h2>
      <form className="admin-form" onSubmit={handleAdd}>
        <label>
          New announcement
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            required
            placeholder="Text shown on the homepage ticker"
          />
        </label>
        <button type="submit" className="btn btn--primary">
          Add
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
              <span>{row.text}</span>
              <div className="admin-actions">
                <button
                  type="button"
                  className="btn btn--outline"
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
