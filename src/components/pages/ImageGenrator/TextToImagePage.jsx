import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Loader2,
  Download,
  RefreshCw,
  History,
  Eye,
  Trash,
  X,
  Star,
  Search,
} from "lucide-react";
import Futuristic3DBackground from "./Futuristic3DBackground";

const styles = [
  "Realistic",
  "3D Render",
  "Anime",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Cyberpunk",
  "Fantasy",
  "Abstract",
  "Vintage",
];

const surprisePrompts = [
  "A majestic dragon soaring through neon-lit clouds",
  "A cyberpunk samurai in a rain-soaked Tokyo street",
  "A magical forest with bioluminescent trees and floating crystals",
  "An astronaut exploring an alien planet with purple skies",
  "A steampunk airship flying over Victorian London",
  "A phoenix rising from digital flames",
  "An underwater city with glowing coral architecture",
  "A time traveler's workshop filled with mysterious gadgets",
  "A floating island with waterfalls cascading into the void",
  "A robot artist painting in a futuristic studio",
];

function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const mouse = useRef([0.5, 0.5]);

  // Mouse tracking for 3D background
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current = [
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight,
      ];
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Load saved images from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("imageHistory");
    if (saved) setImages(JSON.parse(saved));
  }, []);

  // Save images to localStorage
  useEffect(() => {
    localStorage.setItem("imageHistory", JSON.stringify(images));
  }, [images]);

  const generateImage = async (
    customPrompt,
    customStyle,
    isRegenerate = false,
    imageId
  ) => {
    const textPrompt = customPrompt || prompt;
    const style = customStyle || selectedStyle;
    if (!textPrompt.trim()) return;

    if (isRegenerate && imageId) setRegeneratingId(imageId);
    else setIsGenerating(true);

    try {
      const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
        method: "POST",
        headers: {
          "x-api-key": "87dc4ac007cb920ac12d57bb9638c26631cd9968cca8c75fbd86a5e29574b0c647d30e8f2b6c8f119d258257a3468269", // Use env variable in production
        },
        body: (() => {
          const formData = new FormData();
          formData.append(
            "prompt",
            `${textPrompt}, ${style.toLowerCase()} style`
          );
          return formData;
        })(),
      });

      let imageUrl;
      if (response.ok) {
        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      } else {
        imageUrl =
          "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=512&h=512&fit=crop";
      }

      const newImage = {
        id: imageId || Date.now().toString(),
        url: imageUrl,
        prompt: textPrompt,
        style,
        timestamp: Date.now(),
        favorite: false,
      };

      if (isRegenerate && imageId) {
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? newImage : img))
        );
      } else {
        setImages((prev) => [newImage, ...prev]);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }

    setIsGenerating(false);
    setRegeneratingId(null);
  };

  const surpriseMe = () => {
    setPrompt(
      surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]
    );
    setSelectedStyle(styles[Math.floor(Math.random() * styles.length)]);
  };

  const downloadImage = async (imageUrl, prompt) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${prompt.slice(0, 30)}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const deleteImage = (id) =>
    setImages((prev) => prev.filter((img) => img.id !== id));
  const toggleFavorite = (id) =>
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, favorite: !img.favorite } : img
      )
    );

  const filteredImages = images.filter((img) => {
    if (showFavoritesOnly && !img.favorite) return false;
    if (
      filterText &&
      !img.prompt.toLowerCase().includes(filterText.toLowerCase()) &&
      !img.style.toLowerCase().includes(filterText.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#0D0D0D] text-white overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Futuristic3DBackground />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-8">
        {/* Header */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Futuristic AI Image Generator
        </motion.h1>

        {/* Input Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl border border-cyan-400/30 shadow-xl flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your futuristic vision..."
            className="w-full p-3 sm:p-4 rounded-lg bg-black/40 border border-gray-700 text-white text-base sm:text-lg placeholder-gray-400 resize-none h-32 sm:h-36 md:h-40"
          />
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/40 border border-gray-700 text-white"
          >
            {styles.map((style) => (
              <option key={style}>{style}</option>
            ))}
          </select>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <motion.button
              onClick={surpriseMe}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold"
            >
              <Sparkles className="w-5 h-5" /> Surprise Me
            </motion.button>
            <motion.button
              onClick={() => generateImage()}
              disabled={isGenerating || !prompt.trim()}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl font-bold disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by prompt or style..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
            />
            <span className="text-sm">⭐ Favorites Only</span>
          </label>
        </div>

        {/* History Grid */}
        <div>
          {filteredImages.length ? (
            <>
              <motion.h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-cyan-400" /> Generated Images
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    className="bg-white/5 border border-cyan-400/20 rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-52 sm:h-56 md:h-64 object-cover cursor-pointer"
                      onClick={() => setViewImage(image)}
                    />
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-sm line-clamp-2">{image.prompt}</p>
                      <p className="text-xs text-cyan-300">
                        Style: {image.style}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() =>
                            generateImage(
                              image.prompt,
                              image.style,
                              true,
                              image.id
                            )
                          }
                          className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm"
                        >
                          {regeneratingId === image.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setViewImage(image)}
                          className="p-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(image.url, image.prompt)}
                          className="p-2 bg-pink-500/20 text-pink-300 rounded-lg text-sm"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="p-2 bg-red-500/20 text-red-300 rounded-lg text-sm"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(image.id)}
                          className={`p-2 rounded-lg text-sm ${
                            image.favorite
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 mt-20">
              🚀 No images match your filters.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative max-w-3xl w-full">
              <button
                className="absolute top-2 right-2 p-2 bg-red-500/20 rounded-full text-white"
                onClick={() => setViewImage(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={viewImage.url}
                alt={viewImage.prompt}
                className="rounded-xl max-h-[80vh] w-full object-contain"
              />
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">{viewImage.prompt}</p>
                <p className="text-sm text-cyan-300">
                  Style: {viewImage.style}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TextToImage;
