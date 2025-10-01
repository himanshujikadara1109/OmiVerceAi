import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Code,
  MessageSquare,
  Images,
  Upload,
  Menu,
  X,
  BookOpen,
  Scissors ,
} from "lucide-react";
// import { BookOpen } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Text to Image", href: "/text-to-image", icon: <ImageIcon className="w-4 h-4" /> },
    { name: "Background Remover", href: "/bg-remover", icon: <Scissors className="w-4 h-4" /> },
    // { name: "Image to Image", href: "/image-to-image", icon: <ImageIcon className="w-4 h-4" /> },
    // { name: "Image to Video", href: "/image-to-video", icon: <Video className="w-4 h-4" /> },
    { name: "Code Generation", href: "/code-generation", icon: <Code className="w-4 h-4" /> },
    { name: "AI Chat", href: "/chat", icon: <MessageSquare className="w-4 h-4" /> },
    { name: "Story Mode", href: "/story-maker", icon: <BookOpen className='w-4 h-4'/>},
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Logo fast rotation animation on hover
  const logoVariants = {
    initial: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Text shift and color change animation on hover
  const textVariants = {
    initial: { x: 0, color: "#ffffff" },
    hover: {
      x: [0, 5, -5, 0],
      color: "#00ffff",
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-700">
      <div className="max-w-[120rem] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with fast rotation animation on hover */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center bg-[#00ffff] drop-shadow-[0_0_8px_cyan]"
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
            >
              <Sparkles className="w-5 h-5 text-black" />
            </motion.div>
            <motion.span
              className="text-3xl font-heading font-black text-white drop-shadow-[0_0_8px_cyan]"
              variants={textVariants}
              initial="initial"
              whileHover="hover"
            >
              OmiVerceAI
            </motion.span>
          </Link>

          {/* Desktop Navigation with increased gap and smaller links */}
          <nav className="hidden lg:flex items-center space-x-2 ml-20">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="xs"
                  className={`${
                    isActive(item.href)
                      ? "bg-[#004848] text-black"
                      : "text-secondary/80 hover:text-white hover:bg-gray-800"
                  } flex items-center space-x-1 font-paragraph text-sm`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation with single-column layout */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-gray-700 bg-black"
        >
          <div className="max-w-[120rem] mx-auto px-8 py-4">
            <nav className="grid grid-cols-1 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="xs"
                    className={`${
                      isActive(item.href)
                        ? "bg-[#004b4b] text-black"
                        : "text-secondary/80 hover:text-white hover:bg-gray-800"
                    } w-full justify-start flex items-center space-x-1 font-paragraph text-sm`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;