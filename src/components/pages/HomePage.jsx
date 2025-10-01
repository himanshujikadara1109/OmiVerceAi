import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Code,
  MessageSquare,
  Images,
  Zap,
  ArrowRight,
  BookOpen,
  Scissors,
} from "lucide-react";
import Background3D from "./Background3D";

const colors = {
  background: "bg-[#0A0A0AFF] border-[15px] border-black",
  foreground: "text-white",
};


const HomePage = () => {
  const controls = useAnimation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const mouse = useRef([0.5, 0.5]);
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

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    });
  }, [controls]);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Text-to-Image",
      description: "Generate stunning images from text prompts using AI.",
      link: "/text-to-image",
      color: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      icon: <Scissors className="w-8 h-8" />,
      title: "Image-to-Image",
      description: "Remove the Background of images with AI-powered tools.",
      link: "/bg-remover",
      color: "from-pink-500/20 to-pink-500/5",
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Image-to-Video",
      description: "Convert static images into dynamic animated videos.",
      link: "/image-to-video",
      color: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Code Generation",
      description: "Generate code snippets and solutions with AI assistance.",
      link: "/code-generation",
      color: "from-pink-500/20 to-pink-500/5",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chat Assistant",
      description: "Get creative guidance and support from our AI assistant.",
      link: "/ai-chat",
      color: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Story Maker",
      description: "View and manage all your generated content in one place.",
      link: "/gallery",
      color: "from-pink-500/20 to-pink-500/5",
    },
  ];

  const showcaseItems = [
    {
      title: "AI-Generated Artwork",
      image:
        "https://static.wixstatic.com/media/02c63c_4afb1567d18e4410982ad8c33f44d455~mv2.png",
      type: "Image",
    },
    {
      title: "Animated Video",
      image:
        "https://static.wixstatic.com/media/02c63c_d9e94e1444c24d569c7cb6fd40219faf~mv2.png",
      type: "Video",
    },
    {
      title: "Code Solution",
      image:
        "https://static.wixstatic.com/media/02c63c_9d43400969934201957268fabddba813~mv2.png",
      type: "Code",
    },
    {
      title: "Digital Art",
      image:
        "https://static.wixstatic.com/media/02c63c_577fe33754704a628a756cb89dea70d8~mv2.png",
      type: "Image",
    },
  ];

  return (
    <div
      className={`relative min-h-screen ${colors.background} ${colors.foreground} overflow-x-hidden`}
    >
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Background3D mouse={mouse} />
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section
          ref={heroRef}
          className="relative h-screen flex flex-col items-center justify-center text-center px-8 "
        >
          <motion.div className="mb-6">
            {["OmiVerce", "AI:", "Unleash", "Your", "Creative", "Chaos"].map(
              (word, index) => (
                <motion.span
                  key={index}
                  className="inline-block text-7xl md:text-9xl font-heading font-black text-white mr-4"
                  initial={{ opacity: 0, y: -50, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.5, delay: index * 0.1 },
                  }}
                >
                  {word}
                </motion.span>
              )
            )}
          </motion.div>
          <motion.p
            className="text-xl md:text-3xl text-gray-400 px-4 md:px-8 font-montserrat font-bold leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
          >
            Generate stunning images, create dynamic videos, write <br /> code,
            and chat with AI. The ultimate creative platform for <br /> digital
            artists and developers.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.2 } }}
          >
            <Link
              className="bg-[#00ffff] hover:bg-[#06ebeb] text-black w-[216px] h-[72px] flex items-center justify-center rounded-lg shadow-lg"
              to="/text-to-image"
            >
              Start Creating <Zap className="ml-3 w-5 h-5" />
            </Link>
            <Link
              className="w-[224px] h-[72px] flex items-center justify-center rounded-lg shadow-lg border-2 border-[#00ffff] hover:bg-[#4DF7F722] transition-all text-[#06ebeb]"
              to="/gallery"
            >
              Make Story <BookOpen className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* FEATURES Section */}
        <section className="py-32 px-8">
          <div className="max-w-[120rem] mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h1 className="text-6xl md:text-7xl font-heading font-black text-white mb-6">
                Creative Superpowers
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Unlock unlimited creative potential with our suite of AI-powered
                tools
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <Link to={feature.link}>
                    <Card className="bg-[#1A1A1A]/60 border-[#333]/40 hover:border-cyan-400/50 transition-all duration-300 h-full">
                      <CardContent className="p-8">
                        <div
                          className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                        >
                          <div className="text-cyan-400">{feature.icon}</div>
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-white mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400">{feature.description}</p>
                        <div className="mt-6 flex items-center text-cyan-400">
                          <span>Explore</span>
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SHOWCASE Section */}
        <section className="py-32 px-8 bg-[#1A1A1A]/40">
          <div className="max-w-[120rem] mx-auto">
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl md:text-7xl font-heading font-black text-white mb-6">
                Creative Showcase
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                See what's possible with OmiVerce AI
              </p>
            </motion.div>
            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar">
              {showcaseItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-80"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative overflow-hidden bg-[#1A1A1A]/60 rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={320}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-heading font-bold text-white mb-1">
                        {item.title}
                      </h3>
                      <span className="text-cyan-400 text-sm">{item.type}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-heading font-black text-white mb-8">
              Ready to Create?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Join thousands of creators already using OmiVerce AI to bring
              their ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/text-to-image"
                className="bg-[#00ffff] hover:bg-[#06ebeb] text-black w-[216px] h-[72px] flex items-center justify-center rounded-lg shadow-lg"
              >
                Start Creating <Zap className="ml-3 w-5 h-5" />
              </Link>
              <Link
                to="/code-generation"
                className="w-[224px] h-[72px] flex items-center justify-center rounded-lg shadow-lg border-2 border-[#00ffff] hover:bg-[#4DF7F722] transition-all text-[#06ebeb]"
              >
                Code-Generator <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
