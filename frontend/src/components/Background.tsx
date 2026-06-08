'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#f8fafc]">
      {/* Mesh Gradients */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-cyan-200/45 blur-[120px] filter"
      />
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-[20%] -right-[10%] h-[70%] w-[60%] rounded-full bg-blue-200/45 blur-[130px] filter"
      />
      
      {/* Real-time Grid Map Matrix Effect */}
      <div className="absolute inset-0 grid-bg opacity-45 pointer-events-none" />

      {/* Floating Ambient Lights */}
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-indigo-150/25 blur-[100px] pointer-events-none animate-pulse" />
    </div>
  );
}
