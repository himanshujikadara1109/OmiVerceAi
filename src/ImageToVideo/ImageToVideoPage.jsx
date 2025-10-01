import React, { useState } from "react";
import { motion } from "framer-motion";

const ImageToVideoPage = () => {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // 🔑 Hardcoded API key (no .env or backend)
  const API_KEY = "sk-da2ef73dcde4e8adacb15cbd7671a939";

  // PixVerse endpoints
  const PIXVERSE_UPLOAD_URL = "https://app-api.pixverse.ai/openapi/v2/image/upload";
  const PIXVERSE_VIDEO_URL = "https://app-api.pixverse.ai/openapi/v2/video/img/generate";
  const PIXVERSE_STATUS_URL = "https://app-api.pixverse.ai/openapi/v2/video/query";


  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setVideoUrl(null);
  };

  // STEP 1: Upload image to get img_id
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", image);

    const aiTraceId = crypto.randomUUID();

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: {
        "Ai-Trace-Id": aiTraceId,
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (data.ErrCode !== 0) throw new Error(data.ErrMsg || "Upload failed");
    return data.Resp.img_id;
  };

  // STEP 2: Create video generation task
  const generateVideoTask = async (img_id) => {
    const aiTraceId = crypto.randomUUID();

    const res = await fetch(GENERATE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Ai-Trace-Id": aiTraceId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "v3.5",
        prompt: prompt || "Animate this image in a cinematic smooth motion",
        img_id,
        duration: 5,
        quality: "720p",
        style: "3d_animation",
      }),
    });

    const data = await res.json();
    if (data.ErrCode !== 0) throw new Error(data.ErrMsg || "Generation failed");
    return data.Resp.video_id;
  };

  // STEP 3: Poll generation status
  const checkStatus = async (video_id) => {
    const aiTraceId = crypto.randomUUID();

    while (true) {
      const res = await fetch(`${CHECK_URL}?video_id=${video_id}`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Ai-Trace-Id": aiTraceId,
        },
      });
      const data = await res.json();

      if (data.ErrCode !== 0) throw new Error(data.ErrMsg || "Status check failed");

      const status = data.Resp.status;
      if (status === 1) return data.Resp.url; // ✅ Success
      if (status === 7) throw new Error("Moderation failed");
      if (status === 8) throw new Error("Video generation failed");

      setStatusMsg("⏳ Generating video... please wait...");
      await new Promise((r) => setTimeout(r, 5000)); // Wait 5s then check again
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);
    setStatusMsg("Uploading image...");

    try {
      const img_id = await uploadImage();
      setStatusMsg("Image uploaded. Creating video task...");
      const video_id = await generateVideoTask(img_id);
      setStatusMsg("Video task created. Generating video...");
      const url = await checkStatus(video_id);
      setVideoUrl(url);
      setStatusMsg("✅ Video generated successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert("❌ " + err.message);
      setStatusMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        PixVerse <span className="text-pink-500">Image → Video</span> Generator
      </motion.h1>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-lg flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm text-gray-300"
        />

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the motion or scene you want..."
          className="w-full p-3 rounded-xl bg-black/40 border border-white/20 focus:outline-none focus:border-pink-500 text-white"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition-all font-semibold"
        >
          {loading ? "Generating..." : "⚡ Generate Video"}
        </button>

        {statusMsg && <p className="text-sm text-gray-400 text-center mt-2">{statusMsg}</p>}
      </div>

      {videoUrl && (
        <motion.div
          className="mt-10 w-full max-w-2xl flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="rounded-xl shadow-2xl border border-white/20"
          />
          <a
            href={videoUrl}
            download
            className="mt-4 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 transition-all font-semibold"
          >
            ⬇️ Download Video
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default ImageToVideoPage;
