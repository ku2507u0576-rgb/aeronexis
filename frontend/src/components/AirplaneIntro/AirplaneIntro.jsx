import React, { useState, useEffect, useRef } from 'react';
import './AirplaneIntro.css';

/**
 * AirplaneIntro — Full-screen cinematic Boeing video intro.
 * Plays the boeing-cinematic.mp4 (or airplane-flyover.mp4 as fallback).
 * Auto-completes after 7s, shows animated branding overlay.
 */
const AirplaneIntro = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showText, setShowText] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const DURATION = 7000; // 7 seconds

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 800);
    const autoTimer = setTimeout(() => handleComplete(), DURATION);
    
    // Progress bar
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(100, (elapsed / DURATION) * 100));
    }, 50);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(autoTimer);
      clearInterval(progressInterval);
    };
  }, []);

  const handleComplete = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => { if (onComplete) onComplete(); }, 900);
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // Cinematic slow-mo
    }
  };

  const handleVideoError = () => {
    // Try fallback
    if (videoRef.current && !videoRef.current.src.includes('airplane-flyover')) {
      videoRef.current.src = '/videos/airplane-flyover.mp4';
      videoRef.current.load();
    }
  };

  return (
    <div className={`airplane-intro-overlay${isFadingOut ? ' fade-out' : ''}`}>
      {/* Video Background — swap airplane-4k.mp4 with your own 4K file */}
      <video
        ref={videoRef}
        className="intro-video"
        autoPlay
        muted
        playsInline
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
        onEnded={handleComplete}
      >
        {/* Drop your 4K video file in frontend/public/videos/ named airplane-4k.mp4 */}
        <source src="/videos/airplane-flyover.mp4" type="video/mp4" />
        <source src="/videos/plane-4k-2.mp4" type="video/mp4" />
        <source src="/videos/boeing-cinematic.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="intro-overlay-top" />
      <div className="intro-overlay-bottom" />
      <div className="intro-overlay-vignette" />

      {/* Indian Tricolor accent bar */}
      <div className="tricolor-bar">
        <div className="tricolor-saffron" />
        <div className="tricolor-white" />
        <div className="tricolor-green" />
      </div>

      {/* Main content */}
      <div className={`intro-content${showText ? ' visible' : ''}`}>
        {/* Logo mark */}
        <div className="intro-logo-mark">
          <span className="intro-plane-icon">✈</span>
        </div>
        <div className="intro-eyebrow">GOVERNMENT OF INDIA · MINISTRY OF CIVIL AVIATION</div>
        <h1 className="intro-title">AERO<br /><span className="intro-title-accent">INDIA</span></h1>
        <p className="intro-subtitle">Real-Time Airfare Price Index</p>
        <div className="intro-tagline">
          <span className="intro-dot saffron" />
          Navigate the Skies. Master the Fares.
          <span className="intro-dot green" />
        </div>

        {/* Stats strip */}
        <div className="intro-stats-strip">
          {[
            { val: '5', label: 'Airlines' },
            { val: '10', label: 'Routes' },
            { val: '25K+', label: 'Daily Quotes' },
            { val: 'LIVE', label: 'Real-Time Data' },
          ].map(s => (
            <div className="intro-stat" key={s.label}>
              <div className="intro-stat-val">{s.val}</div>
              <div className="intro-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="intro-progress-bar">
        <div className="intro-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Skip button */}
      <button className="intro-skip-btn" onClick={handleComplete}>
        Skip Intro <span style={{ opacity: 0.6 }}>→</span>
      </button>

      {/* Loading state */}
      {!videoLoaded && (
        <div className="intro-loading">
          <div className="intro-spinner" />
        </div>
      )}
    </div>
  );
};

export default AirplaneIntro;
