import { useState } from 'react';
import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import SocialIcons from '../components/SocialIcons';
import { institute } from '../data/siteData';
import './Contact.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { contact } = institute;
  const [activeOfficeId, setActiveOfficeId] = useState(contact.offices[0].id);

  const activeOffice = contact.offices.find((o) => o.id === activeOfficeId) || contact.offices[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        label="Contact Us"
        title="Contact Us"
        subtitle="Connect With Us to Advance Your Academic Journey"
      />

      <section className="section">
        <div className="container contact-grid">
          <Reveal className="contact-info card">
            <div id="get-in-touch" />
            <h2>Get in Touch</h2>
            <p>Reach out for partnerships, training, research support, or general enquiries.</p>

            <div className="office-selector">
              {contact.offices.map((office) => (
                <button
                  key={office.id}
                  type="button"
                  className={`office-tab ${activeOfficeId === office.id ? 'office-tab--active' : ''}`}
                  onClick={() => setActiveOfficeId(office.id)}
                >
                  {office.name.replace(' Office', '').replace(' (Kerala)', '')}
                </button>
              ))}
            </div>

            <dl className="contact-details">
              <div>
                <dt>Address ({activeOffice.name})</dt>
                <dd className="office-address">{activeOffice.address}</dd>
              </div>
              <div>
                <dt>Official Emails</dt>
                <dd>
                  <ul className="contact-emails-list">
                    {contact.emails.map((email) => (
                      <li key={email}>
                        <a href={`mailto:${email}`}>{email}</a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Official No</dt>
                <dd className="contact-phone-wrapper">
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="contact-phone-link">
                    {contact.phone}
                  </a>
                  <div className="contact-phone-actions">
                    <a
                      href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                      className="contact-action-btn contact-action-btn--phone"
                      aria-label="Call official number"
                      title="Call Now"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.27 11.36 11.36 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.58 1 1 0 0 1-.27 1.11z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${contact.phone.replace(/[^+\d]/g, '')}`}
                      className="contact-action-btn contact-action-btn--whatsapp"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat on WhatsApp"
                      title="Chat on WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.767.46 3.427 1.258 4.983L2 22l5.163-1.355a9.96 9.96 0 0 0 4.849 1.255c5.527 0 10.012-4.485 10.012-10.012C22.024 6.485 17.539 2 12.012 2zm0 18.024c-1.579 0-3.064-.407-4.364-1.12l-.313-.173-3.056.802.815-2.98-.19-.302c-.777-1.238-1.189-2.673-1.189-4.239 0-4.417 3.595-8.012 8.012-8.012 4.417 0 8.012 3.595 8.012 8.012 0 4.417-3.595 8.012-8.012 8.012zm4.586-5.836c-.25-.125-1.48-.73-1.71-.815-.23-.085-.4-.125-.567.125-.168.25-.65.815-.796.983-.147.168-.293.187-.543.062-.25-.125-1.056-.39-2.012-1.242-.743-.662-1.245-1.48-1.39-1.73-.148-.25-.016-.385.11-.51.112-.113.25-.293.375-.44.125-.147.167-.25.25-.417.083-.168.042-.313-.02-.44-.063-.125-.567-1.365-.776-1.87-.204-.492-.41-.42-.567-.428l-.482-.008c-.167 0-.44.062-.67.313-.23.25-.877.857-.877 2.09 0 1.233.896 2.425 1.02 2.593.125.168 1.763 2.69 4.27 3.774.597.257 1.063.41 1.425.525.6.19 1.147.163 1.579.098.48-.072 1.48-.605 1.688-1.16.208-.555.208-1.03.146-1.13-.062-.1-.228-.162-.478-.287z"/>
                      </svg>
                    </a>
                  </div>
                </dd>
              </div>
              <div>
                <dt>Office Hours</dt>
                <dd>{contact.hours}</dd>
              </div>
            </dl>
            <div className="contact-qr">
              <a
                href="https://chat.whatsapp.com/JPJLFGYq3702JjrymOVejI"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-qr__link"
              >
                <img
                  src="/images/contact-qr.png"
                  alt="WhatsApp QR Code to Join LIAMS Community"
                  className="contact-qr__image"
                  onError={(e) => {
                    e.currentTarget.closest('.contact-qr').classList.add('contact-qr--placeholder');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="contact-qr__overlay">
                  <span>Join WhatsApp Community</span>
                </div>
              </a>
              <p className="contact-qr__caption">Scan or tap to connect with LIAMS on WhatsApp</p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="contact-form card">
            <div id="send-message" />
            <form onSubmit={handleSubmit}>
              <h2>Send a Message</h2>
              {submitted ? (
                <p className="contact-form__success" role="status">
                  Thank you for your message. Our team will respond shortly. (Form demo — connect
                  to your backend or email service.)
                </p>
              ) : (
                <>
                  <label>
                    Full Name
                    <input type="text" name="name" required placeholder="Your name" />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" required placeholder="you@example.com" />
                  </label>
                  <label>
                    Phone
                    <input type="tel" name="phone" placeholder="+91" />
                  </label>
                  <label>
                    Subject
                    <select name="subject" required defaultValue="">
                      <option value="" disabled>
                        Select a topic
                      </option>
                      <option>Training & Development</option>
                      <option>Research & Innovation</option>
                      <option>Conferences & Events</option>
                      <option>Collaborations & MoU</option>
                      <option>General Enquiry</option>
                    </select>
                  </label>
                  <label>
                    Message
                    <textarea name="message" rows={5} required placeholder="Your message..." />
                  </label>
                  <button type="submit" className="btn btn--primary">
                    Send Message
                  </button>
                  <div className="contact-form__footer">
                    <div className="assurance-badges">
                      <div className="assurance-badge">
                        <span className="assurance-badge__icon">🔒</span>
                        <span>Secure Data</span>
                      </div>
                      <div className="assurance-badge">
                        <span className="assurance-badge__icon">⏱️</span>
                        <span>Response &lt; 24h</span>
                      </div>
                      <div className="assurance-badge">
                        <span className="assurance-badge__icon">🎓</span>
                        <span>Expert Support</span>
                      </div>
                    </div>
                    <p className="contact-form__privacy-note">
                      We treat your details with strict confidentiality. By submitting, you agree to our academic privacy standards.
                    </p>
                  </div>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt contact-social-section">
        <div className="container contact-social-section__inner">
          <Reveal>
            <div className="contact-social-section__card card">
              <div className="contact-social-section__hero">
                <span className="contact-social-section__eyebrow">Follow Us</span>
                <h2>Stay connected with LIAMS</h2>
                <p>Join our community on social media for training updates, event news, and expert insights.</p>
              </div>
              <SocialIcons className="contact-social-section__icons" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
