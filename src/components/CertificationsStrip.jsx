import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicCertifications } from '../store/slices/publicCertificationsSlice';
import EmptyState from './EmptyState';
import Reveal from './motion/Reveal';
import StaggerGrid from './motion/StaggerGrid';
import { useCertificationsSectionTitle } from '../hooks/useSiteSettings';
import { CERTIFICATIONS_SECTION_ID } from '../lib/siteSettingsKeys';
import './CertificationsStrip.css';

export default function CertificationsStrip() {
  const dispatch = useDispatch();
  const { items: certifications, loading } = useSelector((state) => state.publicCertifications);
  const { sectionTitle } = useCertificationsSectionTitle();

  useEffect(() => {
    dispatch(fetchPublicCertifications());
  }, [dispatch]);

  return (
    <section
      id={CERTIFICATIONS_SECTION_ID}
      className="certs-strip"
      aria-labelledby="certs-heading"
    >
      <div className="container">
        <Reveal className="certs-strip__header">
          <span className="section__label">Recognition & quality</span>
          <h2 id="certs-heading">{sectionTitle}</h2>
          <p>
            Official documents and credentials published by LIAMS.
          </p>
        </Reveal>

        {loading ? (
          <p className="certs-strip__loading">Loading…</p>
        ) : certifications.length === 0 ? (
          <Reveal delay={0.05}>
            <EmptyState message={`No ${sectionTitle.toLowerCase()} available yet`} />
          </Reveal>
        ) : (
          <StaggerGrid className="certs-strip__grid">
            {certifications.map((cert) => {
              const inner = (
                <>
                  <span className="certs-strip__icon" aria-hidden="true">
                    {cert.icon}
                  </span>
                  <div>
                    <strong>{cert.title}</strong>
                    <span>{cert.subtitle}</span>
                  </div>
                </>
              );
              return (
                <div key={cert.id} className="certs-strip__card">
                  {cert.drive_link ? (
                    <a
                      href={cert.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="certs-strip__link"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </div>
              );
            })}
          </StaggerGrid>
        )}
      </div>
    </section>
  );
}
