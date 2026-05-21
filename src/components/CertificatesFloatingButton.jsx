import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCertificationsSectionTitle } from '../hooks/useSiteSettings';
import { CERTIFICATIONS_SECTION_ID } from '../lib/siteSettingsKeys';
import { scrollToSection } from '../lib/scrollToSection';
import './CertificatesFloatingButton.css';

export default function CertificatesFloatingButton() {
  const { sectionTitle } = useCertificationsSectionTitle();
  const { pathname } = useLocation();
  const onCertsPage = pathname === '/certificates';

  function handleClick(e) {
    if (onCertsPage) {
      e.preventDefault();
      scrollToSection(CERTIFICATIONS_SECTION_ID);
    }
  }

  return (
    <motion.div
      className="certs-fab"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/certificates#${CERTIFICATIONS_SECTION_ID}`}
        className="certs-fab__btn"
        aria-label={`View ${sectionTitle}`}
        onClick={handleClick}
      >
        <span className="certs-fab__icon" aria-hidden="true">
          ↗
        </span>
        <span className="certs-fab__tooltip" role="tooltip">
          {sectionTitle}
        </span>
      </Link>
    </motion.div>
  );
}
