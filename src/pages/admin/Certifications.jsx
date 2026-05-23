import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import {
  fetchCertifications,
  addCertification,
  deleteCertification,
} from '../../store/slices/adminCertificationsSlice';
import {
  DEFAULT_CERTIFICATIONS_SECTION_TITLE,
} from '../../lib/siteSettingsKeys';
import {
  saveCertificationsSectionTitle,
  useCertificationsSectionTitle,
} from '../../hooks/useSiteSettings';
import AnimatedListItem from '../../components/motion/AnimatedListItem';
import Reveal from '../../components/motion/Reveal';
import './Admin.css';

export default function Certifications() {
  const dispatch = useDispatch();
  const { items: rows, loading, error } = useSelector((state) => state.adminCertifications);

  const { sectionTitle, refresh: refreshTitle } = useCertificationsSectionTitle();
  const [sectionTitleInput, setSectionTitleInput] = useState('');
  const [title, setTitle] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [localError, setLocalError] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    dispatch(fetchCertifications());
  }, [dispatch]);

  useEffect(() => {
    setSectionTitleInput(sectionTitle);
  }, [sectionTitle]);

  async function handleSaveSectionTitle(e) {
    e.preventDefault();
    setSettingsMsg('');
    setSavingTitle(true);
    try {
      await saveCertificationsSectionTitle(sectionTitleInput);
      await refreshTitle();
      setSettingsMsg('Section title updated on the public website.');
    } catch (err) {
      setSettingsMsg(err.message || 'Failed to save section title.');
    } finally {
      setSavingTitle(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setLocalError('');
    const result = await dispatch(addCertification({
      title: title.trim(),
      drive_link: driveLink.trim() || null,
    }));
    
    if (result.error) {
      setLocalError(result.payload || 'Failed to add certification');
      return;
    }
    setTitle('');
    setDriveLink('');
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this certification entry?')) return;
    dispatch(deleteCertification(id));
  }

  return (
    <div className="admin-stack">
      <Reveal className="admin-card admin-card--settings">
        <h2>Public section settings</h2>
        <p className="admin-muted">
          Rename the credentials section on the Events page for any use case — Certifications,
          Achievements, Accreditations, Industry Credentials, and more.
        </p>
        <form className="admin-form admin-form--inline" onSubmit={handleSaveSectionTitle}>
          <label>
            Section title (Events page heading)
            <input
              value={sectionTitleInput}
              onChange={(e) => setSectionTitleInput(e.target.value)}
              placeholder={DEFAULT_CERTIFICATIONS_SECTION_TITLE}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={savingTitle}>
            {savingTitle ? 'Saving…' : 'Save section title'}
          </button>
        </form>
        {settingsMsg && (
          <p className={settingsMsg.includes('updated') ? 'admin-success' : 'admin-error'}>
            {settingsMsg}
          </p>
        )}
      </Reveal>

      <Reveal delay={0.05} className="admin-card">
        <h2>Certificate entries</h2>
        <p className="admin-muted" style={{ marginBottom: '1rem' }}>
          Items listed under <strong>{sectionTitle}</strong> at the bottom of the Events page.
          Add a Google Drive
          link when available.
        </p>
        <form className="admin-form" onSubmit={handleAdd}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Google Drive link
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </label>
          <button type="submit" className="btn btn--primary">
            Add
          </button>
        </form>
        {(error || localError) && <p className="admin-error">{error || localError}</p>}
        {loading ? (
          <p className="admin-muted">Loading…</p>
        ) : (
          <ul className="admin-list">
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <AnimatedListItem key={row.id} className="admin-list__item">
                  <div>
                    <strong>{row.title}</strong>
                    {row.drive_link && (
                      <p>
                        <a href={row.drive_link} target="_blank" rel="noreferrer">
                          {row.drive_link}
                        </a>
                      </p>
                    )}
                  </div>
                  <button type="button" className="btn btn--navy" onClick={() => handleDelete(row.id)}>
                    Delete
                  </button>
                </AnimatedListItem>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Reveal>
    </div>
  );
}
