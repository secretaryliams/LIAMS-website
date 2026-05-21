import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { institute, coreServices, vision, mission } from '../data/siteData';
import AnnouncementStrip from '../components/AnnouncementStrip';
import CertificatesFloatingButton from '../components/CertificatesFloatingButton';
import EventsTicker from '../components/EventsTicker';
import TestimonialMarquee from '../components/TestimonialMarquee';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import './Home.css';

export default function Home() {
  return (
    <>
      <section className="hero">
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
            <p className="hero__intro">
              Welcome to the Loyola Institute of Advanced Multidisciplinary Studies. We are a dynamic
              academic and research ecosystem designed to bridge the gap between academia and industry.
              By integrating modern technological trends with rigorous academic frameworks, we provide
              comprehensive support for students, scholars, and academicians globally.
            </p>
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

      <section className="section">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Purpose</span>
            <h2>Vision & Mission</h2>
          </Reveal>
          <StaggerGrid className="vision-mission grid grid--2">
            <article className="intro-card">
              <h3>Our Vision</h3>
              <p>{vision}</p>
            </article>
            <article className="intro-card intro-card--gold">
              <h3>Our Mission</h3>
              <p>{mission}</p>
            </article>
          </StaggerGrid>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Core Services</span>
            <h2>What We Offer</h2>
            <p>
              Comprehensive academic and institutional services across training, research,
              events, and collaborations.
            </p>
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

      <EventsTicker />

      <TestimonialMarquee />

      <section className="cta-banner">
        <Reveal className="container cta-banner__inner">
          <h2>Partner With LIAMS</h2>
          <p>
            Explore collaborations, training programmes, and research support tailored to your
            institution.
          </p>
          <Link to="/contact" className="btn btn--primary">
            Start a Conversation
          </Link>
        </Reveal>
      </section>

      <CertificatesFloatingButton />
    </>
  );
}
