import React, { useState, useCallback, useMemo, useEffect } from 'react';

// --- Configuration ---
const PAGE_OPTIONS = [4, 6, 8, 10];
const LANGUAGES = [
    'English', 'Hindi (हिंदी)', 'Marathi (मराठी)', 'Gujarati (ગુજરાતી)', 'Bhojpuri (भोजपुरी)',
    'Punjabi (ਪੰਜਾਬੀ)', 'Bengali (বাংলা)', 'Kannada (ಕನ್ನಡ)', 'Telugu (తెలుగు)', 'Tamil (தமிழ்)',
    'Japanese (日本語)', 'Spanish (Español)', 'Chinese (中文)', 'Turkish (Türkçe)', 'Korean (한국어)'
];

// NOTE: Using the provided API key here.
const API_KEY = "AIzaSyBdgM4C9q4evu8oeSGhd3vpbASEEuscKbs"; 

// --- Utility Functions for TTS ---

// Function to convert Base64 to ArrayBuffer (for TTS)
const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// Function to convert PCM (raw audio data) to WAV format (for TTS)
const pcmToWav = (pcm16, sampleRate = 24000) => {
    const buffer = new ArrayBuffer(44 + pcm16.length * 2);
    const dataView = new DataView(buffer);
    let offset = 0;

    const writeString = (s) => {
        for (let i = 0; i < s.length; i++) {
            dataView.setUint8(offset + i, s.charCodeAt(i));
        }
        offset += s.length;
    };

    const writeUint32 = (i) => {
        dataView.setUint32(offset, i, true);
        offset += 4;
    };

    const writeUint16 = (i) => {
        dataView.setUint16(offset, i, true);
        offset += 2;
    };

    // RIFF chunk descriptor
    writeString('RIFF');
    writeUint32(36 + pcm16.length * 2); 
    writeString('WAVE');

    // fmt sub-chunk
    writeString('fmt ');
    writeUint32(16); 
    writeUint16(1);  // Audio format (1 for PCM)
    writeUint16(1);  // Number of channels
    writeUint32(sampleRate);
    writeUint32(sampleRate * 1 * 2); // Byte rate
    writeUint16(1 * 2); // Block alignment
    writeUint16(16); // Bits per sample

    // data sub-chunk
    writeString('data');
    writeUint32(pcm16.length * 2); // Data size

    // Write the PCM data
    for (let i = 0; i < pcm16.length; i++) {
        dataView.setInt16(offset, pcm16[i], true);
        offset += 2;
    }

    return new Blob([dataView], { type: 'audio/wav' });
};

