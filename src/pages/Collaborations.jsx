import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import SplitSection from '../components/SplitSection';
import { collaborationSections } from '../data/siteData';

export default function Collaborations() {
  return (
    <>
      <PageHero
        label="Partnerships"
        title="Institutional Collaboration & Services"
        subtitle="Strategic Partnerships for Institutional Excellence"
      />

      {collaborationSections.map((block, index) => (
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
        </SplitSection>
      ))}

      <section className="section">
        <Reveal className="container page-cta">
          <Link to="/contact" className="btn btn--navy">
            Propose a Collaboration
          </Link>
        </Reveal>
      </section>
    </>
  );
}
