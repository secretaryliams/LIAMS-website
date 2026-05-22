// LIAMS Unified Premium Toast System
// Path: src/context/ToastContext.jsx

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    remove: removeToast
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Overlay Container */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100% - 48px)'
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: t.type === 'success' 
                  ? '1px solid rgba(16, 185, 129, 0.4)' 
                  : t.type === 'error' 
                    ? '1px solid rgba(239, 68, 68, 0.4)' 
                    : '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)',
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onClick={() => removeToast(t.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Visual Status Indicator Icon */}
                {t.type === 'success' && (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="10" fill="#10B981" />
                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {t.type === 'error' && (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="10" fill="#EF4444" />
                    <path d="M7 7L13 13M7 13L13 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                {t.type === 'info' && (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="10" fill="#3B82F6" />
                    <path d="M10 7V13M10 15H10.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                <span>{t.message}</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(t.id);
                }}
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
