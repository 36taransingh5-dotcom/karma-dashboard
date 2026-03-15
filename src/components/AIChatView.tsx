import { useState, useRef, useEffect } from "react";
import { Send, Plus, Loader2, Bot, CircleDollarSign, ShoppingCart, Lightbulb, Flame } from "lucide-react";
import type { UserTier, Transaction } from "@/lib/tierConfig";
import { buttonClass, cardClass, inputClass } from "@/lib/tierConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react"; // Correct hook for Conversational AI usually
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

    useEffect(() => {
        if (aiResponse) {
            setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
        }
    }, [aiResponse]);

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

    const handleChatSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || aiLoading) return;

        const input = chatInput.trim();
        setMessages(prev => [...prev, { role: "user", content: input }]);
        setChatInput("");
        await onChat(input);
    };

    const conversation = useConversation({
        onConnect: () => console.log('Auditor Connected'),
        onDisconnect: () => console.log('Auditor Disconnected'),
        onMessage: (msg) => console.log('Auditor says:', msg),
        onError: (err) => console.error('Auditor Error:', err),
    });

    const handleToggleAuditor = async () => {
        if (conversation.status === 'connected') {
            await conversation.endSession();
        } else {
            await conversation.startSession({
                agentId: "fM6sh4A3S327F0W85K5P", // Using a generic agent for now, normally user provides UUID
            });
        }
    };

    const handleAnalyzeSpending = () => {
        const noise = auditedTransactions.filter(tx => tx.spendingType === "noise");
        // Trigger voice if connected
        if (conversation.status === 'connected') {
            // Send context to voice agent if possible, else just let the persona handle it
            conversation.say("Analyzing your wasteful spending and incinerating the noise. Prepare for brutal honesty.");
        }

        let delay = 0;
        noise.forEach(tx => {
            setTimeout(() => {
                setBurningTx(prev => [...prev, tx.id.toString()]);
                setRecoveredWealth(prev => prev + tx.amount);
            }, delay);
            delay += 600;
        });

        onChat("Analyze my wasteful spending and incinerate the noise. Be brutal.");
    };

    if (graveyardMode) {
        return (
            <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto gap-6 relative">
                {/* ElevenLabs Widget Control */}
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2">
                    <button
                        onClick={handleToggleAuditor}
                        className={`p-4 rounded-full border-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] ${conversation.status === 'connected' ? "bg-orange-500 border-orange-400 text-black animate-pulse" : "bg-black border-orange-900 text-orange-500"
                            }`}
                    >
                        <Bot className="w-6 h-6" />
                    </button>
                    <p className="text-[8px] text-orange-500 uppercase font-black tracking-widest">
                        {conversation.status === 'connected' ? "Auditor Listening" : "Ignite Auditor"}
                    </p>
                </div>

                {/* Recovered Wealth Header */}
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
                    {/* Graveyard Canvas */}
                    <div className="flex-[2] bg-black/40 border border-orange-900/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,45,18,0.1)_0%,transparent_70%)]" />

                        <div className="relative w-full h-full p-8">
                            <AnimatePresence>
                                {noiseTransactions.map((tx, i) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{
                                            x: Math.random() * 400 - 200,
                                            y: 600,
                                            opacity: 0,
                                            scale: 0.5
                                        }}
                                        animate={{
                                            x: Math.sin(i + Date.now() / 1000) * 100,
                                            y: -100,
                                            opacity: [0, 1, 1, 0],
                                            scale: [0.5, 1, 1, 0.8]
                                        }}
                                        exit={{
                                            scale: 2,
                                            opacity: 0,
                                            filter: "blur(20px) brightness(3)",
                                            transition: { duration: 0.5 }
                                        }}
                                        transition={{
                                            duration: 15,
                                            repeat: Infinity,
                                            delay: i * 2,
                                            ease: "linear"
                                        }}
                                        className="absolute p-4 rounded-full border border-red-500/40 bg-red-950/20 backdrop-blur-sm cursor-pointer hover:border-orange-500 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                        style={{ left: `${(i * 15) % 80}%`, top: '40%' }}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-red-500 font-black text-xs uppercase tracking-widest">{tx.category}</span>
                                            <span className="text-white font-black text-lg">£{tx.amount}</span>
                                        </div>
                                        {/* Fire effect placeholder via blur/shadow */}
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

                    {/* Battlefield Chat Sidebar */}
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
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto gap-6">
            <div className={`${cardClass[userTier]} flex-1 flex flex-col overflow-hidden relative`}>
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <Bot className={`w-5 h-5 ${userTier === "posh" ? "text-amber-400" : userTier === "broke" ? "text-red-500" : "text-blue-600"}`} />
                    <h2 className={`font-bold ${userTier === "posh" ? "text-amber-300" : userTier === "broke" ? "text-lime-400 uppercase" : "text-slate-800"}`}>
                        {userTier === "posh" ? "Financial Concierge" : userTier === "broke" ? "JUDGMENT TERMINAL" : "Personal Financial Advisor"}
                    </h2>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className={`text-center py-10 ${userTier === "posh" ? "text-amber-500/40" : "text-slate-400"}`}>
                            <p className="text-sm">How can I assist with your capital today?</p>
                            <p className="text-xs mt-2 italic">"I just bought a Rolex for £10,000" or "Should I save more?"</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded px-4 py-2 text-sm ${msg.role === "user"
                                ? (userTier === "posh" ? "bg-white text-black font-bold" : "bg-blue-600 text-white font-medium")
                                : (userTier === "posh" ? "bg-[#1A1A1A] text-white border border-white/10 font-light" : "bg-slate-100 text-slate-800 font-medium")
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {aiLoading && (
                        <div className="flex justify-start">
                            <div className={`flex items-center gap-2 px-4 py-2 text-xs font-medium animate-pulse ${userTier === "posh" ? "text-white/40 uppercase tracking-widest" : userTier === "broke" ? "text-lime-400 font-black tracking-tighter" : "text-slate-500"
                                }`}>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {userTier === "broke" ? "CALCULATING YOUR DEBT..." : userTier === "posh" ? "ANALYZING PORTFOLIO..." : "Processing financial data..."}
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2 pt-4 border-t sticky bottom-0 bg-inherit">
                    <input
                        type="text"
                        placeholder="Type your expense or ask for advice..."
                        className={`flex-1 ${inputClass[userTier]}`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" disabled={aiLoading} className={buttonClass[userTier]}>
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cardClass[userTier]}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-white uppercase text-xs tracking-[0.2em]" : "text-slate-800 uppercase text-sm tracking-widest"}`}>
                        <Plus className="w-4 h-4" /> Structured Log
                    </h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={`text-[10px] uppercase font-bold mb-1 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Category</label>
                                <input type="text" placeholder="e.g. Dining" value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full text-sm ${inputClass[userTier]}`} />
                            </div>
                            <div className="w-24">
                                <label className={`text-[10px] uppercase font-bold mb-1 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Quantity</label>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full text-sm ${inputClass[userTier]}`} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={`text-[10px] uppercase font-bold mb-1 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Price (£)</label>
                                <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full text-sm ${inputClass[userTier]}`} />
                            </div>
                            <div className="flex-1">
                                <label className={`text-[10px] uppercase font-bold mb-1 block ${userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Total (£)</label>
                                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full text-sm ${inputClass[userTier]}`} />
                            </div>
                        </div>
                        <button onClick={handleManualAdd} className={`w-full ${buttonClass[userTier]}`}>
                            Record Entry
                        </button>
                    </div>
                </div>

                <div className={cardClass[userTier]}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-white uppercase text-xs tracking-[0.2em]" : "text-slate-800 uppercase text-sm tracking-widest"}`}>
                        <ShoppingCart className="w-4 h-4" /> Recent Impacts
                    </h3>
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.slice(0, 4).map(tx => (
                            <div key={tx.id} className={`flex justify-between items-center text-xs border-b pb-3 ${userTier === "posh" ? "border-white/5" : "border-slate-100"}`}>
                                <div>
                                    <p className={`font-bold ${userTier === "posh" ? "text-white" : ""}`}>{tx.category}</p>
                                    <p className={userTier === "posh" ? "text-white/40" : "text-slate-400 font-medium"}>
                                        {tx.quantity} x £{tx.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className={`font-black ${userTier === "broke" ? "text-red-500" : userTier === "posh" ? "text-white text-sm" : "text-slate-900"}`}>
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
