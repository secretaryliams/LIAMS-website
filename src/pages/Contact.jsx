import { useState } from 'react';
import PageHero from '../components/PageHero';
import Reveal from '../components/motion/Reveal';
import SocialIcons from '../components/SocialIcons';
import { institute } from '../data/siteData';
import './Contact.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { contact } = institute;

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
            <dl className="contact-details">
              <div>
                <dt>Address</dt>
                <dd>{contact.address}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Office Hours</dt>
                <dd>{contact.hours}</dd>
              </div>
            </dl>
            <div className="contact-social">
              <h3>Social Media Links</h3>
              <SocialIcons />
              <p className="contact-social__note">
                Join our WhatsApp group invite and Telegram channel for updates (links configured in
                site settings).
              </p>
            </div>
            <div className="contact-qr">
              <img
                src="/images/contact-qr.png"
                alt="QR code to contact LIAMS"
                className="contact-qr__image"
                onError={(e) => {
                  e.currentTarget.closest('.contact-qr').classList.add('contact-qr--placeholder');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="contact-qr__caption">Scan to connect with LIAMS</p>
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
