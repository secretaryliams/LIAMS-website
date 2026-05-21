import Reveal from './motion/Reveal';
import './SplitSection.css';

export default function SplitSection({
  id,
  title,
  children,
  image,
  imageAlt = '',
  reverse = false,
  sectionClass = '',
}) {
  return (
    <section
      id={id}
      className={`split-section section ${sectionClass} ${reverse ? 'split-section--reverse' : ''}`.trim()}
    >
      <div className="container split-section__grid">
        <Reveal className="split-section__content">
          {title && <h2>{title}</h2>}
          <div className="split-section__body">{children}</div>
        </Reveal>
        <Reveal delay={0.06} className="split-section__media">
          {image ? (
            <img src={image} alt={imageAlt || title || ''} loading="lazy" decoding="async" />
          ) : (
            <div className="split-section__placeholder" aria-hidden="true">
              <span>Image coming soon</span>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
