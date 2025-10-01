import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Loader2, X, Check, AlertCircle } from 'lucide-react';

// --- CSS Starfield Generation and Injection ---

// Helper function to generate a large string of box-shadows for stars
const generateStars = (n, minX, maxX, minY, maxY) => {
  let value = '';
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    // Set color to cyan/white for the futuristic look
    value += `${x}px ${y}px #FFF, ${x + 2000}px ${y + 2000}px #00FFFF${i < n - 1 ? ',' : ''}`;
  }
  return value;
};


// Fix 1: Generate star data OUTSIDE of the Starfield component
// and pass it to the static styles for immediate rendering.
const starsData = {
    stars1: generateStars(500, 0, 4000, 0, 4000),
    stars2: generateStars(150, 0, 4000, 0, 4000),
    stars3: generateStars(50, 0, 4000, 0, 4000),
};


// Component to inject the initial CSS (non-animated styles and the stars themselves)
const StarfieldBaseStyles = () => {
    const baseStyle = `
      .star-layer {
        position: fixed;
        top: 0;
        left: 0;
        background: transparent;
        border-radius: 50%;
        pointer-events: none;
        z-index: -10;
        transform-style: preserve-3d;
        transition: transform 0.1s linear; /* Add transition for smoother mouse tracking */
      }

      /* Inject static styles for each layer, including the box-shadows */
      .star-layer-1 {
        box-shadow: ${starsData.stars1};
        width: 2px;
        height: 2px;
      }
      .star-layer-2 {
        box-shadow: ${starsData.stars2};
        width: 3px;
        height: 3px;
        opacity: 0.8;
      }
      .star-layer-3 {
        box-shadow: ${starsData.stars3};
        width: 4px;
        height: 4px;
        opacity: 0.5;
      }
    `;
    
    return <style>{baseStyle}</style>;
}

