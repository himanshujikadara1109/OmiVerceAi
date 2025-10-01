import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const footerLinks = {
    tools: [
      { name: "Text to Image", href: "/text-to-image" },
      // { name: "Image to Image", href: "/image-to-image" },
      // { name: "Image to Video", href: "/image-to-video" },
      { name: "Code Generation", href: "/code-generation" },
      { name: "Background Remover", href: "/bg-remover" },
    ],
    features: [
      { name: "AI Assistant", href: "/ai-chat" },
      { name: "Story Mode", href: "/story-make" },
    ],
  };

  return (
    <footer className="relative bg-black/90 border-t border-gray-800 text-white perspective-1000">
      <div className="max-w-[120rem] mx-auto px-8 py-16 transform-gpu rotate-x-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.5, rotate: [0, 15, -15, 0] }}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_cyan]"
              >
                <Sparkles className="w-6 h-6 text-black" />
              </motion.div>
              <span className="text-2xl font-heading font-black text-white tracking-wide drop-shadow-[0_0_10px_cyan]">
                OmiVerce AI
              </span>
            </div>
            <p className="font-paragraph leading-relaxed text-white/80 drop-shadow-md">
              Unleash your creative chaos with AI-powered image generation,
              video creation, and code development tools.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-3 text-white drop-shadow-[0_0_8px_cyan]">
              Creative Tools
            </h3>
            <ul className="space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`font-paragraph px-1 py-1 rounded-md transition-all duration-300 ${
                      isActive(link.href)
                        ? "text-cyan-400"
                        : "hover:text-cyan-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-3 text-white drop-shadow-[0_0_8px_cyan]">
              Features
            </h3>
            <ul className="space-y-2">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`font-paragraph px-1 py-1 rounded-md transition-all duration-300 ${
                      isActive(link.href)
                        ? "text-cyan-400"
                        : "hover:text-cyan-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-heading font-bold mb-3 text-white drop-shadow-[0_0_8px_cyan]">
              Connect
            </h3>
            <div className="space-y-4">
              <p className="font-paragraph text-white/80 drop-shadow-md">
                Ready to start creating? Join thousands of artists and developers using OmiVerce AI.
              </p>
              <Link to="/text-to-image">
                <Button className="bg-cyan-400 text-black border-0 hover:text-white hover:bg-cyan-500 shadow-lg hover:scale-105 transition-all duration-300">
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-white/60 text-sm drop-shadow-sm">
          <p>© {new Date().getFullYear()} OmiVerce AI. Unleashing creative chaos through AI.</p>
          <span className="mt-3 md:mt-0">Build by Himanshu Jikadara</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
