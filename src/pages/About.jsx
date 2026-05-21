import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import { objectives, leadership, advisoryBoard } from '../data/siteData';
import './About.css';

export default function About() {
  return (
    <>
      <PageHero
        label="About Us"
        title="About LIAMS"
        subtitle="Pioneering the Future of Multidisciplinary Education and Research"
      />

      <section className="section">
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

      <section className="section">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Objectives</span>
            <h2>Core Objectives</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <ul className="objectives-list">
              {objectives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Leadership</span>
            <h2>Academic Leadership</h2>
          </Reveal>
          <StaggerGrid className="grid grid--3">
            {leadership.map(({ name, role, note }) => (
              <article key={name} className="card leader-card">
                <div className="leader-card__avatar" aria-hidden="true">
                  {name.charAt(0)}
                </div>
                <h3>{name}</h3>
                <p className="leader-card__role">{role}</p>
                <p>{note}</p>
              </article>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Message</span>
            <h2>Director&apos;s Message</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="director-message card">
              <p>
                Welcome to the Loyola Institute of Advanced Multidisciplinary Studies.
                In today’s rapidly evolving global landscape, the most profound breakthroughs
                and sustainable solutions occur at the intersection of diverse disciplines.
                As we navigate an era defined by rapid technological advancements—from Artificial
                Intelligence and Machine Learning to smart infrastructures and advanced analytics—
                it is no longer sufficient to operate within traditional academic silos.
              </p>
              <p>
                At the Loyola Institute, our founding philosophy is rooted in multidisciplinary
                synergy. We have established this institution to serve as a dynamic nexus where
                engineering, arts, science, and management converge. Our goal is not just to impart
                knowledge, but to actively bridge the gap between academic research and real-world
                industrial applications.
              </p>
              <p>
                As ISO 9001:2015 and 21001:2018-certified and MSME-registered institutions, we are
                deeply committed to maintaining the highest standards of quality in everything we do.
                Whether it is providing rigorous, industry-oriented internships for students,
                organizing high-impact Faculty Development Programs for educators, or offering
                end-to-end PhD and publication support for dedicated research scholars, our ecosystem
                is designed to empower your academic and professional journey.
              </p>
              <p>
                We take immense pride in our state-of-the-art Research and Innovation Lab and our
                robust global network. Through our national and international conferences, MoUs,
                and collaborative knowledge-sharing initiatives, we aim to elevate institutional
                standards and foster a rich culture of intellectual property creation and scholarly
                excellence across SCI, SCOPUS, and Web of Science platforms.
              </p>
              <p>
                Whether you are a student looking to upskill, a researcher striving for publication
                excellence, or an institution seeking strategic collaboration and accreditation
                support, you will find a dedicated partner in us.
              </p>
              <footer className="director-message__sign">
                <strong>Dr. T. Lurthu Pushparaj, B.Sc., M.Sc., Ph.D.</strong>
                <span>Director, Loyola Institute of Advanced Multidisciplinary Studies</span>
              </footer>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal className="section__header">
            <span className="section__label">Governance</span>
            <h2>Advisory Board</h2>
            <p>Distinguished experts guiding institutional strategy and academic quality.</p>
          </Reveal>
          <StaggerGrid className="grid grid--2 board-cards-grid">
            {advisoryBoard.map(({ name, designation, field }) => (
              <article key={name} className="card board-card">
                <h3>{name}</h3>
                <p className="board-card__designation">{designation}</p>
                <p className="board-card__field">{field}</p>
              </article>
            ))}
          </StaggerGrid>
        </div>
      </section>
    </>
  );
}
