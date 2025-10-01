import React, { useState, useCallback, useEffect, useRef } from 'react';

// Define the comprehensive list of languages and frameworks (50+ options)
const LANGUAGES = [
    // Web & App Frameworks (Core Focus)
    'React', 'Angular', 'Vue.js', 'Svelte', 'Dart', 'Flutter', 'Ruby on Rails', 'Spring Boot', '.NET',
    
    // Core Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'PHP', 'C#', 'C', 'C++', 'Rust', 'Swift', 'Kotlin',
    'R', 'Scala', 'Haskell', 'Prolog', 'Clojure', 'Lua', 'Elixir', 'F#', 'Julia', 'Assembly', 'Perl',
    
    // Frontend / Styling
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'jQuery', 
    
    // Backend / Infrastructure / Data
    'Node.js', 'Express.js', 'Django', 'Flask', 'Ruby', 'Laravel', 'SQL', 'MongoDB Query', 'GraphQL', 'Solidity', 
    'Shell Script', 'PowerShell', 'Dockerfile', 'Kubernetes (YAML)', 'Terraform', 'Bash', 
    
    // Markup / Other
    'MATLAB', 'VHDL', 'Verilog', 'JSON', 'XML', 'Markdown'
];

// Helper function for exponential backoff during API calls
const fetchWithBackoff = async (url, options, maxRetries = 5) => {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText.substring(0, 100)}...`);
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.error(`Attempt ${i + 1} failed, retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    throw new Error("API call failed after maximum retries.");
};

// Helper function to parse code from markdown fences
const parseCodeContent = (code) => {
    const match = code.match(/^```([a-zA-Z\s.-]+)?\n([\s\S]*)\n```$/); 
    const lang = (match ? (match[1] || 'text') : 'text').toLowerCase().trim();
    const content = match ? match[2].trim() : code.trim();
    return { lang, content };
};

