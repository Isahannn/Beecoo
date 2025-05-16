import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import './welcome.css';

gsap.registerPlugin(SplitText);

export default function Welcome() {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const authContainerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !headingRef.current || !authContainerRef.current) return;

    const introTl = gsap.timeline({ paused: true });

    introTl.fromTo(
      containerRef.current,
      {
        opacity: 0,
        scale: 0.9,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
      },
      0
    );

    introTl.fromTo(
      containerRef.current,
      {
        backgroundSize: '120%',
      },
      {
        backgroundSize: '140%',
        duration: 1.5,
        ease: 'power2.out',
      },
      0
    );
    const split = new SplitText(headingRef.current, { type: 'words' });
    introTl.fromTo(
      split.words,
      {
        opacity: 0,
        yPercent: 100,
      },
      {
        opacity: 1,
        yPercent: 0,
        ease: 'power2.out',
        stagger: 0.2,
        duration: 0.8,
      },
      0.3
    );

    const buttons = authContainerRef.current.querySelectorAll('.auth-button');
    introTl.fromTo(
      buttons,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
      },
      0.5
    );

    introTl.play();

    const textTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, delay: 2 });
    textTl
      .fromTo(
        split.words,
        { opacity: 0, yPercent: 100 },
        {
          opacity: 1,
          yPercent: 0,
          ease: 'power2.out',
          stagger: 0.2,
        },
        0
      )
      .to(
        split.words,
        {
          opacity: 0,
          yPercent: -100,
          ease: 'power2.in',
          stagger: 0.2,
        },
        '+=1'
      );

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth - 0.5) * 40;
      const y = (clientY / innerHeight - 0.5) * 40;

      gsap.to(containerRef.current, {
        backgroundPosition: `${50 + x}% ${50 + y}%`,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);


    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      introTl.kill();
      textTl.kill();
      split.revert();
    };
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <h1 className="heading" ref={headingRef}>
        Добро пожаловать в BEECO
      </h1>
      <div className="auth-container" ref={authContainerRef}>
        <NavLink to="/login" className="auth-button login-button">
          Войти
        </NavLink>
        <NavLink to="/registration" className="auth-button register-button">
          Зарегистрироваться
        </NavLink>
      </div>
    </div>
  );
}