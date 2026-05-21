import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import SplitSection from '../components/SplitSection';
import { trainingIntro, trainingSections } from '../data/siteData';

export default function Training() {
  return (
    <>
      <PageHero
        label="Training & Development"
        title="Training & Development"
        subtitle="Upskilling the Next Generation of Academicians and Professionals"
      />

      <section id="introduction" className="section">
        <Reveal className="container content-block">
          <h2>Introduction</h2>
          <p>{trainingIntro}</p>
        </Reveal>
      </section>

      {trainingSections.map((block, index) => (
        <SplitSection
          key={block.id}
          id={block.id}
          title={block.title}
          image={block.image}
          imageAlt={block.title}
          reverse={index % 2 === 1}
          sectionClass={index % 2 === 0 ? 'section--alt' : ''}
        >
          <p>{block.text}</p>
        </SplitSection>
      ))}

      <section className="section section--alt">
        <Reveal className="container page-cta">
          <Link to="/contact" className="btn btn--navy">
            Enquire About Training
          </Link>
        </Reveal>
      </section>
    </>
  );
}
