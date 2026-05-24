import { useEffect, useRef, useCallback } from 'react';

/**
 * NeuralBackground — reusable AI/neural-network canvas animation.
 *
 * Props:
 *   variant  "full"  → home hero  (50-80 particles, strong cursor interaction)
 *            "mini"  → page hero  (15-30 particles, subtle)
 */

// ─── Per-variant configuration ───────────────────────────────────────────────
const CONFIGS = {
  full: {
    baseParticleCount: 65,
    mobileParticleCount: 30,
    speed: 0.35,
    connectionDistance: 160,
    nodeRadius: { min: 1.2, max: 2.8 },
    nodeOpacity: { min: 0.35, max: 0.85 },
    lineOpacity: 0.22,
    glowRadius: 6,

    // ── Cursor interaction (full) ──────────────────────────────────────────
    parallaxStrength: 40,       // ↑ stronger parallax layer shift (was 18)
    parallaxLerp: 0.1,          // ↑ snappier lerp (was 0.05)
    cursorAttractionRadius: 160, // px — particles within this radius get pulled
    cursorAttractionForce: 0.04, // subtle pull per frame
    cursorNodeRadius: 4,         // glowing dot drawn at cursor
    cursorLineDistance: 180,     // px — cursor connects to particles this close
    cursorLineOpacity: 0.55,     // bright connecting lines from cursor
    cursorGlow: 20,              // shadow blur for cursor node

    canvasOpacity: 1,
  },
  mini: {
    baseParticleCount: 24,
    mobileParticleCount: 14,
    speed: 0.22,
    connectionDistance: 120,
    nodeRadius: { min: 0.9, max: 1.8 },
    nodeOpacity: { min: 0.2, max: 0.55 },
    lineOpacity: 0.12,
    glowRadius: 3,

    parallaxStrength: 8,
    parallaxLerp: 0.06,
    cursorAttractionRadius: 80,
    cursorAttractionForce: 0.015,
    cursorNodeRadius: 2.5,
    cursorLineDistance: 100,
    cursorLineOpacity: 0.25,
    cursorGlow: 8,

    canvasOpacity: 0.75,
  },
};

