import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  institute,
  coreServices,
  vision,
  missionPoints,
  homeWelcome,
  testimonialIntro,
} from '../data/siteData';
import AnnouncementStrip from '../components/AnnouncementStrip';
import IosBanners from '../components/IosBanners';
import EventsTicker from '../components/EventsTicker';
import TestimonialMarquee from '../components/TestimonialMarquee';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import './Home.css';

export default function Home() {
  return (
    <>
      <section className="hero">
        {/* Animated background elements */}
        <div className="hero__background">
          <div className="hero-shape hero-shape--1"></div>
          <div className="hero-shape hero-shape--2"></div>
          <div className="hero-shape hero-shape--3"></div>
          <div className="hero-glow hero-glow--1"></div>
          <div className="hero-glow hero-glow--2"></div>
        </div>
        <div className="container hero__grid">
          <motion.div
            className="hero__content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero__badge">Welcome to {institute.shortName}</span>
            <h1>{institute.name}</h1>
            <p className="hero__tagline">{institute.tagline}</p>
            <p className="hero__intro">{homeWelcome}</p>
            <div className="hero__actions">
              <Link to="/about" className="btn btn--primary">
                Discover LIAMS
              </Link>
              <Link to="/contact" className="btn btn--outline">
                Contact Us
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="/logos/liams-logo-full.png"
              alt={`${institute.shortName} — ${institute.name}`}
              className="hero__logo"
            />
          </motion.div>
        </div>
      </section>

      <AnnouncementStrip />
      <IosBanners />

      <section id="vision-mission" className="section">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Purpose</span>
            <h2>Vision & Mission</h2>
          </Reveal>
          <StaggerGrid className="vision-mission grid grid--2">
            <article className="intro-card">
              <h3>Vision</h3>
              <p>{vision}</p>
            </article>
            <article className="intro-card intro-card--gold">
              <h3>Mission</h3>
              <ul className="mission-list">
                {missionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </StaggerGrid>
        </div>
      </section>

      <section id="what-we-offer" className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Core Services</span>
            <h2>What do we offer?</h2>
          </Reveal>
          <StaggerGrid className="grid grid--3 home-article-grid">
            {coreServices.map(({ title, description, path, icon }) => (
              <article key={title} className="card article-card">
                <div className="card__icon" aria-hidden="true">
                  {icon}
                </div>
                <h3>{title}</h3>
                <p className="article-card__text">{description}</p>
                <Link to={path} className="card__link">
                  Learn more →
                </Link>
              </article>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <div id="upcoming-events">
        <EventsTicker />
      </div>

      <div id="testimonials">
        <TestimonialMarquee subtitle={testimonialIntro} />
      </div>

      <section className="credentials-section">
        <div className="container">
          <Reveal className="credentials-header">
            <h2>Certified & Recognized</h2>
          </Reveal>
          <div className="credentials-grid">
            <div className="credential-badge">
              <div className="credential-badge__icon">✓</div>
              <p className="credential-badge__text">ISO 9001:2015</p>
            </div>
            <div className="credential-badge">
              <div className="credential-badge__icon">✓</div>
              <p className="credential-badge__text">ISO 21001:2018</p>
            </div>
            <div className="credential-badge">
              <div className="credential-badge__icon">✓</div>
              <p className="credential-badge__text">Registered under MSME, Government of India</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <Reveal className="container cta-banner__inner">
          <h2>You can reach us through...</h2>
          <p>
            Partnerships, training, research support, publications, events, and general enquiries —
            our team is ready to assist you.
          </p>
          <Link to="/contact" className="btn btn--primary">
            Contact Us
          </Link>
        </Reveal>
      </section>
    </>
  );
}
