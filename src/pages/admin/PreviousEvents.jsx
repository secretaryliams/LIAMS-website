import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPreviousEvents,
  addPreviousEvent,
  deletePreviousEvent,
} from '../../store/slices/adminEventsSlice';
import { uploadEventImage } from '../../lib/storage';
import './Admin.css';

export default function PreviousEvents() {
  const dispatch = useDispatch();
  const { previous: rows, loadingPrevious: loading, error } = useSelector((state) => state.adminEvents);

  const [category, setCategory] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchPreviousEvents());
  }, [dispatch]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!file) {
      setLocalError('Choose an image to upload.');
      return;
    }
    setLocalError('');
    setUploading(true);
    try {
      const imageUrl = await uploadEventImage(file);
      const result = await dispatch(addPreviousEvent({
        image_url: imageUrl,
        category: category.trim() || null,
        caption: caption.trim() || null,
      }));
      
      if (result.error) throw new Error(result.payload || 'Failed to add event');
      
      setCategory('');
      setCaption('');
      setFile(null);
    } catch (err) {
      setLocalError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this gallery item?')) return;
    dispatch(deletePreviousEvent(id));
  }

  return (
    <div className="admin-card">
      <h2>Previous events gallery</h2>
      <form className="admin-form" onSubmit={handleAdd}>
        <label>
          Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>
        <label>
          Category
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Conference, Workshop, …"
          />
        </label>
        <label>
          Caption
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {(error || localError) && <p className="admin-error">{error || localError}</p>}
      {loading ? (
        <p className="admin-muted">Loading…</p>
      ) : (
        <ul className="admin-list">
          {rows.map((row) => (
            <li key={row.id} className="admin-list__item">
              {row.image_url && (
                <img src={row.image_url} alt="" className="admin-thumb" />
              )}
              <div>
                {row.category && <strong>{row.category}</strong>}
                {row.caption && <p className="admin-muted">{row.caption}</p>}
              </div>
              <button type="button" className="btn btn--navy" onClick={() => handleDelete(row.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