// --- Background Component for Starfield Animation ---
const Background3D = () => {
    const canvasRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const stars = useRef([]);
    const frameId = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Settings
        const numStars = 500;
        let starSpeed = 0.05;

        // Initialize stars
        const initStars = () => {
            stars.current = [];
            for (let i = 0; i < numStars; i++) {
                stars.current.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * 2000,
                    size: Math.random() * 2,
                    color: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`
                });
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        // Star drawing and update loop
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 10, 20, 0.9)'; // Dark blue background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            stars.current.forEach(star => {
                star.z -= starSpeed; 
                if (star.z <= 0) {
                    star.z = 2000;
                    star.x = Math.random() * canvas.width - canvas.width / 9;
                    star.y = Math.random() * canvas.height - canvas.height / 9;
                }

                const k = 1200 / star.z;
                let x = star.x * k + centerX;
                let y = star.y * k + centerY;

                const mouseX = (mousePos.current.x - centerX) * 0.05;
                const mouseY = (mousePos.current.y - centerY) * 0.05;
                x += mouseX * (1 - star.z / 2000);
                y += mouseY * (1 - star.z / 2000);

                const size = star.size * k;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();
            });

            frameId.current = requestAnimationFrame(draw);
        };

        // Event listener for mouse movement
        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        resizeCanvas();
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId.current);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-50 transition-opacity duration-500"
            style={{backgroundColor: '#0a0a14'}}
        />
    );
};

// --- Main Application Component ---
const CodeGenrator = () => {
    const [prompt, setPrompt] = useState("Write a simple responsive website layout with a dark theme and a prominent header using HTML and Tailwind CSS.");
    const [language, setLanguage] = useState("HTML");
    const [generatedCode, setGeneratedCode] = useState('');
    const [displayedCode, setDisplayedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [activeView, setActiveView] = useState('code');
    const [previewContent, setPreviewContent] = useState('');

    // --- EFFECT: Streaming Simulation (Typing Effect) ---
    useEffect(() => {
        if (!generatedCode || generatedCode === displayedCode) {
            setIsTyping(false);
            return;
        }

        setIsTyping(true);
        let index = 0;

        const interval = setInterval(() => {
            if (index < generatedCode.length) {
                setDisplayedCode(prev => prev + generatedCode[index]);
                index++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 8);

        return () => clearInterval(interval);
    }, [generatedCode]);

    // --- EFFECT: Handle Live Preview Preparation ---
    useEffect(() => {
        const { lang, content } = parseCodeContent(generatedCode);
        
        const webLanguages = ['html', 'javascript', 'js', 'react', 'angular', 'vue.js', 'svelte', 'css', 'tailwind css', 'markdown'];
        const isWebLanguage = webLanguages.includes(lang);

        if (content && isWebLanguage) {
            let htmlContent = '';

            const baseTemplate = (bodyContent, scriptContent = '') => `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { 
                            font-family: 'Inter', sans-serif; 
                            margin: 0; 
                            min-height: 100vh; 
                            background-color: #f7f7f7; 
                            padding: 1rem;
                        }
                    </style>
                </head>
                <body>
                    ${bodyContent}
                    ${scriptContent ? `<script>${scriptContent}</script>` : ''}
                </body>
                </html>
            `;
            
            if (['html', 'react', 'angular', 'vue.js', 'svelte', 'tailwind css'].includes(lang)) {
                htmlContent = baseTemplate(content);
            } else if (lang === 'javascript' || lang === 'js') {
                htmlContent = baseTemplate(`<p style="color: #1f2937;">JavaScript executed. Check the browser console (F12) for output.</p>`, content);
            } else if (lang === 'css') {
                htmlContent = baseTemplate(`<div id="css-demo" style="border: 4px solid #4f46e5; padding: 20px; transition: all 0.5s; background-color: #e5e7eb; border-radius: 8px;">
                        <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1e3a8a;">CSS Demo Block</h1>
                        <p style="color: #374151;">The CSS generated by the model is applied here. Try inspecting this element to see the rules.</p>
                    </div>`, `
                    const styleElement = document.createElement('style');
                    styleElement.innerHTML = \`${content}\`;
                    document.head.appendChild(styleElement);
                `);
            } else if (lang === 'markdown') {
                htmlContent = baseTemplate(`<div class="prose max-w-none p-4">${content.replace(/\n/g, '<br>')}</div>`);
            }

            setPreviewContent(htmlContent);
        } else {
            setPreviewContent('');
        }
    }, [generatedCode]);

    // --- LLM API Call Function ---
    const generateCode = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt to generate code.");
            return;
        }

        setIsLoading(true);
        setGeneratedCode('');
        setDisplayedCode('');
        setError(null);
        setIsCopied(false);
        setActiveView('code');

        const apiKey = "AIzaSyBdgM4C9q4evu8oeSGhd3vpbASEEuscKbs";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const userQuery = `Generate the following complete and runnable code in ${language}: ${prompt}`;
        const systemPrompt = "You are an expert software developer. The user will provide a request for code. Respond only with the complete code block requested, wrapped in standard Markdown code fences (```language\n...code...\n```). Do not include any preceding or following text, commentary, or explanation outside of the code block.";

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetchWithBackoff(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                let text = candidate.content.parts[0].text.trim();
                if (!text.startsWith('```')) {
                    const fallbackLang = language.toLowerCase().replace(/\s/g, '');
                    text = `\`\`\`${fallbackLang}\n${text}\n\`\`\``;
                }
                setGeneratedCode(text);
            } else {
                setError("Could not generate code. Please try a different prompt or check the response structure.");
            }
        } catch (err) {
            console.error("API Call Error:", err);
            setError(`An error occurred during generation: ${err.message}.`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, language]);

    // --- Utility Functions ---
    const copyToClipboard = () => {
        if (generatedCode) {
            let codeContent = generatedCode.replace(/^```[a-zA-Z\s.-]*\n?/, '').replace(/\n?```$/, '');
            const tempInput = document.createElement('textarea');
            tempInput.value = codeContent;
            document.body.appendChild(tempInput);
            tempInput.select();

            try {
                document.execCommand('copy');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Could not copy text: ', err);
                setError('Failed to copy code to clipboard.');
            }
            document.body.removeChild(tempInput);
        }
    };

    // --- Render Helpers ---
    const renderCodeBlock = (code) => {
        const { lang, content } = parseCodeContent(code);
        const langDisplay = lang.toUpperCase();

        return (
            <div className="bg-slate-10 p-4 rounded-b-2xl shadow-2xl relative h-full min-h-[400px]">
                <div className="flex justify-between items-center mb-4 text-sm font-mono text-gray-400">
                    <span className="bg-indigo-500 px-4 py-1 rounded-full text-white font-bold shadow-md">
                        {langDisplay}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded-lg transition duration-300 font-medium ${
                            isCopied ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-indigo-700/50 text-indigo-300'
                        } flex items-center shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98]`}
                        disabled={!generatedCode || isTyping}
                    >
                        {isCopied ? (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        )}
                        {isCopied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
                <pre className="overflow-x-auto text-sm text-gray-200 font-mono p-1 h-full max-h-[70vh] overflow-y-scroll code-output">
                    <code>
                        {content}
                        {isTyping && <span className="animate-ping inline-block w-2 h-4 bg-indigo-400 rounded-full ml-1 align-top"></span>}
                    </code>
                </pre>
            </div>
        );
    };

    const { lang: parsedLang, content: parsedContent } = parseCodeContent(generatedCode);
    const webLanguages = ['html', 'javascript', 'js', 'react', 'angular', 'vue.js', 'svelte', 'css', 'tailwind css', 'markdown'];
    const isWebLanguage = webLanguages.includes(parsedLang);
    const canShowPreview = generatedCode && (isWebLanguage || parsedContent.length > 0);

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 font-inter relative">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    .font-inter { font-family: 'Inter', sans-serif; }
                    .code-output::-webkit-scrollbar { height: 8px; width: 8px; }
                    .code-output::-webkit-scrollbar-thumb { background-color: #4f46e5; border-radius: 4px; }
                    .code-output::-webkit-scrollbar-track { background-color: #1e293b; }
                    .glow-text {
                        text-shadow: 0 0 10px rgba(99, 102, 241, 0.8), 0 0 20px rgba(99, 102, 241, 0.4);
                        transition: all 0.3s ease;
                    }
                    .glow-text:hover {
                        text-shadow: 0 0 15px rgba(129, 140, 248, 1), 0 0 30px rgba(129, 140, 248, 0.6);
                    }
                    .btn-pulse {
                        animation: pulse-glow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                    }
                    @keyframes pulse-glow {
                        0%, 100% {
                            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
                        }
                        50% {
                            box-shadow: 0 0 0 16px rgba(99, 102, 241, 0);
                        }
                    }
                    .input-glow:focus {
                        box-shadow: 0 0 0 2px #0f172a, 0 0 0 5px #6366f1;
                    }
                `}
            </style>

            <div className="w-full max-w-7xl flex flex-col z-10 relative">
                <Background3D />
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight glow-text">
                        <span className="text-indigo-400">Omi</span> Code Architect
                    </h1>
                    <p className="mt-2 text-xl text-slate-400">
                        Generate and preview code snippets in over 50 languages and frameworks.
                    </p>
                </header>

                {error && (
                    <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded-xl mb-8 shadow-md transition duration-300 hover:shadow-red-500/50" role="alert">
                        <p className="font-bold">Generation Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className="mb-8 flex-grow">
                    <div className="flex bg-slate-800 rounded-t-2xl overflow-hidden shadow-2xl sticky top-0 z-10">
                        <button
                            onClick={() => setActiveView('code')}
                            className={`flex-1 py-4 text-lg font-bold transition duration-300 transform ${
                                activeView === 'code'
                                    ? 'bg-indigo-600 text-white shadow-inner shadow-indigo-800'
                                    : 'text-slate-300 hover:bg-slate-700/50'
                            }`}
                        >
                            Generated Code
                        </button>
                        <button
                            onClick={() => canShowPreview && setActiveView('preview')}
                            disabled={!canShowPreview || isLoading || isTyping}
                            className={`flex-1 py-4 text-lg font-bold transition duration-300 transform ${
                                activeView === 'preview' && canShowPreview
                                    ? 'bg-indigo-600 text-white shadow-inner shadow-indigo-800'
                                    : 'text-slate-300 hover:bg-slate-700/50 disabled:text-slate-600 disabled:cursor-not-allowed'
                            }`}
                        >
                            Live Output Preview
                            {!canShowPreview && generatedCode && <span className="ml-2 text-xs opacity-70">(Loading...)</span>}
                        </button>
                    </div>

                    <div className="rounded-b-2xl shadow-2xl p-0">
                        {activeView === 'code' && (
                            <div className="p-0">
                                {generatedCode || isLoading ? renderCodeBlock(displayedCode) : (
                                    <div className="bg-slate-900 p-8 rounded-b-2xl text-slate-500 min-h-[400px] flex flex-col items-center justify-center space-y-4">
                                        <svg className="w-12 h-12 text-indigo-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                        <p className="text-xl">Ready to craft some magic?</p>
                                        <p className="text-sm">Enter your request below and select a language to start.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeView === 'preview' && (
                            <div className="p-0 min-h-[400px] rounded-b-2xl">
                                <div className="bg-white p-2 border-4 border-indigo-500 overflow-hidden w-full h-full rounded-b-2xl shadow-inner shadow-indigo-300/50">
                                    {isWebLanguage && previewContent ? (
                                        <iframe
                                            title="Live Code Preview"
                                            srcDoc={previewContent}
                                            sandbox="allow-scripts allow-forms allow-same-origin"
                                            className="w-full h-[65vh] border-0 bg-white rounded-lg"
                                        ></iframe>
                                    ) : parsedContent ? (
                                        <div className="bg-slate-100 p-6 w-full h-[65vh] overflow-y-scroll text-gray-800 rounded-lg">
                                            <h3 className="font-bold text-xl mb-3 border-b pb-2 border-indigo-400 text-slate-800">
                                                Code Output ({parsedLang.toUpperCase()} File)
                                            </h3>
                                            <p className="text-sm text-slate-600 mb-4">
                                                *This is a file preview, as **{parsedLang.toUpperCase()}** code cannot be executed directly in the browser.*
                                            </p>
                                            <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded-lg border border-slate-300 shadow-inner">
                                                {parsedContent}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-100 p-8 w-full h-[65vh] flex items-center justify-center text-slate-500 rounded-lg">
                                            Preview will appear here when web code is generated.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800">
                    <h2 className="text-3xl font-bold text-slate-200 mb-6">Input Controls</h2>

                    <div className="bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl border border-indigo-900/50 transition duration-300 hover:shadow-indigo-500/20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="md:col-span-1">
                                <label htmlFor="language-select" className="block text-lg font-medium text-indigo-300 mb-2">
                                    Select Language/Framework:
                                </label>
                                <div className="relative">
                                    <select
                                        id="language-select"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full p-3 border border-slate-700 bg-slate-950 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-inner transition duration-150 appearance-none pr-10 input-glow"
                                        disabled={isLoading || isTyping}
                                    >
                                        {LANGUAGES.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-3 flex items-end">
                                <button
                                    onClick={generateCode}
                                    disabled={isLoading || isTyping}
                                    className={`w-full py-3 px-6 rounded-xl text-white font-extrabold text-lg transition duration-300 shadow-xl transform ${
                                        (isLoading || isTyping)
                                            ? 'bg-indigo-400 cursor-wait btn-pulse'
                                            : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] hover:shadow-indigo-500/60'
                                    } flex items-center justify-center`}
                                >
                                    {(isLoading || isTyping) ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isLoading ? 'Waiting for AI...' : 'Typing Code...'}
                                        </>
                                    ) : (
                                        `Generate ${language} Code`
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="prompt-input" className="block text-lg font-medium text-indigo-300 mb-2">
                                Describe your Code Request:
                            </label>
                            <textarea
                                id="prompt-input"
                                rows="4"
                                className="w-full p-4 border border-slate-700 bg-slate-950 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-inner resize-none transition duration-150 input-glow"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={`e.g., A function to sort an array of objects by a 'price' key, written in ${language}...`}
                                disabled={isLoading || isTyping}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeGenrator;