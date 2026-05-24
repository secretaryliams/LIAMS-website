import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageHero from '../components/PageHero';
import PreviousEventsGallery from '../components/PreviousEventsGallery';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicUpcomingEvents } from '../store/slices/publicEventsSlice';
import { eventsExpertise, eventsPartnerText } from '../data/siteData';
import './Events.css';

export default function Events() {
  const dispatch = useDispatch();
  const { upcoming: events, loadingUpcoming: loading } = useSelector((state) => state.publicEvents);

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
              {events.map((event) => (
                <article key={event.id} className="card event-card">
                  {event.image_url && (
                    <img src={event.image_url} alt="" className="event-card__image" />
                  )}
                  <span className="event-card__status">Upcoming</span>
                  <h3>{event.title}</h3>
                  <p>
                    <strong>Date:</strong> {event.dateLabel} &nbsp;|&nbsp;{' '}
                    <strong>Venue:</strong> {event.venue}
                  </p>
                  {event.form_link && (
                    <p>
                      <a
                        href={event.form_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--secondary"
                        style={{ marginTop: '0.75rem', display: 'inline-block' }}
                      >
                        Register / Submit
                      </a>
                    </p>
                  )}
                </article>
              ))}
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
    </>
  );
}
