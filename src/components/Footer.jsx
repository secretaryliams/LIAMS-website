import { Link } from 'react-router-dom';
import { institute, navLinks } from '../data/siteData';
import { useCertificationsSectionTitle } from '../hooks/useSiteSettings';
import SocialIcons from './SocialIcons';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const { sectionTitle } = useCertificationsSectionTitle();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src="/logos/liams-logo-full.png" alt={institute.shortName} className="footer__logo" />
          <p className="footer__tagline">{institute.tagline}</p>
          <SocialIcons />
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="footer__links">
            {navLinks.map(({ path, label }) => {
              const resolvedLabel = path === '/certificates' ? sectionTitle : label;
              return (
                <li key={path}>
                  <Link to={path}>{resolvedLabel}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h4>Get In Touch</h4>
          <address className="footer__contact">
            <p className="footer__contact-item">
              <strong>Phone:</strong>
              <a href={`tel:${institute.contact.phone.replace(/\s/g, '')}`}>
                {institute.contact.phone}
              </a>
            </p>
            <p className="footer__contact-item">
              <strong>Emails:</strong>
              {institute.contact.emails.map((email) => (
                <span key={email} className="footer__email-span">
                  <a href={`mailto:${email}`}>{email}</a>
                </span>
              ))}
            </p>
            <p className="footer__contact-item">
              <strong>Hours:</strong> {institute.contact.hours}
            </p>
          </address>
        </div>

        <div>
          <h4>Our Offices</h4>
          <div className="footer__offices">
            {institute.contact.offices.map((office) => (
              <div key={office.id} className="footer__office-item">
                <h5>{office.name}</h5>
                <p>{office.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>
            &copy; {year} {institute.name}. All rights reserved.
          </p>
          <p className="footer__credentials-note">
            ISO 9001:2015 & ISO 21001:2018 Certified | MSME Registered | StartupTN Recognized
          </p>
        </div>
      </div>
    </footer>
  );
}
