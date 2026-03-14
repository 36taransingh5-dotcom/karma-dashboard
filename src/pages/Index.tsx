import { useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  Bot,
  Plus,
  X,
  ShieldCheck,
  Crown,
  Skull,
  Meh,
} from "lucide-react";

type UserTier = "posh" | "middle" | "broke";

interface Transaction {
  id: number;
  amount: number;
  category: string;
  date: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, amount: 42.5, category: "Dining", date: "2026-03-13" },
  { id: 2, amount: 120.0, category: "Shopping", date: "2026-03-12" },
  { id: 3, amount: 8.99, category: "Coffee", date: "2026-03-11" },
  { id: 4, amount: 55.0, category: "Transport", date: "2026-03-10" },
];

const AI_MESSAGES: Record<UserTier, string> = {
  posh: "Yes, Master. A brilliant purchase. Your portfolio shall recover in moments.",
  middle:
    "Are you sure about that £5 coffee? Your pension is crying. Maybe consider a thermos?",
  broke:
    "WAKE UP! STOP BUYING TAKEAWAY AND START DROPSHIPPING! YOUR BANK CALLED — THEY WANT THEIR OVERDRAFT BACK!",
};

const TIER_ICONS: Record<UserTier, React.ReactNode> = {
  posh: <Crown className="w-4 h-4" />,
  middle: <Meh className="w-4 h-4" />,
  broke: <Skull className="w-4 h-4" />,
};

