import { useState, useRef, useEffect } from "react";
import { Send, Plus, Loader2, Bot, CircleDollarSign, ShoppingCart, Lightbulb, Flame, Mic, MicOff, Volume2 } from "lucide-react";
import type { UserTier, Transaction } from "@/lib/tierConfig";
import { buttonClass, cardClass, inputClass } from "@/lib/tierConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react";
import { auditSpending, AuditedTransaction } from "@/lib/wasteAuditor";

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
    graveyardMode?: boolean;
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
    graveyardMode
}: AIChatViewProps) {
    const [chatInput, setChatInput] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [burningTx, setBurningTx] = useState<string[]>([]);
    const [recoveredWealth, setRecoveredWealth] = useState(0);

    const auditedTransactions = auditSpending(transactions);
    const noiseTransactions = auditedTransactions.filter(tx => tx.spendingType === "noise" && !burningTx.includes(tx.id.toString()));

    const scrollRef = useRef<HTMLDivElement>(null);

    // messages are managed by Index.tsx, so we don't need a local useEffect to add aiResponse


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

        if (conversation.status === 'connected') {
            // When connected, we let ElevenLabs handle the conversation
            // onMessage will take care of adding transcripts to history
            await conversation.sendUserMessage(input);
            setChatInput("");
        } else {
            // Standard fallback to cloud API
            setMessages(prev => [...prev, { role: "user", content: input }]);
            setChatInput("");
            await onChat(input);
        }
    };

    // Auto-incinerate if the fallback triggers
    useEffect(() => {
        if (aiResponse?.includes("Initiating incineration sequence.")) {
            handleAnalyzeSpending();
        }
    }, [aiResponse]);

    const handleToggleMic = async () => {
        if (conversation.status === 'connected') {
            await conversation.endSession();
        } else {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                // Note: Types might be tricky, providing minimalist config that usually works with @elevenlabs/react
                // @ts-ignore
                await conversation.startSession({
                    agentId: "agent_4901kkrcxmgkfnybaahrhsdtge23",
                    // Adding apiKey directly in startSession as per ElevenLabs React SDK typical requirements for client-side init
                    // @ts-ignore
                    apiKey: import.meta.env.VITE_ELEVEN_LABS_API_KEY,
                });
            } catch (err) {
                console.error("Mic permission denied or connection failed", err);
            }
        }
    };

    const handleAnalyzeSpending = () => {
        const noise = auditedTransactions.filter(tx => tx.spendingType === "noise");
        if (conversation.status === 'connected') {
            conversation.sendUserMessage("Analyzing your wasteful spending and incinerating the noise. Prepare for brutal honesty.");
        }

        let totalDelay = 0;
        noise.forEach(tx => {
            setTimeout(() => {
                setBurningTx(prev => [...prev, tx.id.toString()]);
                setRecoveredWealth(prev => prev + tx.amount);
            }, totalDelay);
            totalDelay += 600;
        });

        onChat("Analyze my wasteful spending and incinerate the noise. Be brutal.");
    };

    if (graveyardMode) {
        return (
            <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto gap-6 relative">
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2">
                    <button
                        onClick={handleToggleMic}
                        className={`p-4 rounded-full border-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] ${conversation.status === 'connected' ? "bg-orange-500 border-orange-400 text-black animate-pulse" : "bg-black border-orange-900 text-orange-500"
                            }`}
                    >
                        {conversation.status === 'connected' ? <Mic className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                    </button>
                    <p className="text-[8px] text-orange-500 uppercase font-black tracking-widest">
                        {conversation.status === 'connected' ? "Auditor Listening" : "Ignite Auditor"}
                    </p>
                </div>

                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-between items-center bg-orange-950/40 border border-orange-500/30 p-6 rounded-none shadow-[0_0_30px_rgba(249,115,22,0.1)]"
                >
                    <div>
                        <h2 className="text-orange-500 font-black uppercase tracking-[0.4em] text-xl">Financial Graveyard</h2>
                        <p className="text-orange-900 font-bold uppercase text-[10px] mt-1">INCINERATING LIFESTYLE INFLATION</p>
                    </div>
                    <div className="text-right">
                        <p className="text-orange-900 text-[10px] font-black uppercase mb-1">Recovered Wealth</p>
                        <div className="text-4xl font-black text-orange-500 tabular-nums">
                            £{recoveredWealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </motion.div>

                <div className="flex-1 relative flex gap-6 overflow-hidden">
                    <div className="flex-[2] bg-black/40 border border-orange-900/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,45,18,0.1)_0%,transparent_70%)]" />
                        <div className="relative w-full h-full p-8">
                            <AnimatePresence>
                                {noiseTransactions.map((tx, i) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ x: Math.random() * 400 - 200, y: 600, opacity: 0, scale: 0.5 }}
                                        animate={{ x: Math.sin(i + Date.now() / 1000) * 100, y: -100, opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.8] }}
                                        exit={{ scale: 2, opacity: 0, filter: "blur(20px) brightness(3)", transition: { duration: 0.5 } }}
                                        transition={{ duration: 15, repeat: Infinity, delay: i * 2, ease: "linear" }}
                                        className="absolute p-4 rounded-full border border-red-500/40 bg-red-950/20 backdrop-blur-sm cursor-pointer hover:border-orange-500 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                        style={{ left: `${(i * 15) % 80}%`, top: '40%' }}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-red-500 font-black text-xs uppercase tracking-widest">{tx.category}</span>
                                            <span className="text-white font-black text-lg">£{tx.amount}</span>
                                        </div>
                                        <div className="absolute -inset-2 bg-orange-600/20 rounded-full blur-xl animate-pulse" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {noiseTransactions.length === 0 && burningTx.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <h3 className="text-orange-500 font-black text-4xl uppercase tracking-widest animate-pulse">Silence Restored</h3>
                                        <p className="text-orange-900 uppercase font-black text-xs mt-4 italic">"The noise has been cleansed."</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                            <button
                                onClick={handleAnalyzeSpending}
                                className="bg-orange-600 hover:bg-orange-500 text-black font-black uppercase px-12 py-4 tracking-[0.3em] text-sm shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all active:scale-95"
                            >
                                Analyze & Incinerate
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-orange-950/20 border border-orange-900/30 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-orange-900/30 flex items-center gap-2">
                                <Bot className="w-4 h-4 text-orange-500" />
                                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">The Auditor</span>
                            </div>
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-orange">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[90%] px-3 py-2 text-xs font-mono uppercase tracking-tighter ${msg.role === "user" ? "bg-orange-900/40 text-orange-200" : "text-orange-500 bg-orange-500/5 border-l-2 border-orange-500"
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {aiLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-2 text-[10px] text-orange-500 animate-pulse font-black uppercase">
                                            <Flame className="w-3 h-3 animate-bounce" />
                                            Igniting...
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleChatSubmit} className="p-4 border-t border-orange-900/30 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Speak to the auditor..."
                                    className="flex-1 bg-black border border-orange-900 px-3 py-2 text-xs text-orange-500 focus:border-orange-500 outline-none uppercase font-mono placeholder:text-orange-900"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <button type="submit" className="bg-orange-900/50 p-2 text-orange-500 hover:bg-orange-600 hover:text-black transition-colors">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto gap-4 p-4 ${userTier === "posh" ? "bg-[#0A0A0A]" : ""}`}>
            <div className={`flex flex-col flex-grow overflow-hidden relative rounded-2xl border transition-all duration-500 shadow-2xl ${userTier === "posh"
                ? "bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                : cardClass[userTier]
                }`}>

                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${userTier === "posh" ? "border-white/10 bg-white/5" : "bg-white/50 border-slate-100"}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${userTier === "posh" ? "bg-amber-400/20" : "bg-blue-50"}`}>
                            <Bot className={`w-5 h-5 ${userTier === "posh" ? "text-amber-400" : userTier === "broke" ? "text-red-500" : "text-blue-600"}`} />
                        </div>
                        <div>
                            <h2 className={`font-bold leading-tight ${userTier === "posh" ? "text-white text-lg" : userTier === "broke" ? "text-lime-400 uppercase tracking-tight" : "text-slate-800"}`}>
                                {userTier === "posh" ? "Butler Auditor" : userTier === "broke" ? "JUDGMENT TERMINAL" : "Personal Financial Advisor"}
                            </h2>
                            <p className={`text-[10px] uppercase tracking-[0.2em] font-medium ${userTier === "posh" ? "text-amber-400/60" : "text-slate-400"}`}>
                                {userTier === "posh" ? "Elite Financial Concierge" : "Active Surveillance"}
                            </p>
                        </div>
                    </div>

                    {userTier === "posh" && (
                        <div className="flex items-center gap-3">
                            {conversation.isSpeaking && (
                                <div className="flex gap-1 items-end h-4 mr-2">
                                    {[1, 2, 3, 4, 2].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: ["20%", "100%", "20%"] }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-1 bg-amber-400 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={handleToggleMic}
                                className={`p-3 rounded-full border transition-all ${conversation.status === 'connected'
                                    ? "bg-amber-400 border-amber-300 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                                    : "bg-white/10 border-white/10 text-white/40 hover:text-white hover:bg-white/20"
                                    }`}
                            >
                                {conversation.status === 'connected' ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </button>
                        </div>
                    )}
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
                                    {userTier === "posh" ? "Greetings, Master. How shall we manage your capital today?" : "How can I assist you?"}
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
                                        : "bg-blue-600 text-white font-medium rounded-tr-none")
                                    : (userTier === "posh"
                                        ? "bg-white/10 text-white border border-white/5 backdrop-blur-md rounded-tl-none font-light"
                                        : "bg-slate-100 text-slate-800 font-medium rounded-tl-none")
                                    }`}>
                                    {msg.content}
                                    {msg.role === "ai" && userTier === "posh" && conversation.status === 'connected' && (
                                        <Volume2 className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/40" />
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
                                    : "bg-slate-50 border-slate-100 text-slate-400 text-xs font-medium"
                                    }`}>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {userTier === "posh" ? "Refining Response..." : "Processing..."}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className={`p-4 border-t ${userTier === "posh" ? "border-white/10 bg-black/40" : "bg-white border-slate-100"}`}>
                    <form onSubmit={handleChatSubmit} className="max-w-4xl mx-auto flex gap-3 relative">
                        <input
                            type="text"
                            placeholder={userTier === "posh" ? "Command your butler..." : "Type a message..."}
                            className={`flex-1 rounded-xl px-5 py-3.5 text-sm transition-all outline-none focus:ring-2 ${userTier === "posh"
                                ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-amber-400/40 focus:bg-white/10"
                                : "bg-slate-100 border-slate-200 focus:ring-blue-500/20"
                                }`}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={aiLoading || !chatInput.trim()}
                            className={`p-3.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 ${userTier === "posh"
                                ? "bg-amber-400 text-black hover:bg-amber-300"
                                : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Quick Actions / Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <div className={`${userTier === "posh" ? "bg-white/5 backdrop-blur-xl border border-white/10" : cardClass[userTier]} p-6 rounded-2xl`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-amber-400 uppercase text-xs tracking-widest" : "text-slate-800 uppercase text-sm"}`}>
                        <Plus className="w-4 h-4" /> Log Asset
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={`text-[10px] uppercase font-bold mb-1.5 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Category</label>
                            <input type="text" placeholder="Wealth Category" value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full text-sm rounded-lg ${userTier === "posh" ? "bg-white/5 border-white/10 text-white px-4 py-2" : inputClass[userTier]}`} />
                        </div>
                        <div>
                            <label className={`text-[10px] uppercase font-bold mb-1.5 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Quantity</label>
                            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full text-sm rounded-lg ${userTier === "posh" ? "bg-white/5 border-white/10 text-white px-4 py-2" : inputClass[userTier]}`} />
                        </div>
                        <div>
                            <label className={`text-[10px] uppercase font-bold mb-1.5 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Value (£)</label>
                            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full text-sm rounded-lg ${userTier === "posh" ? "bg-white/5 border-white/10 text-white px-4 py-2" : inputClass[userTier]}`} />
                        </div>
                        <button onClick={handleManualAdd} className={`col-span-2 mt-2 px-6 py-3 rounded-xl font-bold transition-all ${userTier === "posh" ? "bg-white text-black hover:bg-amber-400" : buttonClass[userTier]}`}>
                            Commit to Ledger
                        </button>
                    </div>
                </div>

                <div className={`${userTier === "posh" ? "bg-white/5 backdrop-blur-xl border border-white/10" : cardClass[userTier]} p-6 rounded-2xl flex flex-col`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-amber-400 uppercase text-xs tracking-widest" : "text-slate-800 uppercase text-sm"}`}>
                        <ShoppingCart className="w-4 h-4" /> Capital Stream
                    </h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[160px]">
                        {transactions.slice(0, 5).map(tx => (
                            <div key={tx.id} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${userTier === "posh" ? "border-white/5" : "border-slate-100"}`}>
                                <div>
                                    <p className={`font-bold text-sm ${userTier === "posh" ? "text-white" : "text-slate-800"}`}>{tx.category}</p>
                                    <p className={`text-[10px] ${userTier === "posh" ? "text-white/30" : "text-slate-400"}`}>
                                        {tx.quantity} unit(s) • £{tx.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className={`font-black text-sm ${userTier === "posh" ? "text-amber-400" : "text-slate-900"}`}>
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
