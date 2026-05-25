import type { Variants } from 'framer-motion';

export const BANNER_ANIMATIONS: Record<string, Variants> = {
  float: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  spinSlow: {
    animate: {
      rotate: 360,
      transition: {
        duration: 40,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  spinReverse: {
    animate: {
      rotate: -360,
      transition: {
        duration: 50,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.5 },
    },
  },

  glowPulse: {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.1, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

export const ORBIT_ICONS = [
  { angle: 0, delay: 0, distance: 140, size: 45 },
  { angle: 60, delay: 1, distance: 180, size: 35 },
  { angle: 120, delay: 2, distance: 140, size: 40 },
  { angle: 180, delay: 0.5, distance: 200, size: 30 },
  { angle: 240, delay: 1.5, distance: 140, size: 45 },
  { angle: 300, delay: 2.5, distance: 180, size: 35 },
];

export const STAGGER_TEXT_VARIANTS: Record<string, Variants> = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  },
};
