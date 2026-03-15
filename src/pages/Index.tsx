import { useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  X,
  ShieldCheck,
  Crown,
  Skull,
  Meh,
} from "lucide-react";
import type { UserTier, AppView } from "@/lib/tierConfig";
import { containerClass, sidebarClass, INITIAL_TRANSACTIONS } from "@/lib/tierConfig";
import Onboarding from "@/components/Onboarding";
import DashboardView from "@/components/DashboardView";
import TransactionsView from "@/components/TransactionsView";
import SettingsView from "@/components/SettingsView";
import AIAdvisor from "@/components/AIAdvisor";

const TIER_ICONS: Record<UserTier, React.ReactNode> = {
  posh: <Crown className="w-4 h-4" />,
  middle: <Meh className="w-4 h-4" />,
  broke: <Skull className="w-4 h-4" />,
};

export default function Index() {
  const [appState, setAppState] = useState<AppView>("onboarding");
  const [userTier, setUserTier] = useState<UserTier>("middle");
  const [karmaScore, setKarmaScore] = useState(50);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [activeNav, setActiveNav] = useState<"Dashboard" | "Transactions" | "Settings">("Dashboard");
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  const [closedAds, setClosedAds] = useState<number[]>([]);

  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const totalBalance = 4267.83;

  const addExpense = async (amount: string, category: string) => {
    const numAmount = parseFloat(amount);
    setTransactions((prev) => [
      { id: Date.now(), amount: numAmount, category, date: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);

    // Karma auto-adjustment
    if (numAmount > 100) {
      setKarmaScore((k) => Math.max(0, k - 10));
    } else if (numAmount < 10) {
      setKarmaScore((k) => Math.min(100, k + 2));
    }

    // Call Gemini API
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCf_oxuByYGLkzqBZRO5eYL78UL8VZo6-c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: `You are EgoFi AI. User Tier: ${userTier}, Karma: ${karmaScore}. If Posh: Be a sycophant butler. If Middle: Be passive-aggressive. If Broke: Be a screaming hustle-bro. The user just spent £${numAmount.toFixed(2)} on ${category}. Roast them or praise them in 1 sentence.`
              }]
            },
            contents: [{ parts: [{ text: `I just spent £${numAmount.toFixed(2)} on ${category}.` }] }],
          }),
        }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "The AI is speechless.";
      setAiResponse(text);
    } catch {
      setAiResponse("AI judgment failed. You got lucky this time.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOnboardingComplete = (tier: UserTier, karma: number) => {
    setUserTier(tier);
    setKarmaScore(karma);
    setAppState("dashboard");
  };

  const handleHardReset = () => {
    setAppState("onboarding");
    setTransactions(INITIAL_TRANSACTIONS);
    setActiveNav("Dashboard");
    setBalanceRevealed(false);
    setClosedAds([]);
  };

  const navItemClass = (active: boolean): string => {
    const base: Record<UserTier, string> = {
      posh: active
        ? "bg-amber-500/10 text-amber-300 border-l-2 border-amber-400"
        : "text-amber-600/50 hover:text-amber-300 border-l-2 border-transparent",
      middle: active
        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
        : "text-slate-400 hover:text-slate-900 border-l-2 border-transparent",
      broke: active
        ? "bg-red-600 text-black font-black"
        : "text-lime-600 hover:text-lime-400",
    };
    return `flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${base[userTier]}`;
  };

  // Show onboarding
  if (appState === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const fakeAds = [
    { id: 1, top: "20%", left: "30%", rotate: "-3deg", text: "EARN £5k TODAY!!" },
    { id: 2, top: "50%", right: "10%", rotate: "2deg", text: "💰 CRYPTO MILLIONAIRE IN 24HRS 💰" },
    { id: 3, bottom: "15%", left: "15%", rotate: "5deg", text: "EARN £5k TODAY!! NO SCAM!!" },
  ];

  const currentView = (() => {
    switch (activeNav) {
      case "Transactions": return <TransactionsView userTier={userTier} extraTransactions={transactions.filter(t => !INITIAL_TRANSACTIONS.find(it => it.id === t.id))} />;
      case "Settings": return <SettingsView userTier={userTier} onHardReset={handleHardReset} />;
      default: return <DashboardView userTier={userTier} transactions={transactions} onAddExpense={addExpense} />;
    }
  })();

  return (
    <div className={containerClass[userTier]}>
      {/* DEV CONTROLS */}
      <div className="fixed top-4 right-4 z-[9999] bg-zinc-800 text-white rounded-lg p-4 shadow-2xl border border-zinc-600 font-sans text-sm w-64">
        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2 font-semibold">Dev Controls</div>
        <div className="flex gap-1 mb-3">
          {(["posh", "middle", "broke"] as UserTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => { setUserTier(tier); setBalanceRevealed(false); setClosedAds([]); }}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-bold capitalize flex items-center justify-center gap-1 transition-colors ${
                userTier === tier ? "bg-white text-zinc-900" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
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
          <input type="range" min="0" max="100" value={karmaScore} onChange={(e) => setKarmaScore(parseInt(e.target.value))} className="w-full mt-1 accent-blue-500" />
        </div>
      </div>

      {/* FAKE ADS — BROKE ONLY */}
      {userTier === "broke" && fakeAds.filter((ad) => !closedAds.includes(ad.id)).map((ad) => (
        <div key={ad.id} className="fixed z-[999] bg-yellow-400 text-red-700 font-black text-lg px-6 py-4 shadow-2xl border-4 border-red-600 animate-pulse"
          style={{ top: ad.top, left: ad.left, right: (ad as any).right, bottom: (ad as any).bottom, transform: `rotate(${ad.rotate})` }}>
          <div>{ad.text}</div>
          <button onClick={() => setClosedAds((prev) => [...prev, ad.id])}
            className="absolute -top-1 -right-1 bg-black text-yellow-400 rounded-full flex items-center justify-center hover:bg-red-800"
            style={{ width: "16px", height: "16px", fontSize: "8px", padding: 0 }} title="Close">
            <X className="w-2 h-2" />
          </button>
        </div>
      ))}

      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <aside className={`w-64 flex-shrink-0 flex flex-col ${sidebarClass[userTier]}`}>
          <div className={`p-6 ${userTier === "posh" ? "py-10" : ""}`}>
            <h1 className={`text-2xl font-bold tracking-tight ${
              userTier === "posh" ? "text-amber-300" : userTier === "broke" ? "text-lime-400" : "text-slate-900"
            }`}>EgoFi</h1>
            <p className={`text-xs mt-1 ${
              userTier === "posh" ? "text-amber-500/40" : userTier === "broke" ? "text-red-500" : "text-slate-400"
            }`}>
              {userTier === "posh" ? "Wealth Management Suite" : userTier === "broke" ? "FINANCIAL INTERVENTION MODE" : "Personal Finance Dashboard"}
            </p>
          </div>

          <nav className={`flex-1 ${userTier === "posh" ? "mt-8" : "mt-2"}`}>
            {([
              { name: "Dashboard" as const, icon: LayoutDashboard },
              { name: "Transactions" as const, icon: ArrowRightLeft },
              { name: "Settings" as const, icon: Settings },
            ]).map(({ name, icon: Icon }) => (
              <div key={name} className={navItemClass(activeNav === name)} onClick={() => setActiveNav(name)}>
                <Icon className="w-4 h-4" />
                <span className={userTier === "broke" ? "uppercase text-sm" : "text-sm"}>{name}</span>
              </div>
            ))}
          </nav>

          {/* TOTAL BALANCE */}
          <div className={`p-6 ${userTier === "posh" ? "pb-10" : ""}`}>
            <div className={`text-xs uppercase tracking-wider mb-2 ${
              userTier === "posh" ? "text-amber-500/50" : userTier === "broke" ? "text-lime-600" : "text-slate-400"
            }`}>Total Balance</div>
            {userTier === "broke" && !balanceRevealed ? (
              <button onClick={() => setBalanceRevealed(true)}
                className="bg-red-600 text-black text-[10px] font-black uppercase px-2 py-2 leading-tight hover:bg-yellow-400 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> PROVE YOU AREN'T A ROBOT TO VIEW BALANCE
              </button>
            ) : (
              <div className={`text-3xl font-bold ${
                userTier === "posh" ? "text-amber-300" : userTier === "broke" ? "text-lime-400" : "text-slate-900"
              }`}>
                £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </div>
            )}
            <div className={`text-xs mt-1 ${
              userTier === "posh" ? "text-amber-500/30" : userTier === "broke" ? "text-red-400" : "text-slate-400"
            }`}>Karma: {karmaScore}/100</div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={`flex-1 ${userTier === "posh" ? "p-12" : userTier === "broke" ? "p-4" : "p-6"}`}>
          {currentView}
        </main>

        {/* RIGHT PANEL — AI ADVISOR */}
        <aside className={`w-80 flex-shrink-0 ${userTier === "posh" ? "p-8" : "p-4"} ${
          userTier === "posh" ? "border-l border-amber-500/10" : userTier === "broke" ? "border-l-4 border-red-600" : "border-l border-slate-200"
        }`}>
          <AIAdvisor userTier={userTier} karmaScore={karmaScore} />
        </aside>
      </div>
    </div>
  );
}
