import { useState, useRef } from "react";
import { Wand2, Sparkles, Eraser, ImageUp, Upload, Download, X } from "lucide-react";

const CLIPDROP_API_KEY = "45e7b58457548c5048a64ed44db264aaa808a377a103523b89e6dd148aed2d9aa4cfaaf87af29b0d17a0c544ce6c56ff";

const ENDPOINTS = {
  "remove-background": "https://clipdrop-api.co/remove-background/v1",
  upscale: "https://clipdrop-api.co/image-upscaling/v1/upscale",
  cleanup: "https://clipdrop-api.co/cleanup/v1",
};

async function processImage(file, operation) {
  const formData = new FormData();
  formData.append("image_file", file);

  try {
    const response = await fetch(ENDPOINTS[operation], {
      method: "POST",
      headers: {
        "x-api-key": CLIPDROP_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return await response.blob();
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error.message || "Unknown error"}`
    );
  }
}

function validateFile(file) {
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Please upload a valid image (JPEG, PNG, WebP)" };
  }
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be smaller than 10MB" };
  }
  return { valid: true };
}

function ImageUpload({ onImageSelect, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) onImageSelect(files[0]);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) onImageSelect(files[0]);
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${
          isDragging
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
          <Upload className={`w-12 h-12 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {isDragging ? "Drop your image here" : "Upload an image"}
          </p>
          <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP (Max 10MB)</p>
        </div>
      </div>
    </div>
  );
}

function ImageComparison({ originalImage, processedImage, onDownload, onReset }) {
  const operationLabels = {
    "remove-background": "Background Removed",
    upscale: "Image Upscaled",
    cleanup: "Image Cleaned",
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {operationLabels[processedImage.operation]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Compare your original and edited images
            </p>
          </div>
          <button
            onClick={onReset}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Original
            </h3>
            <div className="relative rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200">
              <img src={originalImage} alt="Original" className="w-full h-auto object-contain max-h-96" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Edited
            </h3>
            <div className="relative rounded-xl overflow-hidden bg-gray-50 border-2 border-blue-200">
              <img src={processedImage.url} alt="Edited" className="w-full h-auto object-contain max-h-96" />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl
              hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Download Edited Image
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageToImage() {
  const [imageState, setImageState] = useState({
    original: null,
    processed: null,
    isProcessing: false,
    error: null,
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageSelect = (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setImageState({
        original: null,
        processed: null,
        isProcessing: false,
        error: validation.error,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageState({
        original: e.target?.result,
        processed: null,
        isProcessing: false,
        error: null,
      });
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async (operation) => {
    if (!selectedFile) return;
    setImageState((prev) => ({
      ...prev,
      isProcessing: true,
      error: null,
      processed: null,
    }));

    try {
      const blob = await processImage(selectedFile, operation);
      const url = URL.createObjectURL(blob);

      setImageState((prev) => ({
        ...prev,
        isProcessing: false,
        processed: { operation, url, blob },
      }));
    } catch (error) {
      setImageState((prev) => ({
        ...prev,
        isProcessing: false,
        error: error.message || "Failed to process image",
      }));
    }
  };

  const handleDownload = () => {
    if (!imageState.processed) return;
    const link = document.createElement("a");
    link.href = imageState.processed.url;
    link.download = `edited-image-${imageState.processed.operation}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (imageState.processed?.url) {
      URL.revokeObjectURL(imageState.processed.url);
    }
    setImageState({
      original: null,
      processed: null,
      isProcessing: false,
      error: null,
    });
    setSelectedFile(null);
  };

  const operations = [
    {
      id: "remove-background",
      label: "Remove Background",
      description: "Instantly remove background from your image",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "upscale",
      label: "Upscale Image",
      description: "Enhance resolution up to 4x with AI",
      icon: ImageUp,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "cleanup",
      label: "Cleanup Image",
      description: "Remove unwanted objects seamlessly",
      icon: Eraser,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ImageCraft AI
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional image editing powered by ClipDrop AI. Transform your images in seconds.
          </p>
        </div>

        {imageState.error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{imageState.error}</p>
          </div>
        )}

        {!imageState.original ? (
          <div className="max-w-2xl mx-auto">
            <ImageUpload onImageSelect={handleImageSelect} disabled={imageState.isProcessing} />
          </div>
        ) : !imageState.processed ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose an Editing Operation</h2>
                <p className="text-gray-600">Select how you want to transform your image</p>
              </div>

              <div className="mb-8">
                <img
                  src={imageState.original}
                  alt="Original"
                  className="w-full max-h-96 object-contain rounded-xl border-2 border-gray-200"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {operations.map((op) => {
                  const Icon = op.icon;
                  return (
                    <button
                      key={op.id}
                      onClick={() => handleProcessImage(op.id)}
                      disabled={imageState.isProcessing}
                      className={`group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-6
                        hover:border-transparent hover:shadow-xl transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${op.gradient} opacity-0
                        group-hover:opacity-10 transition-opacity duration-300`} />

                      <div className="relative">
                        <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${op.gradient}
                          flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{op.label}</h3>
                        <p className="text-sm text-gray-600">{op.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {imageState.isProcessing && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-700 font-semibold">Processing your image...</span>
                  </div>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <button
                  onClick={handleReset}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Upload a different image
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ImageComparison
            originalImage={imageState.original}
            processedImage={imageState.processed}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        )}

        <footer className="text-center mt-16 pb-8">
          <p className="text-gray-500 text-sm">
            Powered by ClipDrop API — Advanced AI Image Processing
          </p>
        </footer>
      </div>
    </div>
  );
}

export default ImageToImage;
