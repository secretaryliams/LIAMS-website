import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import {
  objectivesIntro,
  objectivesSections,
  ourStory,
  leadershipParagraph,
  directorPhoto,
  advisoryBoard,
} from '../data/siteData';
import './About.css';

export default function About() {
  return (
    <>
      <PageHero
        label="About Us"
        title="About LIAMS"
        subtitle="Pioneering the Future of Multidisciplinary Education and Research"
      />

      <section id="who-we-are" className="section">
        <div className="container about-split">
          <Reveal>
            <span className="section__label">Institute</span>
            <h2>Who We Are</h2>
            <p className="lead">
              Loyola Institute of Research and Development is an MSME-registered institution dedicated
              to advancing engineering, science, and management studies. Guided by rigorous
              ISO 9001:2015 and 21001:2018 quality standards, we operate as a catalyst for educational
              excellence and applied research.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="about-symbol">
            <img src="/logos/liams-logo-symbol.png" alt="" aria-hidden="true" />
          </Reveal>
        </div>
      </section>

      <section id="core-objectives" className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Objectives</span>
            <h2>Core Objectives</h2>
            <p>{objectivesIntro}</p>
          </Reveal>
          <div className="objectives-sections">
            {objectivesSections.map((section) => (
              <Reveal key={section.title} className="objectives-block card">
                <h3>{section.title}</h3>
                <ul className="objectives-block__list">
                  {section.items.map(({ label, text }) => (
                    <li key={label}>
                      <strong>{label}:</strong> {text}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="our-story" className="section">
        <Reveal className="container content-block">
          <span className="section__label">Institute</span>
          <h2>Our Story</h2>
          <p>{ourStory}</p>
        </Reveal>
      </section>

      <section id="academic-leadership" className="section section--alt">
        <Reveal className="container content-block">
          <span className="section__label">Leadership</span>
          <h2>Academic Leadership</h2>
          <p>{leadershipParagraph}</p>
        </Reveal>
      </section>

      <section id="directors-message" className="section">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Message</span>
            <h2>Director&apos;s Message</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="director-message card">
              <p>Welcome to the Loyola Institute of Advanced Multidisciplinary Studies.</p>
              <p>
                In today&apos;s rapidly evolving global landscape, the most profound breakthroughs
                and sustainable solutions occur at the intersection of diverse disciplines. As we
                navigate an era defined by rapid technological advancements—from Artificial
                Intelligence and Machine Learning to smart infrastructures and advanced
                analytics—it is no longer sufficient to operate within traditional academic silos.
              </p>
              <p>
                At the Loyola Institute, our founding philosophy is rooted in this multidisciplinary
                synergy. We have established this institution to serve as a dynamic nexus where
                engineering, arts, science, and management converge. Our goal is not just to impart
                knowledge, but to actively bridge the gap between academic research and real-world
                industrial applications.
              </p>
              <p>
                As ISO 9001:2015 and 21001:2018-certified and MSME-registered institutions, we are
                deeply committed to maintaining the highest standards of quality in everything we do.
                Whether it is providing rigorous, industry-oriented internships for students,
                organizing high-impact Faculty Development Programs (FDPs) for educators, or offering
                end-to-end PhD and publication support for dedicated research scholars, our ecosystem
                is designed to empower your academic and professional journey.
              </p>
              <p>
                We take immense pride in our state-of-the-art Research and Innovation Lab and our
                robust global network. Through our national and international conferences, MoUs,
                and collaborative knowledge-sharing initiatives, we aim to elevate institutional
                standards and foster a rich culture of intellectual property creation and scholarly
                excellence (across SCI, SCOPUS, and Web of Science platforms).
              </p>
              <p>
                Whether you are a student looking to upskill, a researcher striving for publication
                excellence, or an institution seeking strategic collaboration and accreditation
                support, you will find a dedicated partner in us.
              </p>
              <p>
                Together, let us push the boundaries of conventional research, embrace innovation,
                and build a brighter, knowledge-driven future.
              </p>
              <p className="director-message__warm">Warm regards,</p>
              <footer className="director-message__sign">
                <img
                  src={directorPhoto}
                  alt="Dr. T. Lurthu Pushparaj"
                  className="director-message__photo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <strong>Dr. T. Lurthu Pushparaj, B.Sc., M.Sc., Ph.D.</strong>
                  <span>Director</span>
                  <span>Loyola Institute of Advanced Multidisciplinary Studies</span>
                </div>
              </footer>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="advisory-board" className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Governance</span>
            <h2>Advisory Board</h2>
          </Reveal>
          <StaggerGrid className="grid grid--2 board-cards-grid">
            {advisoryBoard.map(({ name, designation, field, photo }) => (
              <article key={name} className="card board-card board-card--with-photo">
                {photo && (
                  <div className="board-card__photo">
                    <img src={photo} alt={name} loading="lazy" />
                  </div>
                )}
                <div className="board-card__body">
                  <h3>{name}</h3>
                  <p className="board-card__designation">{designation}</p>
                  {field && <p className="board-card__field">{field}</p>}
                </div>
              </article>
            ))}
          </StaggerGrid>
        </div>
      </section>
    </>
  );
}
