// src/components/InstallPrompt.jsx
// Shows a custom "Add to Home Screen" banner on Android/Chrome
// iOS shows the native Safari share-sheet prompt instead (handled in tip)

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [prompt,    setPrompt]    = useState(null);
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS,     setIsIOS]     = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Detect iOS (no beforeinstallprompt support)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    const standalone = window.navigator.standalone;
    setIsIOS(ios);

    if (ios && !standalone && !sessionStorage.getItem('moolam-ios-tip-shown')) {
      setTimeout(() => setShowIOSTip(true), 3000);
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      if (!localStorage.getItem('moolam-install-dismissed')) {
        setTimeout(() => setVisible(true), 2000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('moolam-install-dismissed', '1');
  };

  const dismissIOS = () => {
    setShowIOSTip(false);
    sessionStorage.setItem('moolam-ios-tip-shown', '1');
  };

  if (!visible && !showIOSTip) return null;

  return (
    <>
      {/* Android / Chrome install banner */}
      {visible && (
        <div style={{
          position: 'fixed', bottom: 72, left: 12, right: 12,
          background: 'white',
          borderRadius: 18, padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 300,
          display: 'flex', alignItems: 'center', gap: 14,
          border: '1px solid rgba(27,67,50,0.1)',
          animation: 'slideUp 0.3s ease',
        }}>
          <img src="/icon-192.png" alt="Moolam" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--forest)', marginBottom: 2 }}>
              Install Moolam App
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-light)', lineHeight: 1.4 }}>
              Add to home screen for quick access — works like a real app!
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button onClick={install} style={{
              background: 'var(--forest)', color: 'white',
              border: 'none', borderRadius: 8, padding: '6px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Install</button>
            <button onClick={dismiss} style={{
              background: 'transparent', color: 'var(--text-light)',
              border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}>Not now</button>
          </div>
        </div>
      )}

      {/* iOS Safari tip */}
      {showIOSTip && (
        <div style={{
          position: 'fixed', bottom: 72, left: 12, right: 12,
          background: '#1b4332', borderRadius: 16, padding: '16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          zIndex: 300,
          animation: 'slideUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>📲 Install Moolam on iPhone</div>
            <button onClick={dismissIOS} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Tap <strong style={{ color: 'white' }}>Share ↑</strong> in Safari, then tap <strong style={{ color: 'white' }}>"Add to Home Screen"</strong> to install Moolam like an app.
          </div>
        </div>
      )}
    </>
  );
}
