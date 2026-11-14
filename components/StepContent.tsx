"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Swaps one step's content for the next: the old one tips out one way, the
 * new one drops in from the other, following the scroll direction.
 */
const TRAVEL = 70;
const TILT = 3;

export default function StepContent({
  stepKey,
  direction,
  children,
  className = "",
}: {
  stepKey: string | number;
  direction: number;
  children: React.ReactNode;
  className?: string;
}) {
  const isReduced = useReducedMotion();
  if (isReduced) return <div className={className}>{children}</div>;

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={stepKey}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ y: dir * TRAVEL, rotate: dir * TILT, opacity: 0 }),
            centre: { y: 0, rotate: 0, opacity: 1 },
            exit: (dir: number) => ({ y: dir * -TRAVEL, rotate: dir * -TILT, opacity: 0 }),
          }}
          initial="enter"
          animate="centre"
          exit="exit"
          transition={{ type: "spring", stiffness: 210, damping: 24 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
