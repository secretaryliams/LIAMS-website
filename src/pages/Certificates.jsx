import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';
import Reveal from '../components/motion/Reveal';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCertifications } from '../store/slices/publicCertificationsSlice';
import './Certificates.css';

export default function Certificates() {
  const dispatch = useDispatch();
  const { items: certifications, sectionTitle, loading } = useSelector((state) => state.publicCertifications);

  useEffect(() => {
    dispatch(fetchPublicCertifications());
  }, [dispatch]);

  return (
    <>
      <PageHero
        label={sectionTitle}
        title={sectionTitle}
        subtitle="View certificates and accreditation documents from LIAMS programmes and events."
      />

      <section id="certifications" className="section">
        <div className="container">
          {loading ? (
            <p className="certificates-page__status">Loading certificates…</p>
          ) : certifications.length === 0 ? (
            <EmptyState message="No certificates published yet" />
          ) : (
            <ul className="certificates-page__grid">
              {certifications.map(({ id, title, drive_link }) => (
                <li key={id}>
                  <article className="card certificates-page__card">
                    <span className="certificates-page__icon" aria-hidden="true">
                      📄
                    </span>
                    <h3>{title}</h3>
                    {drive_link ? (
                      <a
                        href={drive_link}
                        target="_blank"
                        rel="noreferrer"
                        className="card__link"
                      >
                        View certificate →
                      </a>
                    ) : (
                      <p className="certificates-page__muted">Link coming soon</p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
          <Reveal className="page-cta">
            <Link to="/contact" className="btn btn--navy">
              Enquire About Certifications
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
