import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import SplitSection from '../components/SplitSection';
import { researchTagline, researchSections } from '../data/siteData';

export default function Research() {
  return (
    <>
      <PageHero
        label="Research & Publications"
        title="Research & Publications"
        subtitle={researchTagline}
      />

      {researchSections.map((block, index) => (
        <SplitSection
          key={block.id}
          id={block.id}
          title={block.title}
          image={block.image}
          imageAlt={block.title}
          reverse={index % 2 === 1}
          sectionClass={index % 2 === 0 ? '' : 'section--alt'}
        >
          <p>{block.text}</p>
          {block.bullets && (
            <ul>
              {block.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </SplitSection>
      ))}

      <section className="section section--alt">
        <Reveal className="container page-cta">
          <Link to="/contact" className="btn btn--navy">
            Request Research Support
          </Link>
        </Reveal>
      </section>
    </>
  );
}
