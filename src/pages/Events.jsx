import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageHero from '../components/PageHero';
import PreviousEventsGallery from '../components/PreviousEventsGallery';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicUpcomingEvents } from '../store/slices/publicEventsSlice';
import { eventsExpertise, eventsPartnerText } from '../data/siteData';
import { formatDisplayDate, isRegistrationClosed } from '../lib/eventFormat';
import EventDetailsModal from '../components/EventDetailsModal';
import ImageViewer from '../components/ImageViewer';
import './Events.css';

export default function Events() {
  const dispatch = useDispatch();
  const { upcoming: events, loadingUpcoming: loading } = useSelector((state) => state.publicEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [posterEvent, setPosterEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicUpcomingEvents());
  }, [dispatch]);

  return (
    <>
      <PageHero
        label="Events"
        title="Conferences & Events"
        subtitle="Global Platforms for Knowledge Sharing and Networking"
      />

      <section id="upcoming-events" className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Upcoming</span>
            <h2>Upcoming Events</h2>
          </Reveal>
          {loading ? (
            <p className="events-gallery__empty">Loading events…</p>
          ) : events.length === 0 ? (
            <EmptyState message="No upcoming events" />
          ) : (
            <StaggerGrid className="events-list">
              {events.map((event) => {
                const regClosed = isRegistrationClosed(event.registration_end_date);
                return (
                  <article
                    key={event.id}
                    className="card event-card"
                  >
                    {event.image_url && (
                      <div
                        className="event-card__image-container"
                        style={{ cursor: 'zoom-in' }}
                        onClick={() => setPosterEvent(event)}
                        role="button"
                        aria-label={`View full poster for ${event.title}`}
                      >
                        <img src={event.image_url} alt={event.title} className="event-card__image" />
                      </div>
                    )}
                    <div className="event-card__content">
                      <div className="event-card__header-row">
                        <span className={`event-card__pill-badge ${regClosed ? 'pill-badge--closed' : 'pill-badge--open'}`}>
                          {regClosed ? '🔴 Registration Closed' : '🟢 Open for Registration'}
                        </span>
                      </div>
                      
                      <h3 className="event-card__title">{event.title}</h3>
                      
                      {event.description && (
                        <p className="event-card__excerpt">{event.description}</p>
                      )}
                      
                      <div className="event-card__divider" />
                      
                      <div className="event-card__metadata-grid">
                        <div className="metadata-item">
                          <span className="metadata-icon">📅</span>
                          <div className="metadata-text">
                            <strong>Event Dates</strong>
                            <span>{formatDisplayDate(event.start_date || event.event_date)}{event.end_date ? ` – ${formatDisplayDate(event.end_date)}` : ''}</span>
                          </div>
                        </div>
                        
                        {event.registration_end_date && (
                          <div className="metadata-item">
                            <span className="metadata-icon">⏰</span>
                            <div className="metadata-text">
                              <strong>Registration Deadline</strong>
                              <span>{formatDisplayDate(event.registration_end_date)}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="metadata-item">
                          <span className="metadata-icon">🌐</span>
                          <div className="metadata-text">
                            <strong>Venue</strong>
                            <span>{event.venue || 'To Be Announced'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="event-card__actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="btn btn--outline-navy" onClick={() => setSelectedEvent(event)}>
                          View Details
                        </button>
                        {event.form_link && (
                          <a
                            href={regClosed ? undefined : event.form_link}
                            target="_blank"
                            rel="noreferrer"
                            className={`btn ${regClosed ? 'btn--disabled' : 'btn--primary'}`}
                            aria-disabled={regClosed}
                          >
                            Register Now
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </StaggerGrid>
          )}
        </div>
      </section>

      <section id="previous-events" className="section">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Gallery</span>
            <h2>Gallery & Previous Events</h2>
          </Reveal>
          <PreviousEventsGallery />
        </div>
      </section>

      <section id="our-expertise" className="section section--alt">
        <Reveal className="container content-block">
          <span className="section__label">Our Expertise</span>
          <h2>Our Expertise</h2>
          <p>{eventsExpertise}</p>
        </Reveal>
      </section>

      <section id="partner-events" className="section">
        <Reveal className="container content-block">
          <h2>Partner with us for your next Event</h2>
          <p>{eventsPartnerText}</p>
          <p className="page-cta">
            <Link to="/contact" className="btn btn--navy">
              Contact Us
            </Link>
          </p>
        </Reveal>
      </section>

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
    </>
  );
}
