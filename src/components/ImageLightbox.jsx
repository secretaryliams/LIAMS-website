import { useEffect } from 'react';
import './ImageLightbox.css';

export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image preview'}
      onClick={onClose}
    >
      <button type="button" className="image-lightbox__close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <img
        src={src}
        alt={alt || ''}
        className="image-lightbox__img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
