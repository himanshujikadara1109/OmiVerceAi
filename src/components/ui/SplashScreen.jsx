import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG for the OmiVerceAI "icon" placeholder
const OmiVerceAiLogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-full h-full"
  >
    {/* A stylized 'O' or a data structure icon */}
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M14 8c-1.5 1-2 2-2 4s.5 3 2 4M10 8c1.5 1 2 2 2 4s-.5 3-2 4"
      strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const SplashScreen = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  // --- Animation Variants ---

  const logoAnimation = {
    // Initial state: centered, very small, hidden
    initial: {
      opacity: 0,
      scale: 0.1, // Start smaller for a bigger growth effect
      x: "-50%",
      y: "-50%",
      top: "50%",
      left: "50%",
      filter: "blur(20px)",
      rotate: 0,
      borderRadius: "50%",
    },

    // Phase 1: Slow, smooth growth to a large size (2.0s)
    slowGrow: {
      opacity: 1,
      scale: 1.5, // Grow to a larger, dominating size
      filter: "blur(0px)",
      transition: {
        duration: 2.0, // SLOWLY increase size over 2 seconds
        ease: "easeInOut",
      },
    },

    // Phase 2: Chaotic "Data Stream" / Glitch effect (2.0s to 4.5s)
    dataStream: {
      // Fast, small random position shifts
      x: ["-50%", "-51%", "-49%", "-50%", "-49%", "-51%", "-50%"],
      y: ["-50%", "-49%", "-51%", "-50%", "-51%", "-49%", "-50%"],
      
      // Rapid rotation and pulse
      rotate: [0, 90, -90, 45, -45, 0, 0],
      scale: [1.5, 1.4, 1.6, 1.45, 1.55, 1.5, 1.5], // Maintain large size with pulse
      
      // Simulate a quick, glitched shape change
      borderRadius: ["50%", "10%", "90%", "30%", "70%", "50%", "50%"], 

      transition: {
        duration: 0.5, // Each cycle is fast
        ease: "linear",
        repeat: 4, // Repeats 4 times (5 cycles total = 2.5s duration)
        repeatType: "reverse",
      },
    },

    // Phase 3: Exit state to top-left (4.5s to 5.7s)
    exit: {
      // 1. Target values
      rotate: 720,
      // 2. Move to top-left logo position
      x: "calc(-50vw + 70px)", 
      y: "calc(-50vh + 42px)", 
      scale: 0.15, // Shrink to typical logo icon size
      borderRadius: "50%", // Ensure it's a clean circle when settling

      // 🔑 NEW: Set final opacity to 0 (invisible)
      opacity: 0, 

      // Combined transition block (1.2 seconds total for this phase)
      transition: {
        // Rotation transition (0.5s)
        rotate: { duration: 0.5, ease: "linear" },
        // Positional/Scale transitions (0.7s, starts after 0.5s rotation)
        x: { duration: 0.7, delay: 0.5, ease: "easeOut" },
        y: { duration: 0.7, delay: 0.5, ease: "easeOut" },
        scale: { duration: 0.7, delay: 0.5, ease: "easeOut" },
        borderRadius: { duration: 0.7, delay: 0.5, ease: "easeOut" },
        
        // 🔑 NEW: Fade the logo out during the final move
        opacity: { duration: 0.5, delay: 0.7, ease: "easeOut" }, 
      },
    },
  };

// --- Effect Hook for Timing (Unchanged from original) ---

  useEffect(() => {
    // Trigger the exit sequence at 4.5s (2.0s grow + 2.5s stream)
    const rotationMoveTimer = setTimeout(() => {
      setShow(false);
    }, 4500); 

    // Call onFinish after the entire 6.0s sequence completes
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 6000); 

    return () => {
      clearTimeout(rotationMoveTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  // --- Render (Unchanged) ---

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          // Fixed full-screen container for the splash effect with blur
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
            backdropFilter: "blur(10px)", // The blur effect
            WebkitBackdropFilter: "blur(10px)", // For Safari support
            zIndex: 9999,
          }}
          // Backdrop fades out during the final move
          transition={{ duration: 0.7, delay: 5.3 }} // Starts fading late for a cleaner transition
          exit={{ opacity: 0 }}
        >
          <motion.div
            variants={logoAnimation}
            initial="initial"
            // Play 'slowGrow' then 'dataStream', then 'exit'
            animate={["slowGrow", "dataStream"]} 
            exit="exit"
            style={{
              position: "absolute",
              cursor: "pointer",
              width: "100px", 
              height: "100px",
              color: "cyan",
              // Initial styles. Will be overridden by variants
              borderRadius: "50%",
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.7)",
            }}
          >
            <OmiVerceAiLogoIcon />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;