// Component to inject the stars and manage mouse interaction
const Starfield = () => {
  // State to store the mouse position, centered at 0, 0
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 2. Add mouse movement listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized position relative to viewport center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Update state with a normalized value for better control
      setMousePosition({
        x: offsetX,
        y: offsetY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 3. Calculate dynamic styles for each layer based on mouse position
  // The 'depth' controls how much the layer moves (parallax effect).
  const depth1 = 0.05; // Furthest layer moves least (slowest)
  const depth2 = 0.15;
  const depth3 = 0.3; // Closest layer moves most (fastest)
  
  // We only need to apply the TRANSFORM style dynamically now, 
  // as the box-shadows are in the base CSS.
  const style1 = {
    transform: `translate3d(${-mousePosition.x * depth1}px, ${-mousePosition.y * depth1}px, 0)`,
  };

  const style2 = {
    transform: `translate3d(${-mousePosition.x * depth2}px, ${-mousePosition.y * depth2}px, 0)`,
  };

  const style3 = {
    transform: `translate3d(${-mousePosition.x * depth3}px, ${-mousePosition.y * depth3}px, 0)`,
  };


  return (
    <>
      {/* Inject Static CSS (includes star shadows) */}
      <StarfieldBaseStyles />
      {/* Apply dynamic transform styles to existing layers */}
      <div 
        className="star-layer star-layer-1" 
        style={style1} 
      />
      <div 
        className="star-layer star-layer-2" 
        style={style2} 
      />
      <div 
        className="star-layer star-layer-3" 
        style={style3} 
      />
    </>
  );
};

// --- Main React Component ---

const CLIPDROP_API_KEY = "4e77a9104452b2368a712dbf583408f358b95febfb3a20d11831fbb08534e320bee9d62e5686c204e2c81b9c830c135f"; // Intentionally empty as per instructions
const CLIPDROP_API_URL = "https://clipdrop-api.co/remove-background/v1";

function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    error: null,
    progress: 10,
  });
  const [isDragOver, setIsDragOver] = useState(false);

  // ... (rest of the logic remains unchanged)

  // Validate uploaded file
  const validateFile = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (PNG, JPG, or JPEG)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  // Handle file select
  const handleFileSelect = useCallback((file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setProcessingState({
        isProcessing: false,
        error: validationError,
        progress: 0,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setProcessedImage(null);
      setProcessingState({
        isProcessing: false,
        error: null,
        progress: 0,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag & Drop Handlers
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  // Process image (API Call)
  const processImage = async () => {
    if (!originalImage) return;

    setProcessingState({ isProcessing: true, error: null, progress: 0 });

    try {
      // Convert base64 to Blob
      const response = await fetch(originalImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image_file', blob);

      // Simulated progress
      const progressInterval = setInterval(() => {
        setProcessingState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const apiResponse = await fetch(CLIPDROP_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': CLIPDROP_API_KEY,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!apiResponse.ok) {
        let errorMessage = `API Error: ${apiResponse.status} ${apiResponse.statusText}`;
        try {
          const errorJson = await apiResponse.json();
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // Ignore if response is not JSON
        }
        throw new Error(errorMessage);
      }

      const processedBlob = await apiResponse.blob();
      const processedUrl = URL.createObjectURL(processedBlob);

      setProcessedImage(processedUrl);
      setProcessingState({ isProcessing: false, error: null, progress: 100 });
    } catch (error) {
      setProcessingState({
        isProcessing: false,
        error: error.message || 'Failed to process image. Please try again.',
        progress: 0,
      });
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `background-removed-cyber-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset app
  const resetApp = () => {
    setOriginalImage(null);
    if (processedImage) URL.revokeObjectURL(processedImage);
    setProcessedImage(null);
    setProcessingState({ isProcessing: false, error: null, progress: 0 });
  };

  // =====================================
  // 🧠 UI Layout
  // =====================================
  return (
    // Fix 2: Change the outer container from bg-transparent to bg-black
    <div className="min-h-screen bg-black text-gray-100 font-mono">
      {/* Starfield Background Component - Now Interactive */}
      <Starfield />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4 tracking-wider">
            :: Omi Background Removal :: 🌌
          </h1>
          <p className="text-base text-gray-400 max-w-3xl mx-auto">
            Initiate high-speed background matrix extraction. Upload image file for processing.
          </p>
        </div>

        {/* Main Content Area - Dark Translucent Card */}
        <div className="max-w-6xl mx-auto">
          {!originalImage ? (
            // Upload Section
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-2xl shadow-cyan-900/50 border border-cyan-500/30 p-8 md:p-12">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-cyan-400 bg-gray-800/70 scale-[1.02]'
                    : 'border-gray-600 hover:border-cyan-400 hover:bg-gray-800/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 bg-cyan-900/50 rounded-full border-4 border-cyan-400/50 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-2">Drag Image File to Initiate Upload</h3>
                    <p className="text-gray-400 mb-4">or click to browse local memory banks</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-flex items-center px-8 py-3 bg-cyan-600 text-black font-bold rounded-lg hover:bg-cyan-500 transition-colors cursor-pointer shadow-lg shadow-cyan-500/50"
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      SELECT FILE
                    </label>
                  </div>
                  <div className="text-sm text-gray-500 pt-4 border-t border-gray-700 w-full max-w-xs mx-auto">
                    <p>Allowed formats: PNG, JPG, JPEG</p>
                    <p>Max file size: 10MB</p>
                  </div>
                </div>
              </div>

              {processingState.error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center space-x-3 shadow-inner shadow-red-900">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300">ERROR: {processingState.error}</p>
                </div>
              )}
            </div>
          ) : (
            // Processing / Result Section
            <div className="space-y-8">
              {/* Controls */}
              <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-2xl shadow-cyan-900/50 border border-cyan-500/30 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-xl font-semibold text-cyan-400">
                    {processedImage ? 'PROCESS COMPLETE' : 'AWAITING INITIATION'}
                  </h2>
                  <div className="flex items-center space-x-4">
                    {!processedImage && (
                      <button
                        onClick={processImage}
                        disabled={processingState.isProcessing}
                        className="flex items-center px-6 py-3 bg-cyan-600 text-black font-bold rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/50"
                      >
                        {processingState.isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> EXECUTING...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 mr-2" /> START MATRIX DECONSTRUCTION
                          </>
                        )}
                      </button>
                    )}
                    {processedImage && (
                      <button
                        onClick={downloadImage}
                        className="flex items-center px-6 py-3 bg-lime-600 text-black font-bold rounded-lg hover:bg-lime-500 transition-colors shadow-lg shadow-lime-500/50"
                      >
                        <Download className="w-5 h-5 mr-2" /> DOWNLOAD ISOLATED ASSET
                      </button>
                    )}
                    <button
                      onClick={resetApp}
                      className="flex items-center px-4 py-3 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition-colors border border-gray-600/50"
                    >
                      <X className="w-5 h-5 mr-2" /> RE-INITIALIZE
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {processingState.isProcessing && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Processing queue status:</span>
                      <span className="text-sm text-cyan-400 font-bold">{processingState.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 border border-cyan-900">
                      <div
                        className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
                        style={{ width: `${processingState.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Comparison */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Original */}
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-2xl shadow-cyan-900/50 p-6 border border-cyan-500/30">
                  <div className="flex items-center space-x-3 mb-4 border-b border-gray-700 pb-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500 animate-pulse" />
                    <h3 className="text-lg font-semibold text-gray-200">INPUT ASSET (Original)</h3>
                  </div>
                  <img src={originalImage} alt="Original" className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-700/50" />
                </div>

                {/* Processed */}
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-2xl shadow-cyan-900/50 p-6 border border-cyan-500/30">
                  <div className="flex items-center space-x-3 mb-4 border-b border-gray-700 pb-2">
                    <div className={`w-3 h-3 rounded-full ${processedImage ? 'bg-lime-500 shadow-lg shadow-lime-500' : 'bg-gray-500'}`} />
                    <h3 className="text-lg font-semibold text-gray-200">
                      {processedImage ? 'OUTPUT ASSET (Cleaned)' : 'PROCESSING RESULT'}
                    </h3>
                    {processedImage && <Check className="w-5 h-5 text-lime-400" />}
                  </div>
                  <div className="relative bg-black/50 border-2 border-dashed border-gray-700 rounded-lg overflow-hidden min-h-48 flex items-center justify-center">
                    {processedImage ? (
                      <img src={processedImage} alt="Processed" className="w-full h-auto max-h-96 object-contain" />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-500">
                        {processingState.isProcessing ? (
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                            <p className="text-cyan-400">Deconstructing Matrix...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-gray-500">Processed asset will manifest here</p>
                          </div>
                        )}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-gray-500 text-sm">Powered by ClipDrop AI • Deployed on React Framework</p>
        </div>
      </div>
    </div>
  );
}

export default BackgroundRemover;