// --- API Helper Function with Exponential Backoff ---
const callApiWithBackoff = async (url, payload, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return response.json();
            } else if (response.status === 429 && i < retries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                const errorBody = await response.text();
                throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// --- Main React Component ---
const StoryGenerator = () => {
    const [themeInput, setThemeInput] = useState('Fantasy quest, stolen artifact, grumpy wizard');
    const [storyInput, setStoryInput] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [textLoading, setTextLoading] = useState(false);
    const [comicLoading, setComicLoading] = useState(false);
    const [error, setError] = useState(null);
    const [audioLoading, setAudioLoading] = useState(false);
    
    // Comic Book State
    const [numPages, setNumPages] = useState(4); 
    const [generatedPages, setGeneratedPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isAutoReading, setIsAutoReading] = useState(false); // State for continuous mode
    
    // Download State
    const [currentAudioUrl, setCurrentAudioUrl] = useState('');

    const currentDialogue = useMemo(() => {
        return generatedPages[currentPage]?.dialogue || '';
    }, [generatedPages, currentPage]);

    const isFirstPage = currentPage === 0;
    const isLastPage = generatedPages.length > 0 && currentPage === generatedPages.length - 1;

    // Helper component for loading spinner
    const LoadingSpinner = () => (
        <div className="flex items-center space-x-2 text-indigo-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
        </div>
    );
    
    // --- Download Helpers ---
    const downloadHelper = (url, filename) => {
        if (!url) {
            setError("No media available for download on this page.");
            return;
        }
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadScript = () => {
        if (!storyInput) {
            setError("No script generated to download.");
            return;
        }
        const blob = new Blob([storyInput], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadHelper(url, `comic_script_${Date.now()}.txt`);
        URL.revokeObjectURL(url); // Clean up the URL object
    };

    const downloadCurrentPanel = () => {
        const currentImageUrl = generatedPages[currentPage]?.url;
        if (currentImageUrl && currentImageUrl.startsWith('data:')) {
            // Data URL is the base64 encoded image data
            downloadHelper(currentImageUrl, `comic_panel_pg${currentPage + 1}.png`);
        } else {
            setError("Image not ready or invalid format for download.");
        }
    };

    const downloadCurrentAudio = () => {
        if (currentAudioUrl) {
            downloadHelper(currentAudioUrl, `page_${currentPage + 1}_dialogue.wav`);
        } else {
            setError("Please generate and play the dialogue first to cache the audio for download.");
        }
    };
    
    // --- Core TTS Function with Auto-Advance Logic ---
    const playDialogue = useCallback(async (dialogue, autoAdvance) => {
        if (!dialogue) {
            if (autoAdvance) setIsAutoReading(false);
            return;
        }

        setAudioLoading(true);
        setCurrentAudioUrl(''); // Clear previous audio URL
        setError(null);

        const payload = {
            contents: [{
                parts: [{ text: `Say this text clearly and with an appropriate tone for a comic book: ${dialogue}` }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Puck" } // Upbeat, friendly voice
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;

        try {
            const result = await callApiWithBackoff(apiUrl, payload);
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const match = mimeType.match(/rate=(\d+)/);
                const sampleRate = match ? parseInt(match[1], 10) : 24000;
                const pcmData = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmData);
                const wavBlob = pcmToWav(pcm16, sampleRate);
                const url = URL.createObjectURL(wavBlob);
                
                setCurrentAudioUrl(url); // Store the generated audio URL for download
                
                const audio = new Audio(url);
                
                if (autoAdvance && !isLastPage) {
                    audio.onended = () => {
                        // Advance page and let useEffect pick up the change
                        setCurrentPage(p => p + 1);
                    };
                } else if (autoAdvance && isLastPage) {
                     audio.onended = () => {
                        // If it's the last page, stop the read-along mode
                        setIsAutoReading(false);
                    };
                }

                audio.play().catch(e => console.error("Audio playback failed:", e));

            } else {
                setError("Failed to generate audio: Invalid response from TTS API.");
            }
        } catch (e) {
            console.error("TTS generation error:", e);
            setError(`An error occurred during audio generation: ${e.message}`);
            setIsAutoReading(false); // Stop auto-reading on error
        } finally {
            setAudioLoading(false);
        }
    }, [isLastPage, currentPage, generatedPages.length]);

    // --- useEffect for Continuous Read-Along Mode ---
    useEffect(() => {
        if (isAutoReading && generatedPages.length > 0) {
            playDialogue(currentDialogue, true);
        }
    }, [currentPage, isAutoReading, generatedPages, currentDialogue, playDialogue]);
    
    // --- Page Change handler to clear audio URL ---
    useEffect(() => {
        // Clear audio URL when page changes or component mounts
        setCurrentAudioUrl('');
    }, [currentPage]);

    // --- Button Handlers ---
    const startReadAlong = () => {
        if (isAutoReading) {
            setIsAutoReading(false);
        } else {
            // Start the continuous read-along loop
            setIsAutoReading(true);
            // The useEffect hook handles calling playDialogue
        }
    };
    
    // Function to replay dialogue for the current page without advancing
    const replayDialogue = () => {
        setIsAutoReading(false); // Stop auto-reading if user clicks replay
        playDialogue(currentDialogue, false);
    };

    const nextPage = useCallback(() => {
        setIsAutoReading(false); // Stop auto-reading if user manually changes page
        setCurrentAudioUrl(''); // Clear cached audio
        setCurrentPage(p => Math.min(p + 1, generatedPages.length - 1));
    }, [generatedPages.length]);

    const prevPage = useCallback(() => {
        setIsAutoReading(false); // Stop auto-reading if user manually changes page
        setCurrentAudioUrl(''); // Clear cached audio
        setCurrentPage(p => Math.max(p - 1, 0));
    }, []);
    
    // --- Prompt & Story Generation Functions (Unchanged Logic) ---

    const generatePrompt = useCallback(async () => {
        setTextLoading(true);
        setError(null);
        setGeneratedPages([]);
        setCurrentPage(0);

        const userQuery = `Generate a detailed, compelling, and unique creative writing prompt based on the following themes and keywords: "${themeInput}". The prompt should include a clear setting, a main character description, the core conflict, and the stakes involved. The final output must be only the writing prompt text itself, starting with "Prompt:". **IMPORTANT: Ensure all output text is strictly in ${selectedLanguage}**.`;
        const systemPrompt = "You are 'The Muse\'s Engine,' a world-class storyteller and prompt engineer. Your goal is to inspire writers by crafting richly detailed and engaging story starters. Use real-world knowledge and creative flair to make the prompt evocative. Always respond professionally and concisely.";

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

        try {
            const result = await callApiWithBackoff(apiUrl, payload);
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                if (storyInput === '') {
                    setStoryInput(text.replace('Prompt:', '').trim());
                }
            } else {
                setError("Failed to generate prompt: The model returned an empty response.");
            }
        } catch (e) {
            console.error("Prompt generation error:", e);
            setError(`An error occurred: ${e.message}`);
        } finally {
            setTextLoading(false);
        }
    }, [themeInput, storyInput, selectedLanguage]);

    const continueStory = useCallback(async () => {
        if (!storyInput) {
            setError("Please write a sentence or generate a prompt first.");
            return;
        }

        setTextLoading(true);
        setError(null);
        setGeneratedPages([]);
        setCurrentPage(0);

        const userQuery = `The following text is the start of a story. Creatively continue it with a single, compelling paragraph of no more than 4-5 sentences: "${storyInput}". **IMPORTANT: Ensure the continuation text is strictly in ${selectedLanguage}**.`;
        const systemPrompt = "You are a continuation engine, seamlessly and creatively extending narratives while maintaining the established tone and voice.";

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

        try {
            const result = await callApiWithBackoff(apiUrl, payload);
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                const newStoryText = storyInput + "\n\n" + text;
                setStoryInput(newStoryText);
            } else {
                setError("Failed to continue story: The model returned an empty response.");
            }
        } catch (e) {
            console.error("Story continuation error:", e);
            setError(`An error occurred: ${e.message}`);
        } finally {
            setTextLoading(false);
        }
    }, [storyInput, selectedLanguage]);

    const generateComicStrip = useCallback(async () => {
        if (!storyInput || storyInput.length < 50) {
            setError("Please write at least 50 characters of story text before generating a comic book.");
            return;
        }

        setIsAutoReading(false); // Stop any ongoing reading mode
        setComicLoading(true);
        setError(null);
        setGeneratedPages([]);
        setCurrentPage(0);
        setCurrentAudioUrl('');

        try {
            // 1. Scene Breakdown using Gemini (Structured JSON)
            const scenePrompt = `Analyze the following story text and divide it into ${numPages} distinct, highly visual scenes suitable for a comic book. For each scene, provide:
1. An "imagePrompt" (max 20 words) that describes the VISUALS, setting, characters, and action.
2. A "dialogue" string containing the caption/text/speech bubble content for that panel.
**IMPORTANT: Ensure all output dialogue is strictly in ${selectedLanguage}**.
Story: "${storyInput}"`;

            const geminiPayload = {
                contents: [{ parts: [{ text: scenePrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "imagePrompt": { "type": "STRING", "description": "The detailed visual generation prompt." },
                                "dialogue": { "type": "STRING", "description": "The text/dialogue to be placed inside the comic panel." }
                            },
                            "propertyOrdering": ["imagePrompt", "dialogue"]
                        }
                    }
                }
            };

            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

            const sceneResult = await callApiWithBackoff(geminiApiUrl, geminiPayload);
            const jsonText = sceneResult.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!jsonText) {
                throw new Error("Failed to generate scene descriptions from story text.");
            }

            // Parse and safely slice the results
            let scenes;
            try {
                scenes = JSON.parse(jsonText).slice(0, numPages); 
            } catch (e) {
                console.error("JSON parsing error:", e);
                throw new Error("Failed to parse scene breakdown. Please try again with a simpler story.");
            }
            

            const newPages = [];
            // --- SWITCHING TO gemini-2.5-flash-image-preview FOR FREE TIER ACCESS ---
            const geminiImageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`;
            
            // 2. Sequential Image Generation (Gemini Image Model)
            for (const [index, scene] of scenes.entries()) {
                // Combine visual prompt and dialogue, instructing the model on the style
                const combinedPrompt = `A single, high-quality, colorful comic book panel illustration, dramatic lighting, 16:9 aspect ratio. The caption or speech bubble must explicitly contain this exact text: "${scene.dialogue}". Scene visuals: ${scene.imagePrompt}.`;

                const geminiImagePayload = {
                    contents: [{ parts: [{ text: combinedPrompt }] }],
                    generationConfig: {
                        responseModalities: ['TEXT', 'IMAGE']
                    },
                };

                const imageResult = await callApiWithBackoff(geminiImageApiUrl, geminiImagePayload);
                
                // Extract base64 data from the gemini-2.5-flash-image-preview response structure
                const base64Data = imageResult?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

                if (base64Data) {
                    const imageUrl = `data:image/png;base64,${base64Data}`;
                    newPages.push({ url: imageUrl, imagePrompt: combinedPrompt, dialogue: scene.dialogue });
                    setGeneratedPages([...newPages]); // Update state iteratively
                } else {
                    console.warn(`Could not generate image for scene ${index + 1}.`);
                }
            }
            
            if (newPages.length === 0) {
                 setError("Successfully broke down scenes, but failed to generate any images.");
            }
            setCurrentPage(0); 

        } catch (e) {
            console.error("Comic Strip generation error:", e);
            setError(`An error occurred during comic generation: ${e.message}. Please check your story input and language selection. (Image model switched to: gemini-2.5-flash-image-preview)`);
        } finally {
            setComicLoading(false);
        }
    }, [storyInput, numPages, selectedLanguage]); 
    
    const isAnyLoading = textLoading || audioLoading || comicLoading;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-['Inter'] flex flex-col items-center">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                textarea, select {
                    font-family: 'Inter', sans-serif;
                }
                .btn-primary {
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
                }
                .card {
                    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
                }
                .page-turn-animation {
                    transition: opacity 0.3s ease-in-out;
                }
                `}
            </style>

            <header className="text-center mb-8 w-full max-w-7xl"> {/* Increased max-w */}
                <h1 className="text-5xl font-bold text-indigo-400">The Muse's Comic Engine</h1>
                <p className="text-xl text-gray-400 mt-2">Create a multi-page, multilingual digital comic book.</p>
            </header>

            <div className="w-full max-w-7xl space-y-8 flex flex-col lg:flex-row lg:space-x-8 lg:space-y-0">
                
                {/* LEFT COLUMN: Input and Controls - Now 25% on desktop */}
                <div className="lg:w-1/4 w-full space-y-8">
                    
                    {/* 1. Prompt Generation Section */}
                    <div className="card bg-gray-800 p-6 rounded-xl border border-indigo-700/50">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">1. Setup Language & Theme</h2>
                        
                        <div className="space-y-4">
                            {/* Language Selector */}
                            <div>
                                <label htmlFor="language-select" className="block text-gray-300 font-medium mb-1">Select Output Language:</label>
                                <select
                                    id="language-select"
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    disabled={isAnyLoading}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-50 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Theme Input */}
                            <div>
                                <label htmlFor="theme-input" className="block text-gray-300 font-medium mb-1">Themes & Keywords:</label>
                                <textarea
                                    id="theme-input"
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-50 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                                    rows="2"
                                    value={themeInput}
                                    onChange={(e) => setThemeInput(e.target.value)}
                                    placeholder="e.g., space opera, political intrigue..."
                                    disabled={isAnyLoading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={generatePrompt}
                                disabled={isAnyLoading}
                                className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {textLoading ? <LoadingSpinner /> : (
                                    <>✨ Generate Prompt</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 2. Story Writing and Action Section */}
                    <div className="card bg-gray-800 p-6 rounded-xl border border-indigo-700/50">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">2. Script & Generation</h2>
                        <p className="text-gray-400 mb-4 text-sm">Write your full story here in the selected language.</p>
                        <textarea
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-50 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                            rows="8"
                            value={storyInput}
                            onChange={(e) => setStoryInput(e.target.value)}
                            placeholder={`Start writing your story in ${selectedLanguage} (min 50 characters)...`}
                            disabled={isAnyLoading}
                        />
                        
                        {/* Page Selector */}
                        <div className="flex items-center space-x-3 mt-4 mb-4">
                            <label htmlFor="page-count" className="text-gray-300 font-medium">Pages:</label>
                            <select
                                id="page-count"
                                value={numPages}
                                onChange={(e) => setNumPages(parseInt(e.target.value, 10))}
                                disabled={isAnyLoading}
                                className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-50 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                {PAGE_OPTIONS.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            
                            {/* NEW: Script Download Button */}
                            <button
                                onClick={downloadScript}
                                disabled={!storyInput || isAnyLoading}
                                className="btn-primary bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                title="Download the full story script as a text file."
                            >
                                📄 Script
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                            <button
                                onClick={continueStory}
                                disabled={!storyInput || isAnyLoading}
                                className="btn-primary bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed sm:w-1/2 w-full text-sm"
                            >
                                {textLoading ? <LoadingSpinner /> : (
                                    <>✍️ Continue</>
                                )}
                            </button>
                            <button
                                onClick={generateComicStrip}
                                disabled={!storyInput || isAnyLoading || storyInput.length < 50}
                                title={storyInput.length < 50 ? "Write a bit more (min 50 chars)" : `Generate a ${numPages}-page comic book`}
                                className="btn-primary bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed sm:w-1/2 w-full text-sm"
                            >
                                 {comicLoading ? <LoadingSpinner /> : (
                                    <>📚 Generate Comic ({numPages} Pgs)</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>


                {/* RIGHT COLUMN: Comic Book Reader Output - Now 75% on desktop */}
                <div className="lg:w-3/4 w-full flex flex-col items-center">
                    <div className="card bg-gray-800 p-4 rounded-xl border border-gray-600 w-full flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-3 text-gray-100">Digital Comic Book Reader</h2>
                        {error && (
                            <div className="p-3 mb-4 bg-red-800 rounded-lg text-red-200 text-sm w-full">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {generatedPages.length > 0 ? (
                            <>
                                {/* Comic Page Display (Maximized Area) */}
                                <div className="relative w-full rounded-lg overflow-hidden border-4 border-indigo-500 shadow-2xl bg-gray-900 transition-all duration-500">
                                    <img 
                                        key={currentPage} 
                                        src={generatedPages[currentPage].url} 
                                        alt={`Comic Page ${currentPage + 1}`} 
                                        // Increased Max Height to 85vh
                                        className="w-full object-contain page-turn-animation opacity-100"
                                        style={{ aspectRatio: '16/9', maxHeight: '85vh', margin: 'auto' }}
                                    />
                                    
                                    {/* Page number overlay */}
                                    <div className="absolute bottom-3 right-4 text-lg font-mono bg-gray-900/80 text-white px-3 py-1 rounded-lg">
                                        Page {currentPage + 1} of {generatedPages.length}
                                    </div>
                                </div>
                                
                                {/* Navigation Controls */}
                                <div className="flex justify-between items-center mt-6 p-2 bg-gray-700 rounded-full w-full max-w-lg">
                                    {/* Previous Button */}
                                    <button
                                        onClick={prevPage}
                                        disabled={isFirstPage || isAnyLoading || isAutoReading}
                                        className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-full ${isFirstPage || isAutoReading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white btn-primary'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                        </svg>
                                        <span>Back</span>
                                    </button>

                                    {/* Auto-Read/Replay Button (Middle) */}
                                    <button
                                        onClick={isAutoReading ? startReadAlong : (isLastPage ? replayDialogue : startReadAlong)}
                                        disabled={isAnyLoading || !currentDialogue}
                                        className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-full text-white btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm 
                                            ${isAutoReading ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'}`}
                                        title={currentDialogue ? (isAutoReading ? "Click to stop the automatic reading." : "Click to start continuous, hands-free reading.") : "No dialogue to speak"}
                                    >
                                        {audioLoading ? '🔊 Speaking...' : (
                                            isAutoReading ? '🛑 Stop Reading' : (isLastPage ? '🔊 Replay' : '▶️ Auto-Read')
                                        )}
                                    </button>

                                    {/* Next Button */}
                                    <button
                                        onClick={nextPage}
                                        disabled={isLastPage || isAnyLoading || isAutoReading}
                                        className={`flex items-center space-x-2 px-4 py-2 font-bold rounded-full ${isLastPage || isAutoReading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white btn-primary'}`}
                                    >
                                        <span>Next</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* NEW: Download Controls */}
                                <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-lg">
                                    <button
                                        onClick={downloadCurrentPanel}
                                        disabled={isAnyLoading}
                                        className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-1"
                                        title="Download the current comic panel image (PNG)."
                                    >
                                        🖼️ Download Panel
                                    </button>
                                    <button
                                        onClick={downloadCurrentAudio}
                                        disabled={isAnyLoading || !currentAudioUrl}
                                        className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-1"
                                        title="Download the spoken dialogue for this page (WAV). Must play audio first."
                                    >
                                        🎧 Download Audio
                                    </button>
                                </div>
                                
                                <p className="mt-4 text-center text-gray-400 text-sm italic">
                                    Use the **Download Panel** and **Download Audio** features to create a video of your comic!
                                </p>
                            </>
                        ) : (
                            <div className="p-8 h-64 flex items-center justify-center w-full text-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
                                {comicLoading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <p>Select your **Language**, write your **Script**, choose the **Page Count**, and click **📚 Generate Comic**!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StoryGenerator;

