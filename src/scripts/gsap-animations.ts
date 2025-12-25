/**
 * EVOLEA GSAP Scroll Animations
 *
 * Premium scroll-triggered animations following the EVOLEA design system.
 * Respects prefers-reduced-motion for accessibility.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Initialize all scroll animations
 */
export function initScrollAnimations(): void {
  // Skip all animations if reduced motion preferred
  if (prefersReducedMotion()) {
    console.log('[GSAP] Reduced motion preferred - skipping animations');
    // Set all animated elements to their final state
    gsap.set('.reveal-section, .reveal-card, .reveal-fade, .reveal-badge', {
      opacity: 1,
      y: 0,
      scale: 1
    });
    return;
  }

  console.log('[GSAP] Initializing scroll animations');

  // Section reveals - fade up
  gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
    gsap.from(section, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Card reveals with stagger
  const cardGrids = gsap.utils.toArray<HTMLElement>('.reveal-card-grid');
  cardGrids.forEach((grid) => {
    const cards = grid.querySelectorAll('.reveal-card');
    if (cards.length === 0) return;

    gsap.from(cards, {
      y: 80,
      opacity: 0,
      scale: 0.9,
      rotation: () => gsap.utils.random(-3, 3),
      duration: 0.7,
      ease: 'back.out(1.4)',
      stagger: 0.12,
      scrollTrigger: {
        trigger: grid,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Simple fade reveals
  gsap.utils.toArray<HTMLElement>('.reveal-fade').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Info badges pop-in
  gsap.utils.toArray<HTMLElement>('.reveal-badge').forEach((badge, index) => {
    gsap.from(badge, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      delay: index * 0.1,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: badge,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/**
 * Refresh ScrollTrigger after DOM changes
 */
export function refreshScrollTrigger(): void {
  ScrollTrigger.refresh();
}

/**
 * Clean up animations on unmount
 */
export function destroyScrollAnimations(): void {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
}
