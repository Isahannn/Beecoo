import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import './welcome.css';

gsap.registerPlugin(SplitText);

export default function Welcome() {
  const containerRef = useRef(null);

  useEffect(() => {
    const split = new SplitText(containerRef.current, { type: 'words' });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.fromTo(split.words,
      { opacity: 0, yPercent: 100 },
      {
        opacity: 1,
        yPercent: 0,
        ease: 'power2.out',
        stagger: 0.2
      },
      0
    ).to(split.words,
      {
        opacity: 0,
        yPercent: -100,
        ease: 'power2.in',
        stagger: 0.2
      },
      "+=1"
    );

    return () => {
      tl.kill();
      split.revert();
    };
  }, []);

  return (
    <div className="container">
      <h1 className="heading" ref={containerRef}>
        Добро пожаловать в BEECO
      </h1>
      <div className="auth-container">
        <NavLink to="/login" className="auth-button login-button">
          Log in
        </NavLink>
        <NavLink to="/registration" className="auth-button register-button">
          Register
        </NavLink>
      </div>
    </div>
  );
}