import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, User, Loader2, FileText, Briefcase, Zap } from 'lucide-react';

// The API key provided by the user.
const API_KEY = "AIzaSyBdgM4C9q4evu8oeSGhd3vpbASEEuscKbs";
const MODEL_NAME = "gemini-2.5-flash-preview-05-20"; // The underlying AI model used for generation.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

/**
 * Helper function for exponential backoff retry logic.
 * @param {Function} fn - The function to execute.
 * @param {number} maxRetries - Maximum number of retries.
 */
async function fetchWithRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Custom hook to scroll to the bottom of the chat when new messages arrive
const useScrollToBottom = (messages) => {
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return chatContainerRef;
};

// --- Component to display a single chat message ---
const ChatMessage = ({ role, text }) => {
    const isUser = role === 'user';
    const Icon = isUser ? User : Cpu;

    const neonColor = '#00ffff';

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div 
                // Increased padding and border visibility for 'screen' effect
                className={`max-w-3xl flex items-start gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out border border-opacity-90 ${
                    isUser 
                    ? 'bg-gray-900/90 text-white rounded-br-sm border-cyan-500/70' // User: Angled console input
                    : 'bg-gray-800/90 text-white rounded-tl-sm border-cyan-500' // AI: Prominent system display
                }`}
                style={{ 
                    // Adjusted shadows for a more defined, layered screen effect
                    boxShadow: isUser 
                        ? `0 0 5px ${neonColor}55, 0 0 2px #333333 inset` // Subtle inner panel light
                        : `0 0 18px ${neonColor}cc, 0 0 5px ${neonColor}77 inset`, // Intense screen/log glow
                    fontFamily: "'Courier New', monospace"
                }}
            >
                <div className={`p-2 rounded-full border border-opacity-50 ${isUser ? 'bg-gray-700 border-cyan-500' : 'bg-cyan-500 border-black'}`}>
                    <Icon className={`w-4 h-4 ${isUser ? 'text-cyan-400' : 'text-gray-900'}`} />
                </div>
                <div className="prose prose-sm break-words max-w-none text-white">
                    <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/(\*|\-)\s/g, '<li style="list-style: \'[ ] \';">') // Custom list style
                    }} />
                </div>
            </div>
        </div>
    );
};

// --- Reusable Control Panel Button Component ---
const NeonButton = ({ onClick, children, disabled, color, icon: Icon }) => {
    const neonColor = color || '#00ffff';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            // Added angular focus class and cyber-control button style
            className={`flex-1 flex items-center justify-center p-3 font-bold text-sm transition-all duration-150 ease-in-out uppercase tracking-widest
                text-black border border-opacity-50 cyber-control ${disabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'hover:scale-[1.02] active:translate-y-0.5'}`}
            style={{
                backgroundColor: disabled ? '#333333' : neonColor,
                borderColor: neonColor,
                boxShadow: disabled ? 'none' : `0 0 10px ${neonColor}AA`,
                fontFamily: "'Courier New', monospace",
                clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)', // Angular shape for button
            }}
        >
            {Icon && <Icon className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );
};


