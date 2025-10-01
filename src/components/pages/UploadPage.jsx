// import React, { useState, useCallback } from 'react';

// // Helper function for exponential backoff during API calls
// const fetchWithBackoff = async (url, options, maxRetries = 5) => {
//     let delay = 1000;
//     for (let i = 0; i < maxRetries; i++) {
//         try {
//             const response = await fetch(url, options);
//             if (response.status === 429 && i < maxRetries - 1) {
//                 console.warn(`Rate limit hit, retrying in ${delay / 1000}s...`);
//                 await new Promise(resolve => setTimeout(resolve, delay));
//                 delay *= 2; 
//                 continue;
//             }
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response;
//         } catch (error) {
//             if (i === maxRetries - 1) throw error;
//             await new Promise(resolve => setTimeout(resolve, delay));
//             delay *= 2;
//         }
//     }
//     throw new Error("API call failed after maximum retries.");
// };

// // --- Main Application Component ---
// const CodeGenrator   = () => {
//     const [prompt, setPrompt] = useState("Write a compelling 500-word blog post introduction about the future of green energy in 2025.");
//     const [systemInstruction, setSystemInstruction] = useState("Act as a professional content writer and marketing expert. Your tone should be engaging and authoritative.");
//     const [useGoogleSearch, setUseGoogleSearch] = useState(true);
//     const [resultText, setResultText] = useState('');
//     const [sources, setSources] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // --- LLM API Call Function ---
//     const generateContent = useCallback(async () => {
//         if (!prompt.trim()) {
//             setError("The prompt cannot be empty.");
//             return;
//         }

//         setIsLoading(true);
//         setResultText('');
//         setSources([]);
//         setError(null);

//         // MANDATORY: Set apiKey to empty string for secure injection by the platform.
//         const apiKey = ""; 
//         const apiUrl = ``;

//         // Build the payload
//         const payload = {
//             contents: [{ parts: [{ text: prompt }] }],
//             systemInstruction: {
//                 parts: [{ text: systemInstruction || "You are a helpful and concise assistant." }]
//             },
//         };

//         // Conditionally add the Google Search grounding tool
//         if (useGoogleSearch) {
//             payload.tools = [{ "google_search": {} }];
//         }

//         try {
//             const response = await fetchWithBackoff(apiUrl, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });

//             const result = await response.json();
//             const candidate = result.candidates?.[0];

//             if (candidate && candidate.content?.parts?.[0]?.text) {
//                 const text = candidate.content.parts[0].text;
//                 setResultText(text);

//                 // Extract grounding sources
//                 let extractedSources = [];
//                 const groundingMetadata = candidate.groundingMetadata;
//                 if (groundingMetadata && groundingMetadata.groundingAttributions) {
//                     extractedSources = groundingMetadata.groundingAttributions
//                         .map(attribution => ({
//                             uri: attribution.web?.uri,
//                             title: attribution.web?.title,
//                         }))
//                         .filter(source => source.uri && source.title);
//                 }
//                 setSources(extractedSources);

//             } else {
//                 setError("Could not generate content. Check your prompt or the API response structure.");
//             }
//         } catch (err) {
//             console.error("API Call Error:", err);
//             setError(`An error occurred: ${err.message}.`);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [prompt, systemInstruction, useGoogleSearch]);

//     // --- Render Component ---
//     return (
//         <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 sm:p-8 font-inter">
//             {/* Inject Tailwind Font */}
//             <style>
//                 {`
//                     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
//                     .font-inter { font-family: 'Inter', sans-serif; }
//                     /* Custom scrollbar for dark theme */
//                     .result-output::-webkit-scrollbar { width: 8px; }
//                     .result-output::-webkit-scrollbar-thumb { background-color: #0d9488; border-radius: 4px; }
//                     .result-output::-webkit-scrollbar-track { background-color: #1f2937; }
//                 `}
//             </style>

//             <div className="w-full max-w-7xl flex flex-col gap-10">
                
//                 {/* Header */}
//                 <header className="text-center mb-4">
//                     <h1 className="text-5xl font-extrabold text-white leading-tight">
//                         <span className="text-teal-400">Bolt</span> AI Creator
//                     </h1>
//                     <p className="mt-2 text-xl text-gray-400">
//                         Generate high-quality content using advanced grounding and system instructions.
//                     </p>
//                 </header>

//                 {/* Main Grid: Controls (Left) & Output (Right) */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
//                     {/* LEFT COLUMN: Controls and Configuration */}
//                     <div className="lg:col-span-1 flex flex-col gap-6">
                        
