import { useEffect, useRef, useState } from 'react';
import './ImageViewer.css';

/**
 * Premium Image Viewer & Lightbox Component.
 * Supports:
 * - Full-screen responsive viewport (object-fit: contain)
 * - Custom Zoom (1x - 5x) via mouse wheel, touch pinch, double click, and controls
 * - Custom Drag/Pan positioning when zoomed in
 * - Tactile bottom control dock (+, -, reset) and close actions
 * - Keyboard listeners (ESC to close) and focus containment
 */
export default function ImageViewer({ imageSrc, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const viewerRef = useRef(null);
  const viewportRef = useRef(null);
  const imgRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef(0);

  // 1. Keyboard & Manual Non-Passive Event Listeners (Guarantees absolute size-lock on zoom)
  useEffect(() => {
    const viewerElement = viewerRef.current;
    const viewportElement = viewportRef.current;
    if (!viewerElement || !viewportElement) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleWheel = (e) => {
      // Prevent browser default trackpad pinch zoom or mouse scroll page zoom
      e.preventDefault();
      
      const zoomIntensity = 0.08;
      const delta = e.deltaY < 0 ? 1 : -1;
      const factor = delta * zoomIntensity;
      
      setScale((prevScale) => {
        const nextScale = Math.max(1, Math.min(5, prevScale + factor));
        if (nextScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return nextScale;
      });
    };

    const handleTouchMovePrevent = (e) => {
      // If two fingers are pinching, block browser level page scale
      if (e.touches.length === 2) {
        e.preventDefault();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    
    // Register event listeners as NON-PASSIVE (Required to permit e.preventDefault() in modern engines)
    viewerElement.addEventListener('wheel', handleWheel, { passive: false });
    viewportElement.addEventListener('touchmove', handleTouchMovePrevent, { passive: false });
    
    viewerElement.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      viewerElement.removeEventListener('wheel', handleWheel);
      viewportElement.removeEventListener('touchmove', handleTouchMovePrevent);
    };
  }, [onClose]);

  if (!imageSrc) return null;

  // Bounding constraints: Keeps image within logical boundaries when scaled
  const clampPosition = (x, y, currentScale) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    
    // Calculate drag bounds based on scale multiplier
    const maxDragX = (currentScale - 1) * 350;
    const maxDragY = (currentScale - 1) * 220;

    return {
      x: Math.max(-maxDragX, Math.min(maxDragX, x)),
      y: Math.max(-maxDragY, Math.min(maxDragY, y)),
    };
  };

  // Zoom Math helper
  const handleZoom = (factor) => {
    setScale((prevScale) => {
      const nextScale = Math.max(1, Math.min(5, prevScale + factor));
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return nextScale;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 2. Mouse Wheel Scroll Zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.08;
    const delta = e.deltaY < 0 ? 1 : -1;
    const factor = delta * zoomIntensity;
    
    setScale((prevScale) => {
      const nextScale = Math.max(1, Math.min(5, prevScale + factor));
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return nextScale;
    });
  };

  // 3. Double-Click to toggle zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  };

  // 4. Mouse Drag & Pan Handlers
  const handleMouseDown = (e) => {
    if (scale <= 1) return; // Don't drag if not zoomed in
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const nextX = e.clientX - dragStart.current.x;
    const nextY = e.clientY - dragStart.current.y;
    
    const bounded = clampPosition(nextX, nextY, scale);
    setPosition(bounded);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 5. Mobile Touch Gestures (Pinch to Zoom & Swipe to Pan)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Setup touch distances for pinch calculation
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      // Setup dragging coordinates
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = (dist - lastTouchDist.current) * 0.015;
      lastTouchDist.current = dist;

      setScale((prevScale) => {
        const nextScale = Math.max(1, Math.min(5, prevScale + factor));
        if (nextScale === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return nextScale;
      });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const nextX = e.touches[0].clientX - dragStart.current.x;
      const nextY = e.touches[0].clientY - dragStart.current.y;
      
      const bounded = clampPosition(nextX, nextY, scale);
      setPosition(bounded);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDist.current = 0;
  };

  return (
    <div
      ref={viewerRef}
      className="iv-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Image details viewer'}
      tabIndex="-1"
      onClick={onClose}
    >
      {/* Lightbox Close Button */}
      <button
        type="button"
        className="iv-close-btn"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Main Image Viewport Area */}
      <div 
        ref={viewportRef}
        className="iv-viewport"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`iv-container ${isDragging ? 'is-dragging' : ''}`}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleDoubleClick}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt || 'Full size event review'}
            className="iv-image"
            draggable="false"
            loading="lazy"
          />
        </div>
      </div>

      {/* Floating Control Toolbar */}
      <div className="iv-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="iv-tool-item"
          onClick={() => handleZoom(-0.4)}
          disabled={scale <= 1}
          aria-label="Zoom Out"
        >
          －
        </button>
        <span className="iv-scale-label">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          className="iv-tool-item"
          onClick={() => handleZoom(0.4)}
          disabled={scale >= 5}
          aria-label="Zoom In"
        >
          ＋
        </button>
        <div className="iv-divider" />
        <button
          type="button"
          className="iv-tool-reset"
          onClick={handleReset}
          disabled={scale === 1 && position.x === 0 && position.y === 0}
          aria-label="Reset View"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
