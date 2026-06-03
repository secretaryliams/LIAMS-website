import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicUpcomingEvents } from '../store/slices/publicEventsSlice';
import EmptyState from './EmptyState';
import Reveal from './motion/Reveal';
import { isRegistrationClosed, formatEventDateParts } from '../lib/eventFormat';
import EventDetailsModal from './EventDetailsModal';
import ImageViewer from './ImageViewer';
import './EventsTicker.css';

const EVENT_TAGS = ['Conferences', 'Symposia', 'Training'];

function EventCard({ event, onClick }) {
  const regClosed = isRegistrationClosed(event.registration_end_date);
  const dateParts = formatEventDateParts(event.start_date || event.event_date);
  const monthStr = dateParts.month ? dateParts.month.substring(0, 3).toUpperCase() : '';
  
  return (
    <article className="event-ticker__card">
      <div className="event-ticker__date">
        <span className="event-ticker__month">{monthStr}</span>
        <span className="event-ticker__day">{dateParts.day}</span>
        <span className="event-ticker__year">{dateParts.year}</span>
      </div>
      <div className="event-ticker__body">
        <div className="event-ticker__header-row">
          <span className={`ticker-status-badge ${regClosed ? 'ticker-status-badge--closed' : 'ticker-status-badge--open'}`}>
            {regClosed ? 'Closed' : 'Open'}
          </span>
        </div>
        <h3 className="event-ticker__title" title={event.title}>{event.title}</h3>
        <p className="event-ticker__meta">
          <span>📍 {event.venue || 'TBA'}</span>
        </p>
        
        <div className="event-ticker__actions">
          <button type="button" className="event-ticker__link-btn" onClick={onClick}>
            Details →
          </button>
          {event.form_link && (
            <a
              href={regClosed ? undefined : event.form_link}
              className={`event-ticker__link ${regClosed ? 'event-ticker__link--disabled' : ''}`}
              target="_blank"
              rel="noreferrer"
            >
              {regClosed ? 'Closed' : 'Register →'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function EventsTicker() {
  const dispatch = useDispatch();
  const { upcoming: events, loadingUpcoming: loading } = useSelector((state) => state.publicEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [posterEvent, setPosterEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicUpcomingEvents());
  }, [dispatch]);

  // Duplicate the list to create a seamless infinite marquee loop
  const items = events.length ? [...events, ...events] : [];
  const nextEvent = events[0];

  // Calculate scrolling duration to increase speed by ~70% compared to previous implementation
  const tickerDuration = `${Math.max(7, events.length * 5.3)}s`;

  return (
    <section className="events-ticker-section section--alt">
      <div className="container events-ticker-section__layout">
        <Reveal className="events-ticker-section__intro">
          <div className="events-ticker-section__intro-top">
            <span className="section__label">Upcoming</span>
            <h2>Events</h2>
            <p className="events-ticker-section__lead">
              Stay updated with conferences and programmes at LIAMS.
            </p>
            <ul className="events-ticker-section__tags" aria-label="Event types">
              {EVENT_TAGS.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>

          {!loading && events.length > 0 && (
            <div className="events-ticker-section__spotlight">
              <span className="events-ticker-section__spotlight-label">Next up</span>
              <p className="events-ticker-section__spotlight-title">{nextEvent.title}</p>
              <p className="events-ticker-section__spotlight-meta">{nextEvent.dateLabel}</p>
              <span className="events-ticker-section__count">
                {events.length} scheduled
              </span>
            </div>
          )}

          {!loading && events.length === 0 && (
            <p className="events-ticker-section__empty-note">
              No events listed yet. Visit the Events page for updates.
            </p>
          )}

          <Link to="/events" className="btn btn--secondary events-ticker-section__cta">
            View All Events
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="events-ticker-section__panel">
          {loading ? (
            <p className="events-ticker__status">Loading events…</p>
          ) : events.length === 0 ? (
            <div className="events-ticker events-ticker--empty">
              <EmptyState message="No upcoming events" />
              <Link to="/events" className="btn btn--primary events-ticker__empty-cta">
                Go to Events
              </Link>
            </div>
          ) : (
            <div className="events-ticker" aria-label="Upcoming events scrolling list">
              <div className="events-ticker__viewport">
                <div className="events-ticker__fade events-ticker__fade--top" aria-hidden="true" />
                <div
                  className="events-ticker__track"
                  style={{ '--ticker-duration': tickerDuration }}
                >
                  {items.map((event, index) => (
                    <EventCard 
                      key={`${event.id}-${index}`} 
                      event={event} 
                      onClick={() => setSelectedEvent(event)} 
                    />
                  ))}
                </div>
                <div className="events-ticker__fade events-ticker__fade--bottom" aria-hidden="true" />
              </div>
            </div>
          )}
        </Reveal>
      </div>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {posterEvent && (
        <ImageViewer
          imageSrc={posterEvent.image_url}
          alt={posterEvent.title}
          onClose={() => setPosterEvent(null)}
        />
      )}
    </section>
  );
}
