import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicUpcomingEvents } from '../store/slices/publicEventsSlice';
import EmptyState from './EmptyState';
import Reveal from './motion/Reveal';
import './EventsTicker.css';

const EVENT_TAGS = ['Conferences', 'Symposia', 'Training'];

function EventCard({ event }) {
  return (
    <article className="event-ticker__card">
      <div className="event-ticker__date">
        <span className="event-ticker__year">{event.year}</span>
        <span className="event-ticker__day">{event.day}</span>
        <span className="event-ticker__month">{event.month}</span>
      </div>
      <div className="event-ticker__body">
        <h3>{event.title}</h3>
        <p className="event-ticker__meta">
          {event.dateLabel} · {event.venue}
        </p>
        {event.form_link && (
          <a
            href={event.form_link}
            className="event-ticker__link"
            target="_blank"
            rel="noreferrer"
          >
            Register →
          </a>
        )}
      </div>
    </article>
  );
}

export default function EventsTicker() {
  const dispatch = useDispatch();
  const { upcoming: events, loadingUpcoming: loading } = useSelector((state) => state.publicEvents);

  useEffect(() => {
    dispatch(fetchPublicUpcomingEvents());
  }, [dispatch]);

  const items = events.length ? [...events, ...events] : [];
  const nextEvent = events[0];

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
              <div className="events-ticker__fade events-ticker__fade--top" aria-hidden="true" />
              <div className="events-ticker__viewport">
                <div
                  className="events-ticker__track"
                  style={{ '--ticker-duration': `${Math.max(18, events.length * 6)}s` }}
                >
                  {items.map((event, index) => (
                    <EventCard key={`${event.id}-${index}`} event={event} />
                  ))}
                </div>
              </div>
              <div className="events-ticker__fade events-ticker__fade--bottom" aria-hidden="true" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
