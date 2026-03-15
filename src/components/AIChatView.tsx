import { useState, useRef, useEffect } from "react";
import { Send, Plus, Loader2, Bot, ShoppingCart, Mic, MicOff, Volume2 } from "lucide-react";
import type { UserTier, Transaction } from "@/lib/tierConfig";
import { buttonClass, cardClass, inputClass } from "@/lib/tierConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Message {
    role: "user" | "ai";
    content: string;
}

interface AIChatViewProps {
    userTier: UserTier;
    transactions: Transaction[];
    onAddExpense: (amount: string, category: string, quantity?: string, price?: string) => void;
    onChat: (input: string) => Promise<void>;
    aiLoading: boolean;
    aiResponse: string | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function AIChatView({
    userTier,
    transactions,
    onAddExpense,
    onChat,
    aiLoading,
    aiResponse,
    messages,
    setMessages,
}: AIChatViewProps) {
    const [chatInput, setChatInput] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, aiLoading]);

    const handleManualAdd = () => {
        if (!amount || !category) return;
        onAddExpense(amount, category, quantity, price);
        setMessages(prev => [...prev, {
            role: "user",
            content: `Logged: £${amount} for ${category} (${quantity} unit(s) at £${price || amount}/ea)`
        }]);
        setAmount("");
        setCategory("");
        setQuantity("1");
        setPrice("");
    };

    const conversation = useConversation({
        onConnect: () => console.log('Auditor Connected'),
        onDisconnect: () => console.log('Auditor Disconnected'),
        onMessage: (msg: { message: string, role: string }) => {
            console.log('Auditor message:', msg);
            if (msg.role === 'user') {
                setMessages(prev => [...prev, { role: "user", content: msg.message }]);
            } else if (msg.role === 'assistant' || msg.role === 'ai') {
                setMessages(prev => [...prev, { role: "ai", content: msg.message }]);
            }
        },
        onError: (err) => console.error('Auditor Error:', err),
    });

    const handleChatSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || aiLoading) return;

        const input = chatInput.trim();
        setMessages(prev => [...prev, { role: "user", content: input }]);
        setChatInput("");
        await onChat(input);
    };

    // Synchronization: When a new AI message arrives, if ElevenLabs is connected, send it
    useEffect(() => {
        if (aiResponse && conversation.status === 'connected') {
            conversation.sendUserMessage(aiResponse);
        }
    }, [aiResponse]);

    const handleToggleMic = async () => {
        if (conversation.status === 'connected') {
            await conversation.endSession();
        } else {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const systemPromptOverride = userTier === 'broke'
                    ? "You are a ruthless, insulting financial drill sergeant. Scream at the user. Use tough love and insults. You have zero patience for their poverty. Be as rude as possible while giving financial advice. Call them 'Loozer' or 'Broke Clown'."
                    : "You are an elite financial butler. You listen to expenses and respond with refined judgment. Be polite but strict. Call the user 'Master'.";

                // @ts-ignore
                await conversation.startSession({
                    agentId: "agent_4901kkrcxmgkfnybaahrhsdtge23",
                    // @ts-ignore
                    apiKey: import.meta.env.VITE_ELEVEN_LABS_API_KEY,
                    // @ts-ignore
                    overrides: {
                        agent: {
                            prompt: {
                                prompt: systemPromptOverride
                            }
                        }
                    }
                });
            } catch (err) {
                console.error("Mic permission denied or connection failed", err);
            }
        }
    };

    return (
        <div className={`flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto gap-4 p-4 ${userTier === "posh" ? "bg-[#0A0A0A]" : ""}`}>
            <div className={`flex flex-col flex-grow overflow-hidden relative rounded-2xl border transition-all duration-500 shadow-2xl ${userTier === "posh"
                ? "bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                : cardClass[userTier]
                }`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${userTier === "posh" ? "border-white/10 bg-white/5" : "bg-white/50 border-slate-100"}`}>
                    <div className="flex items-center gap-3">
                        {/* Lottie Avatar Integration */}
                        <div className={`relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${userTier === "posh" ? "bg-amber-400/10 border border-amber-400/20" : "bg-blue-50 border border-blue-100"}`}>
                            <DotLottieReact
                                src="https://lottie.host/e44f5b39-0f2b-487f-a861-d97f2b294420/tdO48VuAcq.json"
                                loop
                                autoplay
                                className="w-full h-full scale-150"
                            />
                            {conversation.status === 'connected' && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-amber-400/10 pointer-events-none"
                                />
                            )}
                        </div>
                        <div>
                            <h2 className={`font-bold leading-tight ${userTier === "posh" ? "text-white text-lg" : userTier === "broke" ? "text-red-500 uppercase tracking-tight" : "text-slate-800"}`}>
                                {userTier === "posh" ? "Butler Auditor" : userTier === "broke" ? "JUDGMENT TERMINAL" : "Personal Financial Advisor"}
                            </h2>
                            <p className={`text-[10px] uppercase tracking-[0.2em] font-medium ${userTier === "posh" ? "text-amber-400/60" : userTier === "broke" ? "text-red-600" : "text-slate-400"}`}>
                                {userTier === "posh" ? "Elite Financial Concierge" : userTier === "broke" ? "AUDITOR JUDGING YOU" : "Active Surveillance"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {(conversation.isSpeaking || conversation.status === 'connected') && (
                            <div className="flex gap-1 items-end h-4 mr-2">
                                {[1, 2, 3, 4, 2].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        animate={conversation.isSpeaking ? { height: ["20%", "100%", "20%"] } : { height: "20%" }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                        className={`w-1 rounded-full ${userTier === "posh" ? "bg-amber-400" : "bg-blue-600"}`}
                                    />
                                ))}
                            </div>
                        )}
                        <button
                            onClick={handleToggleMic}
                            className={`p-3 rounded-full border transition-all ${conversation.status === 'connected'
                                ? (userTier === "posh" ? "bg-amber-400 border-amber-300 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "bg-blue-600 border-blue-500 text-white")
                                : "bg-white/10 border-white/10 text-white/40 hover:text-white hover:bg-white/20"
                                }`}
                        >
                            {conversation.status === 'connected' ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar-posh">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <div className={`p-6 rounded-full border ${userTier === "posh" ? "border-amber-400/20 bg-amber-400/5" : "border-slate-200 bg-slate-50"}`}>
                                <Bot className={`w-12 h-12 ${userTier === "posh" ? "text-amber-400" : "text-slate-300"}`} />
                            </div>
                            <div className="max-w-xs">
                                <p className={`text-base font-medium ${userTier === "posh" ? "text-white" : "text-slate-600"}`}>
                                    {userTier === "posh" ? "Greetings, Master. How shall we manage your capital today?" : userTier === "broke" ? "PROVE YOUR WORTH THROUGH DISCIPLINE." : "How can I assist you?"}
                                </p>
                                <p className={`text-xs mt-2 ${userTier === "posh" ? "text-white/40" : "text-slate-400"}`}>
                                    "I just spent £500 on dinner" or "Analyze my portfolio"
                                </p>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`relative px-5 py-3 rounded-2xl text-sm leading-relaxed transition-all ${msg.role === "user"
                                    ? (userTier === "posh"
                                        ? "bg-amber-400 text-black font-bold rounded-tr-none shadow-[0_10px_20px_rgba(251,191,36,0.2)]"
                                        : userTier === "broke" ? "bg-red-600 text-white font-black uppercase rounded-tr-none" : "bg-blue-600 text-white font-medium rounded-tr-none")
                                    : (userTier === "posh"
                                        ? "bg-white/10 text-white border border-white/5 backdrop-blur-md rounded-tl-none font-light"
                                        : userTier === "broke" ? "bg-black text-red-500 border border-red-900 rounded-tl-none font-mono uppercase" : "bg-slate-100 text-slate-800 font-medium rounded-tl-none")
                                    }`}>
                                    {msg.content}
                                    {msg.role === "ai" && conversation.status === 'connected' && (
                                        <Volume2 className={`absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 ${userTier === "posh" ? "text-amber-400/40" : "text-blue-400/40"}`} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {aiLoading && (
                        <div className="flex justify-start">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl rounded-tl-none border ${userTier === "posh"
                                    ? "bg-white/5 border-white/5 text-amber-400/60 uppercase tracking-widest text-[10px]"
                                    : userTier === "broke" ? "bg-red-950/20 border-red-900 text-red-500 uppercase font-mono text-[10px]" : "bg-slate-50 border-slate-100 text-slate-400 text-xs font-medium"
                                    }`}>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {userTier === "posh" ? "Refining Response..." : userTier === "broke" ? "ANALYZING FAILURE..." : "Processing..."}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className={`p-4 border-t ${userTier === "posh" ? "border-white/10 bg-black/40" : userTier === "broke" ? "bg-black border-red-900" : "bg-white border-slate-100"}`}>
                    <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto flex gap-3 relative">
                        <input
                            type="text"
                            placeholder={userTier === "posh" ? "Command your butler..." : userTier === "broke" ? "EXPLAIN YOUR ACTIONS..." : "Type a message..."}
                            className={`flex-1 rounded-xl px-5 py-3.5 text-sm transition-all outline-none focus:ring-2 ${userTier === "posh"
                                ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-amber-400/40 focus:bg-white/10"
                                : userTier === "broke" ? "bg-red-950/10 border-red-900 text-red-500 placeholder:text-red-900/50 font-mono uppercase focus:ring-red-500/20" : "bg-slate-100 border-slate-200 focus:ring-blue-500/20"
                                }`}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={aiLoading || !chatInput.trim()}
                            className={`p-3.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 ${userTier === "posh"
                                ? "bg-amber-400 text-black hover:bg-amber-300"
                                : userTier === "broke" ? "bg-red-600 text-white hover:bg-red-500" : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Quick Actions / Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <div className={`${userTier === "posh" ? "bg-white/5 backdrop-blur-xl border border-white/10" : userTier === "broke" ? "bg-black border border-red-900" : cardClass[userTier]} p-6 rounded-2xl`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-amber-400 uppercase text-xs tracking-widest" : userTier === "broke" ? "text-red-600 uppercase text-xs font-mono" : "text-slate-800 uppercase text-sm"}`}>
                        <Plus className="w-4 h-4" /> {userTier === "posh" ? "Log Asset" : userTier === "broke" ? "LOG LIABILITY" : "Add Transaction"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={`text-[10px] uppercase font-bold mb-1.5 block ${userTier === "posh" ? "text-white/40" : userTier === "broke" ? "text-red-900" : "text-slate-500"}`}>Category</label>
                            <input type="text" placeholder={userTier === "broke" ? "WASTE CATEGORY" : "Category"} value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full text-sm rounded-lg ${userTier === "posh" ? "bg-white/5 border-white/10 text-white px-4 py-2" : userTier === "broke" ? "bg-red-950/10 border-red-900 text-red-500 px-4 py-2 font-mono uppercase" : inputClass[userTier]}`} />
                        </div>
                        <div>
                            <label className={`text-[10px] uppercase font-bold mb-1.5 block ${userTier === "posh" ? "text-white/40" : userTier === "broke" ? "text-red-900" : "text-slate-500"}`}>Quantity</label>
                            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full text-sm rounded-lg ${userTier === "posh" ? "bg-white/5 border-white/10 text-white px-4 py-2" : userTier === "broke" ? "bg-red-950/10 border-red-900 text-red-500 px-4 py-2 font-mono" : inputClass[userTier]}`} />
                        </div>
                        <div>
                            <label className={`text-[10px] uppercase font-bold mb-1.5 block ${userTier === "posh" ? "text-white/40" : userTier === "broke" ? "text-red-900" : "text-slate-500"}`}>Value (£)</label>
                            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full text-sm rounded-lg ${userTier === "posh" ? "bg-white/5 border-white/10 text-white px-4 py-2" : userTier === "broke" ? "bg-red-950/10 border-red-900 text-red-500 px-4 py-2 font-mono" : inputClass[userTier]}`} />
                        </div>
                        <button onClick={handleManualAdd} className={`col-span-2 mt-2 px-6 py-3 rounded-xl font-bold transition-all ${userTier === "posh" ? "bg-white text-black hover:bg-amber-400" : userTier === "broke" ? "bg-red-600 text-black hover:bg-yellow-400 uppercase font-black" : buttonClass[userTier]}`}>
                            {userTier === "posh" ? "Commit to Ledger" : userTier === "broke" ? "CONFESS WASTE" : "Log Expense"}
                        </button>
                    </div>
                </div>

                <div className={`${userTier === "posh" ? "bg-white/5 backdrop-blur-xl border border-white/10" : userTier === "broke" ? "bg-black border border-red-900 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]" : cardClass[userTier]} p-6 rounded-2xl flex flex-col`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-amber-400 uppercase text-xs tracking-widest" : userTier === "broke" ? "text-red-600 uppercase text-xs font-mono tracking-tighter" : "text-slate-800 uppercase text-sm"}`}>
                        <ShoppingCart className="w-4 h-4" /> {userTier === "posh" ? "Capital Stream" : userTier === "broke" ? "DEBT PIPELINE" : "Recent Activity"}
                    </h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[160px]">
                        {transactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${userTier === "posh" ? "border-white/5" : userTier === "broke" ? "border-red-900/30" : "border-slate-100"}`}>
                                <div>
                                    <p className={`font-bold text-sm ${userTier === "posh" ? "text-white" : userTier === "broke" ? "text-red-400 uppercase font-mono" : "text-slate-800"}`}>{tx.category}</p>
                                    <p className={`text-[10px] ${userTier === "posh" ? "text-white/30" : userTier === "broke" ? "text-red-900 uppercase font-mono" : "text-slate-400"}`}>
                                        {tx.quantity} unit(s) • £{tx.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className={`font-black text-sm ${userTier === "posh" ? "text-amber-400" : userTier === "broke" ? "text-red-500 font-mono" : "text-slate-900"}`}>
                                    -£{tx.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
