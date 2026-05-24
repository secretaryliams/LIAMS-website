import { useEffect, useState, useRef } from 'react';
import './AchievementsStats.css';

// Reusable CountUp component with IntersectionObserver
function CountUp({ end, duration = 1500, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime = null;
          const startValue = 0;

          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * (end - startValue) + startValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(elementRef.current);
      }
    };
  }, [end, duration]);

  return <span ref={elementRef}>{count}{suffix}</span>;
}

export default function AchievementsStats() {
  return (
    <section className="stats-section section">
      <div className="container">
        <div className="section__header">
          <span className="section__label">LIAMS Impact</span>
          <h2>Research & Academic Achievements</h2>
          <p>Delivering measurable success and fostering cross-disciplinary research milestones globally.</p>
        </div>

        <div className="stats-grid">
          {/* Card 1: Events Organized */}
          <div className="stats-card">
            <div className="stats-card__header">
              <h3>Events Organized</h3>
              <div className="stats-card__total">
                <CountUp end={150} />
              </div>
            </div>
            <div className="stats-card__subgrid">
              <div className="stats-item">
                <span className="stats-item__label">FDPs</span>
                <span className="stats-item__val"><CountUp end={30} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">Conferences</span>
                <span className="stats-item__val"><CountUp end={10} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">Workshops</span>
                <span className="stats-item__val"><CountUp end={30} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">STTPs</span>
                <span className="stats-item__val"><CountUp end={25} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">Internships</span>
                <span className="stats-item__val"><CountUp end={40} /></span>
              </div>
            </div>
          </div>

          {/* Card 2: Publication & Research */}
          <div className="stats-card stats-card--wide">
            <div className="stats-card__header">
              <h3>Publication / Research Support</h3>
              <div className="stats-card__total">
                <CountUp end={300} />
              </div>
            </div>
            <div className="stats-card__subgrid stats-card__subgrid--pub">
              <div className="stats-group">
                <h4>Journals</h4>
                <div className="stats-group__grid">
                  <div className="stats-item stats-item--mini">
                    <span className="stats-item__label">SCI</span>
                    <span className="stats-item__val"><CountUp end={60} /></span>
                  </div>
                  <div className="stats-item stats-item--mini">
                    <span className="stats-item__label">Scopus</span>
                    <span className="stats-item__val"><CountUp end={100} /></span>
                  </div>
                  <div className="stats-item stats-item--mini">
                    <span className="stats-item__label">Web of Science</span>
                    <span className="stats-item__val"><CountUp end={50} /></span>
                  </div>
                </div>
              </div>
              <div className="stats-group__direct">
                <div className="stats-item">
                  <span className="stats-item__label">Books</span>
                  <span className="stats-item__val"><CountUp end={20} /></span>
                </div>
                <div className="stats-item">
                  <span className="stats-item__label">Book Chapters</span>
                  <span className="stats-item__val"><CountUp end={100} /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: IPR Assisted */}
          <div className="stats-card">
            <div className="stats-card__header">
              <h3>IPR Assisted</h3>
              <div className="stats-card__total">
                <CountUp end={120} />
              </div>
            </div>
            <div className="stats-card__subgrid">
              <div className="stats-item">
                <span className="stats-item__label">Utility Patent</span>
                <span className="stats-item__val"><CountUp end={10} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">Design Patent</span>
                <span className="stats-item__val"><CountUp end={50} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">Copyright</span>
                <span className="stats-item__val"><CountUp end={30} /></span>
              </div>
              <div className="stats-item">
                <span className="stats-item__label">Int. Patent</span>
                <span className="stats-item__val"><CountUp end={20} /></span>
              </div>
            </div>
          </div>

          {/* Card 4: Institutional Collaboration */}
          <div className="stats-card stats-card--collab">
            <div className="stats-card__header">
              <h3>Institutional Collaboration</h3>
              <div className="stats-card__total">
                <CountUp end={25} />
              </div>
            </div>
            <p className="stats-card__collab-desc">
              Building standard Memorandums of Understanding (MoUs), joint laboratories, and collaborative research initiatives with global leaders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
