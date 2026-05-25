import { useState } from 'react';
import './OfflinePage.css';

/**
 * Premium Offline Fallback Screen for the LIAMS web portal.
 * Features custom dark glassmorphism styling, a pulsing SVG network icon,
 * and a tactile Retry button to trigger a page refresh.
 */
export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    // Artificially wait 800ms for a spinner effect to show interactive feedback,
    // then trigger a browser reload which checks the connection again.
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="offline-wrapper" role="alert" aria-live="assertive">
      {/* Background ambient glowing orbs to match premium LIAMS aesthetics */}
      <div className="offline-glow">
        <div className="offline-glow__orb orb-blue"></div>
        <div className="offline-glow__orb orb-gold"></div>
      </div>

      <div className="offline-card">
        {/* Animated WiFi-Off custom SVG */}
        <div className="offline-icon-container">
          <svg
            className="offline-wifi-svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* WiFi signal arcs with dashed styling */}
            <path d="M1 1l22 22" className="strike-line" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5" className="wifi-arc-3" />
            <path d="M5 12.5a10.94 10.94 0 0 1 5.83-2.84" className="wifi-arc-3" />
            <path d="M12 18.5a1.5 1.5 0 1 1 0-.01" className="wifi-dot" />
            <path d="M8.58 15.35A5.96 5.96 0 0 1 12 14.5" className="wifi-arc-2" />
            <path d="M16.72 15.35a5.96 5.96 0 0 1 1.28.85" className="wifi-arc-2" />
          </svg>
        </div>

        <header className="offline-header">
          <h1>Connection Interrupted</h1>
          <p className="offline-subtitle">You are currently offline</p>
          <p className="offline-description">
            Please check your local internet connection or router and try again.
            LIAMS will restore your portal dashboard as soon as you are reconnected.
          </p>
        </header>

        <div className="offline-actions">
          <button
            type="button"
            className={`btn btn--primary offline-retry-btn ${retrying ? 'is-retrying' : ''}`}
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? (
              <>
                <svg width="18" height="18" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3" className="spinner">
                  <defs>
                    <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                      <stop stopColor="currentColor" stopOpacity="0" offset="0%"/>
                      <stop stopColor="currentColor" stopOpacity=".631" offset="63.146%"/>
                      <stop stopColor="currentColor" offset="100%"/>
                    </linearGradient>
                  </defs>
                  <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)"/>
                </svg>
                Verifying connection…
              </>
            ) : (
              'Retry Connection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
