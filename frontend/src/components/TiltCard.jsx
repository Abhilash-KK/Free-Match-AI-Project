import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className = '', maxTilt = 12, scale = 1.02 }) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // cursor X relative to card
    const y = e.clientY - rect.top;  // cursor Y relative to card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-maxTilt to +maxTilt)
    const rotateX = (((y - centerY) / centerY) * -maxTilt).toFixed(2);
    const rotateY = (((x - centerX) / centerX) * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

export default TiltCard;
