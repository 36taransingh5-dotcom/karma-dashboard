import { useState, useRef, useEffect } from "react";
import { Send, Plus, Loader2, Bot, CircleDollarSign, ShoppingCart, Lightbulb } from "lucide-react";
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
    setMessages
}: AIChatViewProps) {
    const [chatInput, setChatInput] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("");

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

    // MIDDLE TIER RENDER (Integrated into Index.tsx grid)
    if (userTier === "middle") {
        return (
            <div className="flex flex-col gap-8">
                {/* Chat Container */}
                <div className="flex flex-col gap-4">
                    <div className="text-center py-4">
                        <p className="text-slate-600 text-sm font-medium">How can I help you manage your money today?</p>
                        <p className="text-slate-400 text-xs italic mt-1 font-serif tracking-wide italic">"I spent £45 on groceries" or "How am I doing this month?"</p>
                    </div>

                    <div ref={scrollRef} className="max-h-[300px] overflow-y-auto space-y-4 px-2 mb-4 custom-scrollbar bg-slate-50/50 p-4 border border-slate-100 italic font-serif">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded px-4 py-2 text-sm ${msg.role === "user" ? "bg-[#003366] text-white" : "text-slate-700 bg-white border border-slate-200"}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {aiLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 animate-pulse bg-white border border-slate-200">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type your expense or ask for advice..."
                            className={`flex-1 ${inputClass.middle}`}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <button type="submit" disabled={aiLoading} className={buttonClass.middle}>
                            Submit
                        </button>
                    </form>

                    <div className="bg-[#EEEEEE] border border-[#D1D1D1] p-3 flex items-center gap-2 text-xs text-slate-700 font-bold">
                        <span className="text-sm">💡</span>
                        <span className="flex-1"><span className="uppercase text-[#003366]">Tip of the day:</span> Save £10/wk by bringing coffee from home! That's over £500 a year back in your pocket.</span>
                    </div>
                </div>

                {/* Grid for Quick Log and Recent Spending */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 mt-4">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest pl-1">Quick Log</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Category</label>
                                <input type="text" placeholder="e.g. Groceries" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass.middle} />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Quantity</label>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass.middle} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Unit Price (£)</label>
                            <div className="flex gap-4">
                                <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className={`flex-1 ${inputClass.middle}`} />
                                <button onClick={handleManualAdd} className={`flex-1 ${buttonClass.middle}`}>Record</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest pl-1">Recent Spending</h3>
                        <div className="border border-[#D1D1D1] bg-white overflow-hidden">
                            <div className="flex bg-slate-50 border-b border-[#D1D1D1] p-2 text-[10px] font-bold text-slate-500 uppercase">
                                <div className="flex-1">Item</div>
                                <div className="w-16">Date</div>
                                <div className="w-16">Details</div>
                                <div className="w-16 text-right">Amount</div>
                            </div>
                            <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100">
                                {transactions.slice(0, 5).map(tx => (
                                    <div key={tx.id} className="flex p-2 text-[11px] text-slate-700 font-medium items-center">
                                        <div className="flex-1 font-bold">{tx.category}</div>
                                        <div className="w-16 text-slate-400">{tx.date.split('-').slice(1).join('/')}</div>
                                        <div className="w-16 text-slate-400">{tx.quantity}x</div>
                                        <div className="w-16 text-right font-bold text-slate-900">£{tx.amount.toFixed(2)}</div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 text-xs font-serif italic">No recent activity detected.</div>
                                )}
                            </div>
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
