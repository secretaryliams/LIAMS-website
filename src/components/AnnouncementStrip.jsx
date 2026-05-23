import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicAnnouncements } from '../store/slices/publicAnnouncementsSlice';
import './AnnouncementStrip.css';

function buildMarqueeSequence(items) {
  let sequence = [...items];
  while (sequence.length < 4) {
    sequence = [...sequence, ...items];
  }
  return sequence;
}

export default function AnnouncementStrip() {
  const dispatch = useDispatch();
  const { items: announcements, loading } = useSelector((state) => state.publicAnnouncements);
  
  useEffect(() => {
    dispatch(fetchPublicAnnouncements());
  }, [dispatch]);

  const sequence = useMemo(
    () => (announcements.length ? buildMarqueeSequence(announcements) : []),
    [announcements],
  );
  const loop = useMemo(() => [...sequence, ...sequence], [sequence]);

  if (loading) {
    return (
      <section className="announcement-strip" aria-busy="true" aria-label="Announcements">
        <div className="announcement-strip__inner">
          <span className="announcement-strip__label">Announcements</span>
          <p className="announcement-strip__message">Loading announcements…</p>
        </div>
      </section>
    );
  }

  if (!announcements.length) {
    return (
      <section className="announcement-strip" aria-label="Announcements">
        <div className="announcement-strip__inner">
          <span className="announcement-strip__label">Announcements</span>
          <p className="announcement-strip__message">No announcements available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="announcement-strip" aria-label="Latest announcements">
      <div className="announcement-strip__inner">
        <span className="announcement-strip__label">Announcements</span>
        <div className="announcement-strip__viewport">
          <div className="announcement-strip__track" aria-hidden="true">
            {loop.map((text, index) => (
              <span key={`${text}-${index}`} className="announcement-strip__item">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
