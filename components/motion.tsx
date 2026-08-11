"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Honours the OS "reduce motion" preference: movement is dropped,
 * gentle opacity fades are kept so nothing disappears.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease, delay: i * 0.08 },
  }),
};

/** Fade-and-rise into view on scroll. `index` staggers siblings. */
export function Reveal({
  children,
  index = 0,
  className,
  id,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  /** Anchor target, for deep links such as /about#fleet. */
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      className={className}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

/** Slow Ken-Burns style scale for imagery. */
export function KenBurns({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 1.08 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2.2, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Hero entrance for large display text. */
export function HeroLine({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