export default function Index() {
  const [userTier, setUserTier] = useState<UserTier>("middle");
  const [karmaScore, setKarmaScore] = useState(50);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  const [closedAds, setClosedAds] = useState<number[]>([]);

  const totalBalance = 4267.83;

  const addExpense = () => {
    if (!amount || !category) return;
    setTransactions((prev) => [
      {
        id: Date.now(),
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setAmount("");
    setCategory("");
  };

  // Tier-based class maps
  const containerClass: Record<UserTier, string> = {
    posh: "bg-zinc-950 text-yellow-500 font-serif min-h-screen transition-all duration-700",
    middle: "bg-slate-50 text-slate-900 font-sans min-h-screen transition-all duration-300",
    broke:
      "bg-black text-lime-400 font-mono min-h-screen border-8 border-red-600 transition-all duration-100",
  };

  const buttonClass: Record<UserTier, string> = {
    posh: "bg-zinc-900 border border-yellow-700 text-yellow-500 hover:bg-zinc-800 transition-all duration-700 px-4 py-2 rounded",
    middle: "bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors",
    broke:
      "bg-red-600 text-black font-black uppercase rounded-none px-4 py-2 hover:bg-yellow-400 transition-none",
  };

  const cardClass: Record<UserTier, string> = {
    posh: "bg-zinc-900/80 border border-yellow-700/30 rounded-xl p-6 backdrop-blur-sm",
    middle: "bg-white border border-slate-200 rounded-lg p-4 shadow-sm",
    broke: "bg-zinc-900 border-4 border-lime-400 p-4",
  };

  const inputClass: Record<UserTier, string> = {
    posh: "bg-zinc-800 border border-yellow-700/40 text-yellow-400 rounded px-3 py-2 focus:outline-none focus:border-yellow-500 placeholder:text-yellow-700/50",
    middle:
      "bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400",
    broke:
      "bg-black border-2 border-lime-400 text-lime-400 px-3 py-2 focus:outline-none placeholder:text-lime-700 font-mono",
  };

  const sidebarClass: Record<UserTier, string> = {
    posh: "bg-zinc-900/60 border-r border-yellow-700/20",
    middle: "bg-white border-r border-slate-200",
    broke: "bg-zinc-950 border-r-4 border-red-600",
  };

  const navItemClass = (active: boolean): string => {
    const base: Record<UserTier, string> = {
      posh: active
        ? "bg-yellow-500/10 text-yellow-400 border-l-2 border-yellow-500"
        : "text-yellow-600/60 hover:text-yellow-400 border-l-2 border-transparent",
      middle: active
        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
        : "text-slate-500 hover:text-slate-900 border-l-2 border-transparent",
      broke: active
        ? "bg-red-600 text-black font-black"
        : "text-lime-600 hover:text-lime-400",
    };
    return `flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${base[userTier]}`;
  };

  const fakeAds = [
    { id: 1, top: "20%", left: "30%", rotate: "-3deg", text: "EARN £5k TODAY!!" },
    { id: 2, top: "50%", right: "10%", rotate: "2deg", text: "💰 CRYPTO MILLIONAIRE IN 24HRS 💰" },
    { id: 3, bottom: "15%", left: "15%", rotate: "5deg", text: "EARN £5k TODAY!! NO SCAM!!" },
  ];

  return (
    <div className={containerClass[userTier]}>
      {/* DEV CONTROLS */}
      <div className="fixed top-4 right-4 z-[9999] bg-zinc-800 text-white rounded-lg p-4 shadow-2xl border border-zinc-600 font-sans text-sm w-64">
        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2 font-semibold">
          Dev Controls
        </div>
        <div className="flex gap-1 mb-3">
          {(["posh", "middle", "broke"] as UserTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setUserTier(tier);
                setBalanceRevealed(false);
                setClosedAds([]);
              }}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-bold capitalize flex items-center justify-center gap-1 transition-colors ${
                userTier === tier
                  ? "bg-white text-zinc-900"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {TIER_ICONS[tier]} {tier}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-zinc-400 flex justify-between">
            Karma Score <span className="text-white font-bold">{karmaScore}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={karmaScore}
            onChange={(e) => setKarmaScore(parseInt(e.target.value))}
            className="w-full mt-1 accent-blue-500"
          />
        </div>
      </div>

      {/* FAKE ADS — BROKE ONLY */}
      {userTier === "broke" &&
        fakeAds
          .filter((ad) => !closedAds.includes(ad.id))
          .map((ad) => (
            <div
              key={ad.id}
              className="fixed z-[999] bg-yellow-400 text-red-700 font-black text-lg px-6 py-4 shadow-2xl border-4 border-red-600 animate-pulse"
              style={{
                top: ad.top,
                left: ad.left,
                right: (ad as any).right,
                bottom: (ad as any).bottom,
                transform: `rotate(${ad.rotate})`,
              }}
            >
              <div>{ad.text}</div>
              <button
                onClick={() => setClosedAds((prev) => [...prev, ad.id])}
                className="absolute -top-1 -right-1 bg-black text-yellow-400 rounded-full flex items-center justify-center hover:bg-red-800"
                style={{ width: "16px", height: "16px", fontSize: "8px", padding: 0 }}
                title="Close"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          ))}

      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <aside className={`w-64 flex-shrink-0 flex flex-col ${sidebarClass[userTier]}`}>
          <div className={`p-6 ${userTier === "posh" ? "py-10" : ""}`}>
            <h1
              className={`text-2xl font-bold tracking-tight ${
                userTier === "posh"
                  ? "text-yellow-400"
                  : userTier === "broke"
                  ? "text-lime-400"
                  : "text-slate-900"
              }`}
            >
              EgoFi
            </h1>
            <p
              className={`text-xs mt-1 ${
                userTier === "posh"
                  ? "text-yellow-600/50"
                  : userTier === "broke"
                  ? "text-red-500"
                  : "text-slate-400"
              }`}
            >
              {userTier === "posh"
                ? "Wealth Management Suite"
                : userTier === "broke"
                ? "FINANCIAL INTERVENTION MODE"
                : "Personal Finance Dashboard"}
            </p>
          </div>

          <nav className={`flex-1 ${userTier === "posh" ? "mt-8" : "mt-2"}`}>
            {[
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Transactions", icon: ArrowRightLeft },
              { name: "Settings", icon: Settings },
            ].map(({ name, icon: Icon }) => (
              <div key={name} className={navItemClass(activeNav === name)} onClick={() => setActiveNav(name)}>
                <Icon className="w-4 h-4" />
                <span className={userTier === "broke" ? "uppercase text-sm" : "text-sm"}>{name}</span>
              </div>
            ))}
          </nav>

          {/* TOTAL BALANCE */}
          <div className={`p-6 ${userTier === "posh" ? "pb-10" : ""}`}>
            <div className={`text-xs uppercase tracking-wider mb-2 ${
              userTier === "posh" ? "text-yellow-600/60" : userTier === "broke" ? "text-lime-600" : "text-slate-400"
            }`}>
              Total Balance
            </div>
            {userTier === "broke" && !balanceRevealed ? (
              <button
                onClick={() => setBalanceRevealed(true)}
                className="bg-red-600 text-black text-[10px] font-black uppercase px-2 py-2 leading-tight hover:bg-yellow-400 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                PROVE YOU AREN'T A ROBOT TO VIEW BALANCE
              </button>
            ) : (
              <div
                className={`text-3xl font-bold ${
                  userTier === "posh"
                    ? "text-yellow-400"
                    : userTier === "broke"
                    ? "text-lime-400 animate-shake"
                    : "text-slate-900"
                }`}
              >
                £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </div>
            )}
            <div className={`text-xs mt-1 ${
              userTier === "posh" ? "text-yellow-600/40" : userTier === "broke" ? "text-red-400" : "text-slate-400"
            }`}>
              Karma: {karmaScore}/100
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={`flex-1 ${userTier === "posh" ? "p-12" : userTier === "broke" ? "p-4" : "p-6"}`}>
          <div className={`max-w-2xl ${userTier === "posh" ? "mx-auto" : ""}`}>
            {/* ADD EXPENSE FORM */}
            <div className={cardClass[userTier]}>
              <h2
                className={`font-bold mb-4 ${
                  userTier === "posh"
                    ? "text-xl text-yellow-400"
                    : userTier === "broke"
                    ? "text-lg uppercase text-lime-400"
                    : "text-lg text-slate-800"
                }`}
              >
                {userTier === "posh" ? "Record an Expenditure" : userTier === "broke" ? "⚠️ ADD EXPENSE (WHY??)" : "Add Expense"}
              </h2>
              <div className={`flex gap-3 ${userTier === "broke" ? "flex-col" : "items-end"}`}>
                <div className="flex-1">
                  <label className={`text-xs block mb-1 ${
                    userTier === "posh" ? "text-yellow-600/60" : userTier === "broke" ? "text-lime-600 uppercase" : "text-slate-500"
                  }`}>
                    Amount (£)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full ${inputClass[userTier]}`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`text-xs block mb-1 ${
                    userTier === "posh" ? "text-yellow-600/60" : userTier === "broke" ? "text-lime-600 uppercase" : "text-slate-500"
                  }`}>
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder={userTier === "broke" ? "YOUR EXCUSE" : "e.g. Food"}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full ${inputClass[userTier]}`}
                  />
                </div>
                <button onClick={addExpense} className={`${buttonClass[userTier]} flex items-center gap-2 whitespace-nowrap`}>
                  <Plus className="w-4 h-4" />
                  {userTier === "broke" ? "SUBMIT" : "Add"}
                </button>
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className={`${cardClass[userTier]} mt-6`}>
              <h2
                className={`font-bold mb-4 ${
                  userTier === "posh"
                    ? "text-xl text-yellow-400"
                    : userTier === "broke"
                    ? "text-lg uppercase text-lime-400"
                    : "text-lg text-slate-800"
                }`}
              >
                {userTier === "posh" ? "Recent Activity" : userTier === "broke" ? "💸 YOUR CRIMES 💸" : "Recent Transactions"}
              </h2>
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex justify-between items-center py-2 px-3 rounded ${
                      userTier === "posh"
                        ? "border-b border-yellow-700/10 hover:bg-yellow-500/5"
                        : userTier === "broke"
                        ? "border-b-2 border-lime-700 hover:bg-red-900/30"
                        : "border-b border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className={`font-medium text-sm ${
                        userTier === "broke" ? "uppercase" : ""
                      }`}>{tx.category}</div>
                      <div className={`text-xs ${
                        userTier === "posh" ? "text-yellow-600/40" : userTier === "broke" ? "text-lime-700" : "text-slate-400"
                      }`}>{tx.date}</div>
                    </div>
                    <div className={`font-bold ${
                      userTier === "posh"
                        ? "text-yellow-400"
                        : userTier === "broke"
                        ? "text-red-500"
                        : "text-slate-900"
                    }`}>
                      -£{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL — AI ADVISOR */}
        <aside className={`w-80 flex-shrink-0 ${userTier === "posh" ? "p-8" : "p-4"} ${
          userTier === "posh"
            ? "border-l border-yellow-700/20"
            : userTier === "broke"
            ? "border-l-4 border-red-600"
            : "border-l border-slate-200"
        }`}>
          <div className={cardClass[userTier]}>
            <div className="flex items-center gap-2 mb-4">
              <Bot className={`w-5 h-5 ${
                userTier === "posh" ? "text-yellow-400" : userTier === "broke" ? "text-red-500" : "text-blue-600"
              }`} />
              <h3 className={`font-bold ${
                userTier === "posh"
                  ? "text-yellow-400"
                  : userTier === "broke"
                  ? "text-lime-400 uppercase text-sm"
                  : "text-slate-800"
              }`}>
                {userTier === "posh"
                  ? "Concierge AI"
                  : userTier === "broke"
                  ? "⚠️ INTERVENTION BOT"
                  : "AI Advisor"}
              </h3>
            </div>
            <div
              className={`text-sm leading-relaxed ${
                userTier === "posh"
                  ? "text-yellow-500/80 italic"
                  : userTier === "broke"
                  ? "text-lime-400 font-black uppercase"
                  : "text-slate-600"
              }`}
            >
              {AI_MESSAGES[userTier]}
            </div>
            <div className={`mt-4 pt-4 border-t text-xs ${
              userTier === "posh"
                ? "border-yellow-700/20 text-yellow-600/40"
                : userTier === "broke"
                ? "border-red-600 text-red-500"
                : "border-slate-100 text-slate-400"
            }`}>
              Karma Score Impact: {karmaScore > 70 ? "Positive" : karmaScore > 30 ? "Neutral" : "Critical"}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