//                         <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
//                             <h2 className="text-2xl font-bold text-teal-400 mb-4">System Persona (Optional)</h2>
//                             <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-400 mb-2">
//                                 Define the AI's role, tone, and formatting rules.
//                             </label>
//                             <textarea
//                                 id="system-instruction"
//                                 rows="3" 
//                                 className="w-full p-3 border border-gray-600 bg-gray-900 rounded-xl focus:ring-teal-400 focus:border-teal-400 text-white shadow-inner resize-none transition duration-150"
//                                 value={systemInstruction}
//                                 onChange={(e) => setSystemInstruction(e.target.value)}
//                                 placeholder="e.g., Act as a senior marketing VP. Respond in bullet points."
//                                 disabled={isLoading}
//                             ></textarea>
//                         </div>

//                         <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
//                             <h2 className="text-2xl font-bold text-teal-400 mb-4">Settings</h2>
                            
//                             {/* Google Search Toggle */}
//                             <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
//                                 <div>
//                                     <p className="text-gray-200 font-semibold">Google Search Grounding</p>
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         Use real-time web information for up-to-date answers.
//                                     </p>
//                                 </div>
//                                 <label className="relative inline-flex items-center cursor-pointer ml-4">
//                                     <input 
//                                         type="checkbox" 
//                                         checked={useGoogleSearch} 
//                                         onChange={() => setUseGoogleSearch(!useGoogleSearch)} 
//                                         className="sr-only peer"
//                                         disabled={isLoading}
//                                     />
//                                     <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
//                                 </label>
//                             </div>
//                         </div>

//                         {/* Generate Button (Sticky on mobile) */}
//                         <div className="sticky bottom-0 bg-gray-950 p-4 -mx-4 -mb-4 lg:p-0 lg:m-0 lg:static">
//                              <button
//                                 onClick={generateContent}
//                                 disabled={isLoading}
//                                 className={`w-full py-4 px-6 rounded-xl text-white font-bold text-xl transition duration-300 shadow-teal-500/50 shadow-lg transform ${
//                                     isLoading
//                                         ? 'bg-teal-400 cursor-not-allowed opacity-70'
//                                         : 'bg-teal-600 hover:bg-teal-500 active:scale-[0.98]'
//                                 } flex items-center justify-center`}
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                         </svg>
//                                         Generating Content...
//                                     </>
//                                 ) : (
//                                     '⚡ Generate Content'
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* RIGHT COLUMN: Prompt and Output */}
//                     <div className="lg:col-span-2 flex flex-col gap-6">
                        
//                         {/* Prompt Input */}
//                         <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
//                             <h2 className="text-2xl font-bold text-white mb-4">Prompt</h2>
//                             <textarea
//                                 id="prompt-input"
//                                 rows="5" 
//                                 className="w-full p-3 border border-gray-600 bg-gray-900 rounded-xl focus:ring-teal-400 focus:border-teal-400 text-white shadow-inner resize-none transition duration-150"
//                                 value={prompt}
//                                 onChange={(e) => setPrompt(e.target.value)}
//                                 placeholder="Describe the content you want to generate..."
//                                 disabled={isLoading}
//                             ></textarea>
//                         </div>

//                         {/* Output Display */}
//                         <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 flex-1 min-h-[400px]">
//                             <h2 className="text-2xl font-bold text-white mb-4">Result</h2>

//                             {error && (
//                                 <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded-lg mb-4" role="alert">
//                                     <p className="font-bold">Generation Error</p>
//                                     <p>{error}</p>
//                                 </div>
//                             )}

//                             {/* Generated Content */}
//                             <div className={`p-4 bg-gray-900 rounded-xl min-h-[300px] overflow-y-auto result-output text-gray-200 shadow-inner ${isLoading ? 'opacity-50' : ''}`}>
//                                 {resultText.length > 0 ? (
//                                     <div className="whitespace-pre-wrap">
//                                         {resultText}
//                                     </div>
//                                 ) : (
//                                     <div className="flex items-center justify-center h-[300px] text-gray-500">
//                                         {isLoading ? (
//                                             <p className="flex items-center">
//                                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                                 </svg>
//                                                 AI is drafting the content...
//                                             </p>
//                                         ) : (
//                                             "Your generated content will appear here after clicking 'Generate Content'."
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
                            
//                             {/* Sources/Grounding */}
//                             {sources.length > 0 && (
//                                 <div className="mt-4 p-3 bg-gray-900 rounded-xl border border-teal-700">
//                                     <p className="text-sm font-semibold text-teal-400 mb-2">Grounded Sources:</p>
//                                     <ul className="text-xs text-gray-400 list-inside space-y-1">
//                                         {sources.map((source, index) => (
//                                             <li key={index} className="truncate">
//                                                 <span className="text-teal-600 font-mono mr-1">[{index + 1}]</span>
//                                                 <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition duration-150">
//                                                     {source.title || source.uri}
//                                                 </a>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default CodeGenrator;
