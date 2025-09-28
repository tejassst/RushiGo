import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient background matching logo colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
      
      {/* Large animated gradient orbs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #a855f7 0%, #3b82f6 100%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, #8b5cf6 100%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, #a855f7 100%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, 60, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Floating geometric shapes inspired by logo */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            background: `linear-gradient(${Math.random() * 360}deg, #a855f7, #3b82f6)`,
            opacity: 0.4,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Radial gradients for depth */}
      <div 
        className="absolute top-0 left-1/2 w-96 h-96 opacity-10 transform -translate-x-1/2"
        style={{
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
        }}
      />
      
      <div 
        className="absolute bottom-0 right-1/3 w-80 h-80 opacity-10"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
        }}
      />
    </div>
  );
}