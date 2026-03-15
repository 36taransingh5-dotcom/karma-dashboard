import { useState, useRef, useEffect } from "react";
import { Send, Plus, Loader2, Bot, CircleDollarSign, ShoppingCart } from "lucide-react";
import type { UserTier, Transaction } from "@/lib/tierConfig";
import { buttonClass, cardClass, inputClass } from "@/lib/tierConfig";

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
}

export default function AIChatView({
    userTier,
    transactions,
    onAddExpense,
    onChat,
    aiLoading,
    aiResponse
}: AIChatViewProps) {
    const [chatInput, setChatInput] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

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

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto gap-6">
            {/* AI Chat Area */}
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
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === "user"
                                    ? (userTier === "posh" ? "bg-amber-500/10 text-amber-200 border border-amber-500/20" : "bg-blue-600 text-white")
                                    : (userTier === "posh" ? "bg-white/5 text-amber-100 italic border border-amber-500/10" : "bg-slate-100 text-slate-800")
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {aiLoading && (
                        <div className="flex justify-start">
                            <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-medium animate-pulse ${userTier === "posh" ? "text-amber-400 italic" : userTier === "broke" ? "text-lime-400" : "text-slate-500"
                                }`}>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {userTier === "broke" ? "CALCULATING YOUR DEBT..." : "Processing financial data..."}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
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

            {/* Manual Entry & Quick Log Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cardClass[userTier]}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-amber-300" : "text-slate-800"}`}>
                        <Plus className="w-4 h-4" /> Structured Log
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Category</label>
                                <input type="text" placeholder="e.g. Dining" value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full text-xs ${inputClass[userTier]}`} />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Quantity</label>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`w-full text-xs ${inputClass[userTier]}`} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Unit Price (£)</label>
                                <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full text-xs ${inputClass[userTier]}`} />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Total (£)</label>
                                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full text-xs ${inputClass[userTier]}`} />
                            </div>
                        </div>
                        <button onClick={handleManualAdd} className={`w-full mt-2 ${buttonClass[userTier]}`}>
                            Record Entry
                        </button>
                    </div>
                </div>

                {/* Mini Stats/Recent Summary */}
                <div className={cardClass[userTier]}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${userTier === "posh" ? "text-amber-300" : "text-slate-800"}`}>
                        <ShoppingCart className="w-4 h-4" /> Recent Impacts
                    </h3>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.slice(0, 4).map(tx => (
                            <div key={tx.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                <div>
                                    <p className="font-bold">{tx.category}</p>
                                    <p className={userTier === "posh" ? "text-amber-400/40" : "text-slate-400"}>
                                        {tx.quantity} x £{tx.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className={`font-black ${userTier === "broke" ? "text-red-500" : userTier === "posh" ? "text-amber-300" : "text-slate-900"}`}>
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