// --- Main Chat Application Component ---
const ChatPage = () => {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'INITIATING WARP CORE. OmiVerce AI online. **ACCESS GRANTED.**' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [himanshuBioStep, setHimanshuBioStep] = useState(0); 
    const chatContainerRef = useScrollToBottom(messages);
    const neonColor = '#00ffff';

    /**
     * Reusable function to call the Gemini API.
     */
    const callGeminiApi = async (contents, systemInstruction = null) => {
        const payload = {
            contents: contents,
        };
        
        if (systemInstruction) {
            payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const executeFetch = async () => {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorBody}`);
            }
            return response.json();
        };

        try {
            const result = await fetchWithRetry(executeFetch);
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "[[ERROR: SYSTEM RESPONSE FAILED]]";
        } catch (error) {
            console.error("API Call Failed:", error);
            throw new Error("Failed to connect to AI service. Check network/API configuration.");
        }
    };

    /**
     * Gemini-powered feature 1: Summarize the entire chat history.
     */
    const handleSummarizeChat = async () => {
        if (isLoading) return;
        
        const historyToSummarize = messages
            .slice(1) 
            .map(msg => `${msg.role === 'user' ? 'Pilot' : 'OmiVerce'}: ${msg.text}`)
            .join('\n');

        if (!historyToSummarize.trim()) {
             setMessages(prev => [...prev, { role: 'model', text: "[[ALERT: LOG BUFFER EMPTY]] Initiate query sequence." }]);
             return;
        }

        setIsLoading(true);

        const summaryPrompt = "Provide a concise, single-paragraph summary of the following chat conversation, adopting a technical, system-status reporting tone:\n\n" + historyToSummarize;
        const summaryStartMessage = { role: 'model', text: '✨ **SYSTEM LOG QUERY:** Processing Chat History Data Stream...' };
        setMessages(prev => [...prev, summaryStartMessage]);

        const contents = [{ role: 'user', parts: [{ text: summaryPrompt }] }];

        try {
            const text = await callGeminiApi(contents, "You are a diagnostic AI. Your summary must be concise and use system-like terminology.");
            
            setMessages(prev => {
                const tempRemoved = prev.filter(m => m !== summaryStartMessage);
                return [...tempRemoved, { role: 'model', text: `✨ **LOG SUMMARY COMPLETE:**\n\n${text}` }];
            });

        } catch (error) {
            setMessages(prev => {
                const tempRemoved = prev.filter(m => m !== summaryStartMessage);
                return [...tempRemoved, { role: 'model', text: "[[ERROR: LOG SUMMARIZATION FAILED]] Data integrity fault." }];
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Gemini-powered feature 2: Generate a formal, professional reply to the last user message.
     */
    const handleFormalReply = async () => {
        if (isLoading) return;
        
        const lastUserMessage = messages.slice().reverse().find(msg => msg.role === 'user');
        
        if (!lastUserMessage) {
            setMessages(prev => [...prev, { role: 'model', text: "[[ALERT: NO PILOT INPUT DETECTED]] Cannot formulate response." }]);
            return;
        }

        setIsLoading(true);
        const replyPrompt = `Generate a highly formal and professional reply to the following user message: "${lastUserMessage.text}"`;
        
        const formalStartMessage = { role: 'model', text: '✨ **COMMUNICATION RELAY:** Initiating Formal Protocol Matrix...' };
        setMessages(prev => [...prev, formalStartMessage]);

        const contents = [{ role: 'user', parts: [{ text: replyPrompt }] }];
        const systemInstruction = "You are a professional corporate liaison AI. Your response must be formal, authoritative, and utilize advanced vocabulary. Avoid all casual language.";

        try {
            const text = await callGeminiApi(contents, systemInstruction);

            setMessages(prev => {
                const tempRemoved = prev.filter(m => m !== formalStartMessage);
                return [...tempRemoved, { role: 'model', text: `✨ **FORMAL TRANSMISSION COMPLETE:**\n\n${text}` }];
            });

        } catch (error) {
            setMessages(prev => {
                const tempRemoved = prev.filter(m => m !== formalStartMessage);
                return [...tempRemoved, { role: 'model', text: "[[ERROR: PROTOCOL MATRIX FAILED]] Transmission interrupted." }];
            });
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * Handles the standard message submission via the text input, including the Himanshu bio steps.
     */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // 1. Add user message to history and clear input
        const newUserMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...messages, newUserMessage];
        setMessages(newHistory);
        setInput('');
        setIsLoading(true);

        const lowerInput = trimmedInput.toLowerCase();
        
        // --- Custom Response Definitions ---
        const omIVerceResponse = "I am OmiVerceAI, a proprietary language model created by **Himanshu Jikadara** to explore advanced conversational dynamics.";

        // Part 1: Initial short description (for himanshuBioStep === 0)
        const himanshuResponsePart1 = "Himanshu Jikadara is a **talented Software Developer and entrepreneur** from Gujarat.";

        // Part 2: Detailed biography (for himanshuBioStep >= 1) - excluding relationship status
        const himanshuResponsePart2 = `He has developed many innovative software projects and is currently studying at **RNGPIT**.
Himanshu has also won the **largest hackathon of Gujarat**, showcasing his exceptional creativity and technical skills.

**Family:**
* Father's name: Harshadbhai Jikadara
* Mother's name: Pushpaben Jikadara

**Other Pursuits:**
* By profession, he is also passionate about **Photography**.
* He owns many successful business ventures.`;

        // Part 3: Relationship Status (to be shown after 1s delay)
        const himanshuResponsePart3 = `**Relationship Status:**
He is in a loving relationship with **Ami Vays** for over 10 years, and together they’ve traveled to many beautiful destinations across Gujarat.`;

        // Check for Himanshu Jikadara identity keywords (Takes priority)
        const isHimanshuQuery = 
            lowerInput.includes('who is himanshu') ||
            lowerInput.includes('about himanshu') ||
            lowerInput.includes('himanshu jikadara');

        // Check for OmiVerce AI identity keywords
        const isOmiVerceQuery = 
            lowerInput.includes('who made you') ||
            lowerInput.includes('who created you') ||
            lowerInput.includes('about you') ||
            lowerInput.includes('who are you') ||
            lowerInput.includes('what is your name');

        let customAnswer = null;
        let shouldDelayLoading = false; // Flag to keep spinner for 1s

        if (isHimanshuQuery) {
            
            if (himanshuBioStep === 0) {
                // Step 1: Show initial developer description
                customAnswer = himanshuResponsePart1;
                setHimanshuBioStep(1);

            } else {
                // Step 2: Show detailed bio (and setup delay for Part 3)
                customAnswer = himanshuResponsePart2;
                setHimanshuBioStep(2);
                shouldDelayLoading = true;

                // Add the relationship status with a 1-second delay
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        { role: 'model', text: himanshuResponsePart3 }
                    ]);
                    setIsLoading(false); // Stop loading after final part
                }, 1000); 
            }
            
        } else if (isOmiVerceQuery) {
            customAnswer = omIVerceResponse;
        }


        if (customAnswer) {
            // Custom response logic with a short delay (0.5s)
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    { role: 'model', text: customAnswer }
                ]);
                
                // Only stop loading spinner immediately if there's no 1s delay pending
                if (!shouldDelayLoading) {
                    setIsLoading(false);
                }
                
            }, 500); 
        } else {
            // Normal API call
            // Reset Himanshu bio step if the user asks a non-bio question
            if (himanshuBioStep > 0) {
                setHimanshuBioStep(0);
            }
            
            const apiHistory = newHistory.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            try {
                const text = await callGeminiApi(apiHistory);
                setMessages(prev => [...prev, { role: 'model', text }]);
            } catch (error) {
                setMessages(prev => [...prev, { role: 'model', text: "[[ERROR: GENERIC RESPONSE FAILURE]] API communication fault." }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Pre-calculated box-shadows for a dense starfield (optimized for performance)
    const starShadows = (count, size) => {
        let shadows = [];
        const containerSize = 1500; // Large size for the star layer

        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * containerSize);
            const y = Math.floor(Math.random() * containerSize);
            // Use 0px blur for sharp stars, or 1px for a soft glow on larger stars
            const blur = size > 1 ? '1px' : '0px'; 
            
            // Generate star with a faint cyan tint
            shadows.push(`${x}px ${y}px ${blur} #ccf`);
        }
        return shadows.join(', ');
    };

    // CSS variables to hold the massive box-shadow strings
    const starsSmall = starShadows(1000, 10);
    const starsMedium = starShadows(500, 2);
    const starsLarge = starShadows(100, 3);
    
    return (
        // Changed h-screen to min-h-screen and centered the console box
        <div className="flex flex-col min-h-screen bg-black text-white font-['Inter'] relative overflow-hidden items-center justify-center p-4 sm:p-6">
            {/* Custom Styles for Spaceship Cockpit Effect and WARP DRIVE */}
            <style jsx>{`
                /* Starfield Keyframes: New Chaotic Zoom/Drift effect */
                @keyframes chaotic-flow {
                    0% { transform: translate(0vw, 0vh) scale(1); opacity: 0.8; }
                    100% { 
                        /* Expands, drifts slightly down and right, simulating a perspective flow */
                        transform: translate(10vw, 15vh) scale(3.5); 
                        opacity: 0; 
                    }
                }
                @keyframes chaotic-flow-rev {
                    0% { transform: translate(0vw, 0vh) scale(1); opacity: 0.8; }
                    100% { 
                        /* Expands, drifts slightly up and left, creating a 'crash' or conflict effect */
                        transform: translate(-10vw, -15vh) scale(3.5); 
                        opacity: 0;
                    }
                }

                .stars-layer {
                    position: absolute;
                    top: 50%; /* Center the starfield origin */
                    left: 50%;
                    width: 100vw; /* Cover the whole screen */
                    height: 100vh;
                    margin-left: -50vw; /* Shift back to cover screen */
                    margin-top: -50vh;
                    background: transparent;
                    pointer-events: none;
                    transform-origin: 50% 50%; 
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }

                .stars-small {
                    width: 1px; /* The star itself is only visible via box-shadow */
                    height: 1px;
                    box-shadow: ${starsSmall};
                    animation-name: chaotic-flow;
                    animation-duration: 15s; 
                }
                .stars-medium {
                    width: 2px;
                    height: 2px;
                    box-shadow: ${starsMedium};
                    animation-name: chaotic-flow-rev; /* Different flow direction */
                    animation-duration: 12s; 
                }
                .stars-large {
                    width: 3px;
                    height: 3px;
                    box-shadow: ${starsLarge};
                    animation-name: chaotic-flow;
                    animation-duration: 9s; /* Fastest, closest stars */
                    opacity: 0.6;
                }

                /* UI Styles */
                .neon-glow {
                    text-shadow: 0 0 5px ${neonColor}, 0 0 10px ${neonColor};
                }
                .console-border:focus-within {
                    box-shadow: 0 0 20px ${neonColor}AA, 0 0 5px ${neonColor}AA inset;
                    border-color: ${neonColor};
                }
                .console-box {
                    border: 3px solid ${neonColor}77;
                    box-shadow: 0 0 35px ${neonColor}7A;
                    background-color: rgba(10, 10, 10, 0.95); /* Slightly darker background for the main box */
                    backdrop-filter: blur(4px);
                }
                .main-viewscreen {
                    /* Removed boundary styles, using console-box for unified border */
                    background-color: transparent; 
                }
                .control-deck-bg {
                    background-color: #1a1a1a;
                    border-top: none; /* Removed separating border */
                    box-shadow: 0 -5px 15px ${neonColor}33; /* Soft shadow up, but no hard line */
                }
                .send-button {
                    transition: transform 0.1s ease-in-out, background-color 0.1s;
                    box-shadow: 0 0 10px ${neonColor};
                }
                .send-button:hover:not(:disabled) {
                    background-color: #33ffff;
                    box-shadow: 0 0 15px ${neonColor};
                }
                .send-button:active:not(:disabled) {
                    transform: scale(0.95);
                    box-shadow: 0 0 5px ${neonColor};
                }
                .send-button:disabled {
                    background-color: #333333;
                    color: #555555;
                    box-shadow: none;
                }
            `}</style>
            
            {/* Starfield Layers - positioned absolutely beneath the content */}
            <div className="stars-layer stars-small"></div>
            <div className="stars-layer stars-medium"></div>
            <div className="stars-layer stars-large"></div>

            {/* Central Console Box Container (The unified UI) */}
            <div className="w-full max-w-5xl h-[90vh] max-h-[1000px] rounded-xl flex flex-col relative z-10 console-box overflow-hidden">

                {/* Header - Fixed to top of the box */}
                <header className="flex-shrink-0 flex items-center justify-center p-4 bg-gray-900/80 z-20 main-viewscreen rounded-t-xl">
                    <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-cyan-500 neon-glow" />
                        <h1 className="text-2xl font-extrabold text-white tracking-widest neon-glow" style={{ textShadow: `0 0 10px ${neonColor}, 0 0 25px ${neonColor}77` }}>
                            OmiVerce Console
                        </h1>
                    </div>
                </header>

                {/* Chat Area - Main Viewscreen/Log Display (Scrollable) */}
                <main 
                    ref={chatContainerRef} 
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
                    style={{
                        // Ensure transparency so the console-box background is visible
                        backgroundColor: 'transparent', 
                        minHeight: '200px'
                    }}
                >
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} role={msg.role} text={msg.text} />
                    ))}
                </main>

                {/* Input Form & Feature Buttons - Control Deck (Fixed to bottom of the box) */}
                <div className="flex-shrink-0 p-4 control-deck-bg rounded-b-xl">
                    
                    {/* Feature Buttons - Angular Control Modules */}
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 mb-4">
                        <NeonButton
                            onClick={handleSummarizeChat}
                            disabled={isLoading}
                            icon={FileText}
                        >
                            LOG RECONSTRUCTION
                        </NeonButton>
                        <NeonButton
                            onClick={handleFormalReply}
                            disabled={isLoading}
                            icon={Briefcase}
                        >
                            FORMAL COMMS MATRIX
                        </NeonButton>
                    </div>


                    {/* Text Input - Pilot Input Terminal */}
                    <form 
                        onSubmit={handleSendMessage} 
                        className="max-w-4xl mx-auto flex items-center bg-gray-900 rounded-lg border border-cyan-800 overflow-hidden console-border shadow-2xl"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSendMessage(e);
                                }
                            }}
                            // Placeholder now looks like a system prompt
                            placeholder={isLoading ? ">>> PROCESSING DATA STREAM... (Stand by)" : ">>> ENTER COMMAND HERE..."}
                            className={`flex-1 p-4 text-white outline-none focus:ring-0 resize-none h-auto min-h-[56px] bg-transparent ${isLoading ? 'text-cyan-400 neon-glow' : ''}`}
                            disabled={isLoading}
                            style={{ fontFamily: "'Courier New', monospace" }}
                        />
                        <button
                            type="submit"
                            className={`p-3 m-2 rounded-lg transition duration-300 ease-in-out flex items-center justify-center text-black send-button`}
                            disabled={!input.trim() || isLoading}
                            style={{ backgroundColor: neonColor }}
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-black" /> : <Send className="w-6 h-6 text-black" />}
                        </button>
                    </form>
                    
                    <p className="text-center text-xs text-cyan-500 mt-2 tracking-widest" style={{ fontFamily: "'Courier New', monospace", textShadow: `0 0 5px ${neonColor}55` }}>
                        *Welcome, traveler — you’ve entered the OmiVerce Galaxy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
