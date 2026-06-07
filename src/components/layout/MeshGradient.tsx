'use client';

import { motion } from 'framer-motion';

export function MeshGradient() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="mesh-gradient"
    />
  );
}
