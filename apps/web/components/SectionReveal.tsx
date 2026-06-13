"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ElementType, ReactNode } from "react";

// Map tag string to a motion component key
type MotionTag = keyof typeof motion;

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: MotionTag;
}

export const SectionReveal = ({
  children,
  delay = 0,
  y = 24,
  className = "",
  as = "div",
}: SectionRevealProps) => {
  // motion[tag] falls back to motion.div for custom / unknown tags
  const MotionTag = (motion[as] ?? motion.div) as React.ComponentType<
    HTMLMotionProps<"div"> & { className?: string }
  >;

  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

export default SectionReveal;
