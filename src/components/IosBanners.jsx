import { Link } from 'react-router-dom';
import { iosBanners } from '../data/siteData';
import './IosBanners.css';

export default function IosBanners() {
  if (!iosBanners.length) return null;

  return (
    <section className="ios-banners" aria-label="Featured highlights">
      <div className="container">
        <div className="ios-banners__track">
          {iosBanners.map(({ id, title, subtitle, path, accent }) => (
            <Link key={id} to={path} className={`ios-banners__card ios-banners__card--${accent}`}>
              <span className="ios-banners__title">{title}</span>
              <span className="ios-banners__subtitle">{subtitle}</span>
              <span className="ios-banners__cta">Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
