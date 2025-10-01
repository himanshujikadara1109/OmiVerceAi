import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Components
import Header from "./components/ui/Header.jsx";
import Footer from "./components/ui/Footer.jsx";
import SplashScreen from "./components/ui/SplashScreen.jsx";

import HomePage from "./components/pages/HomePage.jsx";
import TextToImagePage from "./components/pages/ImageGenrator/TextToImagePage.jsx";
import ImageToImagePage from "./components/pages/ImageToImagePage.jsx";
import ChatPage from "./components/pages/ChatPage.jsx";
import CodeGenrator from "./components/pages/CodeGenration/CodegenrationPage.jsx";
import StoryGenerator from "./components/pages/StoryGenetator.jsx";
import BackgroundRemover from "./components/pages/BackgroundRemover.jsx";

// 🚀 Alien/Robot Inspired Animations
const animations = {
  "/": {
    initial: { opacity: 0, y: -200, rotate: -30, scale: 0.2 },
    enter: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 8 } },
    exit: { opacity: 0, y: 200, rotate: 20, scale: 0.3 },
  },
  "/text-to-image": {
    initial: { opacity: 0, scale: 0.5, filter: "blur(10px)" },
    enter: { opacity: [0, 1, 0.8, 1], scale: [0.5, 1.2, 0.9, 1], filter: "blur(0px)", transition: { duration: 0.8 } },
    exit: { opacity: 0, scale: 0.4, filter: "blur(10px)" },
  },
  "/image-to-image": {
    initial: { opacity: 0, x: -100, rotate: -20 },
    enter: { opacity: 1, x: 0, rotate: [0, 15, -15, 10, -10, 0], transition: { duration: 1 } },
    exit: { opacity: 0, x: 150, rotate: 30 },
  },
  "/chat": { initial: { opacity: 0, x: -80, scale: 0.8 }, enter: { opacity: 1, x: [0, 5, -5, 3, -3, 0], scale: 1, transition: { duration: 0.6 } }, exit: { opacity: 0, x: 80 } },
  "/code-generation": { initial: { opacity: 0, skewX: -20, scale: 0.9 }, enter: { opacity: [0, 1, 0.3, 1], skewX: [0, -10, 10, -5, 0], scale: 1, transition: { duration: 0.7 } }, exit: { opacity: 0, skewX: 20 } },
  "/story-maker": { initial: { opacity: 0, rotateY: 180, scale: 0.5 }, enter: { opacity: 1, rotateY: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }, exit: { opacity: 0, rotateY: -180, scale: 0.5 } },
  "/bg-remover": { initial: { opacity: 0, clipPath: "circle(0% at 50% 50%)" }, enter: { opacity: 1, clipPath: "circle(150% at 50% 50%)", transition: { duration: 0.9, ease: "easeInOut" } }, exit: { opacity: 0, clipPath: "circle(0% at 50% 50%)" } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentAnimation =
    animations[Object.keys(animations).find((p) => location.pathname.startsWith(p))] || animations["/"];


  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={currentAnimation.initial}
        animate={currentAnimation.enter}
        exit={currentAnimation.exit}
        className="min-h-[80vh] p-6 rounded-xl shadow-md text-white"
        style={{ backgroundColor: "black" }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/text-to-image" element={<TextToImagePage />} />
          <Route path="/image-to-image" element={<ImageToImagePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/code-generation" element={<CodeGenrator />} />
          <Route path="/story-maker" element={<StoryGenerator />} />
          <Route path="/bg-remover" element={<BackgroundRemover />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [isSplashed, setIsSplashed] = useState(false);
  const handleSplashFinish = () => setIsSplashed(true);

  if (!isSplashed) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <Router>
      <Header />
      <main className="bg-black text-white min-h-screen">
        <AnimatedRoutes />
      </main>
      <Footer />
    </Router>
  );
}