// ─── Colour palette ───────────────────────────────────────────────────────────
const PALETTE = [
  '99, 179, 237',   // sky blue
  '56, 189, 248',   // cyan-400
  '147, 197, 253',  // blue-300
  '165, 243, 252',  // cyan-200
  '186, 230, 253',  // light blue
];
const CURSOR_COLOR = '56, 189, 248'; // bright cyan for cursor node

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(cfg, w, h) {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const angle = rand(0, Math.PI * 2);
  const speed = rand(cfg.speed * 0.5, cfg.speed * 1.5);
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseVx: Math.cos(angle) * speed, // remember base velocity
    baseVy: Math.sin(angle) * speed,
    r: rand(cfg.nodeRadius.min, cfg.nodeRadius.max),
    alpha: rand(cfg.nodeOpacity.min, cfg.nodeOpacity.max),
    color,
    pulsePhase: rand(0, Math.PI * 2),
    pulseSpeed: rand(0.008, 0.022),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function NeuralBackground({ variant = 'full' }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    particles: [],
    raf: null,
    // Raw cursor position in canvas-space pixels (null = cursor not on page)
    cursorRaw: { x: -9999, y: -9999 },
    // Smoothed cursor (lerped for silky motion)
    cursorSmooth: { x: -9999, y: -9999 },
    // Parallax layer offset (normalised −1→+1)
    parallaxTarget:  { x: 0, y: 0 },
    parallaxCurrent: { x: 0, y: 0 },
    prefersReducedMotion: false,
  });

  const cfg = CONFIGS[variant] ?? CONFIGS.full;

  // ── prefers-reduced-motion ─────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.prefersReducedMotion = mq.matches;
    const handler = (e) => { stateRef.current.prefersReducedMotion = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Unified mouse tracker ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;

    function onMouseMove(e) {
      const s = stateRef.current;

      // Parallax: normalised offset from centre (−1 → +1)
      s.parallaxTarget.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      s.parallaxTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Cursor in canvas-local coordinates
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        s.cursorRaw.x = e.clientX - rect.left;
        s.cursorRaw.y = e.clientY - rect.top;
      }
    }

    function onMouseLeave() {
      const s = stateRef.current;
      s.parallaxTarget.x = 0;
      s.parallaxTarget.y = 0;
      s.cursorRaw.x = -9999;
      s.cursorRaw.y = -9999;
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);   // canvas ref stable — no dependency needed

  // ── Main animation loop ────────────────────────────────────────────────────
  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s   = stateRef.current;

    function resize() {
      const parent = canvas.parentElement;
      canvas.width  = parent ? parent.offsetWidth  : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      reinitParticles();
    }

    function reinitParticles() {
      const isMobile = window.innerWidth <= 768;
      const count = isMobile ? cfg.mobileParticleCount : cfg.baseParticleCount;
      s.particles = Array.from({ length: count }, () =>
        createParticle(cfg, canvas.width, canvas.height)
      );
    }

    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Draw loop ────────────────────────────────────────────────────────────
    function draw() {
      s.raf = requestAnimationFrame(draw);

      const { width: W, height: H } = canvas;
      const frozen = s.prefersReducedMotion;

      // ── Lerp parallax ───────────────────────────────────────────────────
      const pl = cfg.parallaxLerp;
      s.parallaxCurrent.x += (s.parallaxTarget.x - s.parallaxCurrent.x) * pl;
      s.parallaxCurrent.y += (s.parallaxTarget.y - s.parallaxCurrent.y) * pl;
      const ox = s.parallaxCurrent.x * cfg.parallaxStrength;
      const oy = s.parallaxCurrent.y * cfg.parallaxStrength;

      // ── Lerp cursor (silky smooth, no jitter) ───────────────────────────
      const cl = 0.12; // cursor lerp speed
      s.cursorSmooth.x += (s.cursorRaw.x - s.cursorSmooth.x) * cl;
      s.cursorSmooth.y += (s.cursorRaw.y - s.cursorSmooth.y) * cl;
      const cx = s.cursorSmooth.x;
      const cy = s.cursorSmooth.y;
      const cursorOnCanvas = cx > 0 && cx < W && cy > 0 && cy < H;

      ctx.clearRect(0, 0, W, H);

      // ── Update particles ─────────────────────────────────────────────────
      if (!frozen) {
        const attrR  = cfg.cursorAttractionRadius;
        const attrR2 = attrR * attrR;
        const attrF  = cfg.cursorAttractionForce;

        for (const p of s.particles) {
          // Cursor attraction: particles within radius get a gentle pull
          if (cursorOnCanvas) {
            const dx = cx - (p.x + ox);
            const dy = cy - (p.y + oy);
            const d2 = dx * dx + dy * dy;
            if (d2 < attrR2 && d2 > 0.1) {
              const dist   = Math.sqrt(d2);
              const factor = (1 - dist / attrR) * attrF; // stronger when closer
              p.vx += (dx / dist) * factor;
              p.vy += (dy / dist) * factor;
            }
          }

          // Dampen velocity back toward base (prevents runaway acceleration)
          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;

          p.x += p.vx;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          // Wrap around edges
          const m = 20;
          if (p.x < -m) p.x = W + m;
          else if (p.x > W + m) p.x = -m;
          if (p.y < -m) p.y = H + m;
          else if (p.y > H + m) p.y = -m;
        }
      }

      // ── Connection lines between particles ──────────────────────────────
      const connDist2    = cfg.connectionDistance ** 2;
      const maxLineAlpha = cfg.lineOpacity;

      for (let i = 0; i < s.particles.length; i++) {
        const a = s.particles[i];
        for (let j = i + 1; j < s.particles.length; j++) {
          const b  = s.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > connDist2) continue;

          const ratio      = 1 - d2 / connDist2;
          const lineColor  = (i + j) % 2 === 0 ? a.color : b.color;

          ctx.beginPath();
          ctx.moveTo(a.x + ox, a.y + oy);
          ctx.lineTo(b.x + ox, b.y + oy);
          ctx.strokeStyle = `rgba(${lineColor}, ${(ratio * maxLineAlpha).toFixed(3)})`;
          ctx.lineWidth   = ratio * 1.2;
          ctx.stroke();
        }
      }

      // ── Cursor → particle lines (bright, dynamic) ───────────────────────
      if (cursorOnCanvas && !frozen) {
        const cursorLineDist2 = cfg.cursorLineDistance ** 2;

        for (const p of s.particles) {
          const dx = p.x + ox - cx;
          const dy = p.y + oy - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 > cursorLineDist2) continue;

          const ratio = 1 - d2 / cursorLineDist2;
          const alpha = ratio * cfg.cursorLineOpacity;

          // Gradient line: bright at cursor, fades to particle
          const grad = ctx.createLinearGradient(cx, cy, p.x + ox, p.y + oy);
          grad.addColorStop(0,   `rgba(${CURSOR_COLOR}, ${alpha.toFixed(3)})`);
          grad.addColorStop(1,   `rgba(${p.color}, ${(alpha * 0.3).toFixed(3)})`);

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.x + ox, p.y + oy);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = ratio * 1.8;
          ctx.stroke();
        }
      }

      // ── Regular particle nodes ───────────────────────────────────────────
      for (const p of s.particles) {
        const pulse      = Math.sin(p.pulsePhase) * 0.25 + 0.75;
        const finalAlpha = p.alpha * pulse;

        ctx.save();
        ctx.shadowColor = `rgba(${p.color}, 0.7)`;
        ctx.shadowBlur  = cfg.glowRadius;
        ctx.globalAlpha = finalAlpha;
        ctx.fillStyle   = `rgba(${p.color}, 1)`;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Cursor node (glowing dot at cursor position) ─────────────────────
      if (cursorOnCanvas && !frozen) {
        const pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7; // 0.4–1

        // Outer glow ring
        ctx.save();
        ctx.shadowColor = `rgba(${CURSOR_COLOR}, 0.9)`;
        ctx.shadowBlur  = cfg.cursorGlow;
        ctx.globalAlpha = 0.25 * pulse;
        ctx.fillStyle   = `rgba(${CURSOR_COLOR}, 1)`;
        ctx.beginPath();
        ctx.arc(cx, cy, cfg.cursorNodeRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Core dot
        ctx.save();
        ctx.shadowColor = `rgba(${CURSOR_COLOR}, 1)`;
        ctx.shadowBlur  = cfg.cursorGlow * 1.5;
        ctx.globalAlpha = 0.95;
        ctx.fillStyle   = `rgba(${CURSOR_COLOR}, 1)`;
        ctx.beginPath();
        ctx.arc(cx, cy, cfg.cursorNodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    s.raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
    };
  }, [cfg]);

  useEffect(() => {
    const cleanup = startAnimation();
    return cleanup;
  }, [startAnimation]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        1,
        pointerEvents: 'none',
        opacity:       cfg.canvasOpacity,
        display:       'block',
      }}
    />
  );
}
