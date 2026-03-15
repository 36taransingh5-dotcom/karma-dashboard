import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  X,
  ShieldCheck,
  Bell,
  LogOut,
  User,
} from "lucide-react";
import type { UserTier, AppView, Transaction } from "@/lib/tierConfig";
import { containerClass, sidebarClass, cardClass, buttonClass, INITIAL_TRANSACTIONS } from "@/lib/tierConfig";
import Onboarding from "@/components/Onboarding";
import AIChatView from "@/components/AIChatView";
import TransactionsView from "@/components/TransactionsView";
import SettingsView from "@/components/SettingsView";
import { auditSpending } from "@/lib/wasteAuditor";



export interface Message {
  role: "user" | "ai";
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [graveyardMode, setGraveyardMode] = useState(false);

  const [totalBalance, setTotalBalance] = useState(4267.83);
  const [effectiveTier, setEffectiveTier] = useState<UserTier>(userTier);

  // Enforce 'broke' tier if balance is under £1000
  useEffect(() => {
    if (totalBalance < 1000) {
      if (effectiveTier !== "broke") {
        setEffectiveTier("broke");
        setGraveyardMode(true); // Automatically trigger graveyard mode for maximum intervention
      }
    } else {
      setEffectiveTier(userTier);
    }
  }, [totalBalance, userTier, effectiveTier]);

  const addExpense = async (amount: string, category: string, quantity?: string, price?: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    const numPrice = price ? parseFloat(price) : (quantity ? numAmount / parseInt(quantity) : numAmount);
    const numQty = quantity ? parseInt(quantity) : 1;

    setTransactions((prev) => [
      {
        id: Date.now(),
        amount: numAmount,
        price: numPrice,
        quantity: numQty,
        category,
        date: new Date().toISOString().split("T")[0]
      },
      ...prev,
    ]);

    setTotalBalance((prev) => prev - numAmount);

    // Karma Update Logic
    setKarmaScore(prev => {
      let next = prev;
      if (numAmount > 100) next -= 10;
      else if (numAmount < 10) next += 2;
      return Math.max(0, Math.min(100, next));
    });
  };

  const handleChat = async (input: string) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const apiKey = "sk-hc-v1-24e713564a5c495e920e1df718d512deaf23c4b1afe44e57bea542428b5d5c35";

      // Attempt to extract values for the prompt
      const amountMatch = input.match(/£?(\d+(?:\.\d+)?)/);
      const categoryMatch = input.match(/(?:for|on|bought)\s+([a-zA-Z\s]+)(?:\s+for|£|$)/i);
      const detectedAmount = amountMatch ? amountMatch[1] : "[Detecting...]";
      const detectedCategory = categoryMatch ? categoryMatch[1].trim() : "[Detecting...]";

      const recentActivity = transactions.length > 0
        ? transactions.slice(0, 5).map(t => `${t.category} (£${t.amount})`).join(", ")
        : "No previous expenses logged.";

      const systemPrompt = `You are EgoFi, an expert financial advisor. Your core objective is to provide GENUINE, practical financial advice regarding the user's latest expense. 
However, you MUST deliver this advice entirely in the persona of the user's assigned Tier.

USER CONTEXT:
- Expense logged: £${detectedAmount} on ${detectedCategory}
- Tier: ${userTier}
- Financial Karma Score: ${karmaScore}/100
- Total Balance: £${totalBalance.toLocaleString()}
- Recent Activity: ${recentActivity}

PERSONA RULES:
IF TIER IS 'posh': 
Persona: Elite Financial Butler.
Advice Style: You are a refined, high-status butler. You listen to expenses and respond with strict judgment filtered through extreme politeness. Call the user "Master". Acknowledge them politely but strictly.
Example: "Master, while £500 on a dinner is a trifle for a gentleman of your standing, perhaps such capital is better deployed in our tax-advantaged bond yields."


IF TIER IS 'middle': 
Persona: Stressed, passive-aggressive corporate accountant.
Advice Style: Give solid budgeting, ISA, and retirement advice, but sigh heavily and act annoyed that they are spending money on small luxuries. 
Example: "Another £15 on takeaway. If you put that into a high-yield savings account instead, you might actually get to retire before your hair falls out."

IF TIER IS 'broke': 
Persona: Aggressive, tough-love hustle-bro.
Advice Style: Give strict, fundamental survival advice (cutting costs, emergency funds, increasing income), but scream at them. Use occasional ALL CAPS. Be ruthless but actually financially helpful.
Example: "£5 ON COFFEE?! YOU DON'T HAVE AN EMERGENCY FUND! MAKE IT AT HOME AND PUT THAT £5 INTO SAVINGS BEFORE YOU GO BANKRUPTCY!"

CRITICAL CONSTRAINTS:
1. Provide ACTUAL financial value/advice related to the expense.
2. MAX 3 SENTENCES. Keep it punchy and dashboard-friendly.
3. NO conversational filler. NO markdown. NO emojis.

RESPONSE FORMAT:
{ "transaction": { "category": string, "amount": number, "quantity": number, "unit_price": number } | null }
[YOUR VERBAL RESPONSE HERE]`;

      const res = await fetch(
        "/api/ai/chat",

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",

            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map(m => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content
              })),
              { role: "user", content: input }
            ]
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "API Error");

      const rawResponse = data.choices?.[0]?.message?.content || "";

      // Extract JSON and text
      let adviceText = rawResponse;
      let transactionData: any = null;

      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          transactionData = JSON.parse(jsonMatch[0]);
          adviceText = rawResponse.replace(jsonMatch[0], "").trim();
        }
      } catch (e) {

        console.warn("JSON parse failed", e);
      }

      setAiResponse(adviceText);
      setMessages(prev => [...prev, { role: "ai", content: adviceText }]);

      if (transactionData?.transaction) {
        const { amount, category, quantity, unit_price } = transactionData.transaction;
        addExpense(
          amount.toString(),
          category,
          quantity ? quantity.toString() : "1",
          unit_price ? unit_price.toString() : amount.toString()
        );
      }
    } catch (error) {
      console.error("DETAILED API FAILURE:");
      console.dir(error);

      // Calculate local noise for the Graveyard effect
      const audited = auditSpending(transactions);
      const noiseTotal = audited
        .filter(tx => tx.spendingType === "noise")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const fallbackMessage = `OFFLINE MODE: Cloud units are occupied, but my local Auditor is active. I've detected £${noiseTotal.toFixed(2)} in absolute financial waste. Initiating incineration sequence.`;

      // Ensure state updates to trigger the 'burning' animations in AIChatView
      setAiResponse(fallbackMessage);
      setMessages(prev => [...prev, { role: "ai", content: fallbackMessage }]);
    } finally {

      setAiLoading(false);
    }
  };

  const handleOnboardingComplete = (tier: UserTier) => {
    setUserTier(tier);
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
        ? "bg-white/5 text-white border-l-2 border-white"
        : "text-white/20 hover:text-white hover:bg-white/5 border-l-2 border-transparent",
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
      case "Transactions": return <TransactionsView userTier={userTier} extraTransactions={transactions.filter(t => !INITIAL_TRANSACTIONS.find(it => it.id === t.id))} graveyardMode={graveyardMode} />;
      case "Settings": return <SettingsView userTier={userTier} onHardReset={handleHardReset} />;
      default: return (
        <AIChatView
          userTier={effectiveTier}
          transactions={transactions}
          onAddExpense={addExpense}
          onChat={handleChat}
          aiLoading={aiLoading}
          aiResponse={aiResponse}
          messages={messages}
          setMessages={setMessages}
          graveyardMode={graveyardMode}
        />
      );
    }
  })();

  const renderDashboardCharts = () => {
    if (userTier === "broke") {
      return (
        <div className="flex flex-col items-center justify-center p-20 border-4 border-red-600 bg-black text-red-600 animate-pulse">
          <ShieldCheck className="w-20 h-20 mb-6" />
          <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter text-center">Stats Locked: Account Under Review</h2>
          <p className="text-lg font-bold text-center border-t-2 border-red-900 pt-4 uppercase">
            YOU ARE NOT WORTHY OF THESE ANALYTICS.<br />
            EARN £10,000+ TO UNLOCK FINANCIAL INSIGHTS.
          </p>
          <div className="mt-8 text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
            <X className="w-3 h-3" /> Minimum Net Worth Requirement Not Met
          </div>
        </div>
      );
    }

    const isPosh = effectiveTier === "posh";
    const barBg = isPosh ? "bg-white" : "bg-[#003366]";
    const cardStyle = cardClass[effectiveTier];

    return (
      <div className="space-y-12 relative">
        {/* Subtle Background Glow for Posh */}
        {isPosh && (
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className={`${cardStyle} relative overflow-hidden group`}>
            {isPosh && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />}
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-6 ${isPosh ? "text-white/40" : "text-slate-500"}`}>Current Liquidity</h3>
            <div className={`text-4xl font-bold tracking-tighter mb-6 ${isPosh ? "text-white" : "text-slate-900"}`}>
              £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isPosh ? "text-white/30" : "text-slate-500"}`}>Credit Reputation</span>
                <span className={`text-xs font-bold ${isPosh ? "text-white" : "text-slate-700"}`}>{karmaScore}/100</span>
              </div>
              <div className={`h-[2px] rounded-full overflow-hidden ${isPosh ? "bg-white/5" : "bg-slate-100"}`}>
                <div
                  className={`h-full transition-all duration-1000 ${isPosh ? "bg-white shadow-[0_0_10px_white]" : "bg-[#003366]"}`}
                  style={{ width: `${karmaScore}%` }}
                />
              </div>
              <div className={`mt-4 text-[10px] uppercase tracking-widest font-bold ${isPosh ? "text-white/20" : "text-slate-500"}`}>
                Designation: <span className={isPosh ? "text-white" : "text-slate-900"}>{isPosh ? "Elite Member" : "Standard Saver"}</span>
              </div>
            </div>
          </div>

          <div className={`${cardStyle} relative overflow-hidden group`}>
            {isPosh && <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-white/[0.05] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />}
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-6 flex justify-between items-center ${isPosh ? "text-white/40" : "text-slate-500"}`}>
              Investment Analytics
              <span className={`h-[1px] flex-1 ml-4 ${isPosh ? "bg-white/5" : "bg-slate-200"}`}></span>
            </h3>
            <div className="h-32 flex items-end gap-3 px-2 border-l border-b border-transparent relative">
              {[35, 25, 45, 30, 35, 40].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className={`w-full transition-all duration-700 ${isPosh ? "bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-[#003366] hover:bg-blue-700"}`}
                    style={{ height: `${h * 2}px` }}
                  />
                  <div
                    className={`w-full opacity-20 transition-all duration-500 ${isPosh ? "bg-white" : "bg-[#999]"}`}
                    style={{ height: `${h * 1.5}px` }}
                  />
                  <span className={`absolute -bottom-6 text-[8px] uppercase tracking-tighter ${isPosh ? "text-white/30" : "text-slate-400"}`}>
                    {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardStyle} relative overflow-hidden group`}>
            {isPosh && <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.02] to-white/[0.05] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />}
            <h3 className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-6 ${isPosh ? "text-white/40" : "text-slate-500"}`}>Asset Allocation</h3>
            <div className="flex items-center gap-8">
              <div className={`relative w-32 h-32 rounded-full border border-transparent overflow-hidden ${isPosh ? "bg-white/5 shadow-2xl" : "bg-slate-50 shadow-inner"} flex items-center justify-center`}>
                <div className={`absolute inset-0 ${isPosh ? "bg-white/40" : "bg-[#003366]"}`} style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 60%)' }}></div>
                <div className={`absolute inset-0 ${isPosh ? "bg-white/20" : "bg-[#CC3333]"}`} style={{ clipPath: 'polygon(50% 50%, 0% 60%, 0% 100%, 50% 100%)' }}></div>
                <div className={`absolute inset-0 ${isPosh ? "bg-white/10" : "bg-[#339933]"}`} style={{ clipPath: 'polygon(50% 50%, 50% 100%, 100% 100%, 100% 70%)' }}></div>
                <div className={`w-28 h-28 rounded-full z-10 ${isPosh ? "bg-[#0A0A0A]" : "bg-white"}`}></div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Equities", color: isPosh ? "bg-white/40" : "bg-[#003366]", val: "£2400" },
                  { label: "Bonds", color: isPosh ? "bg-white/20" : "bg-[#CC3333]", val: "£1680" },
                  { label: "Cash", color: isPosh ? "bg-white/10" : "bg-[#339933]", val: "£720" }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest leading-none">
                    <div className={`w-2 h-2 ${item.color}`}></div>
                    <span className={isPosh ? "text-white/40" : "text-slate-600"}>{item.label}</span>
                    <span className={isPosh ? "text-white" : "text-slate-900"}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {activeNav === "Dashboard" && effectiveTier !== "middle" && (
          <div className="mt-12">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-8 ${isPosh ? "text-white" : "text-slate-900"}`}>Financial Concierge</h3>
            <AIChatView
              userTier={effectiveTier}
              transactions={transactions}
              onAddExpense={addExpense}
              onChat={handleChat}
              aiLoading={aiLoading}
              aiResponse={aiResponse}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        )}
      </div>
    );
  };

  // MIDDLE TIER HEADER (SmartSpend)
  if (effectiveTier === "middle") {
    return (
      <div className={containerClass[effectiveTier]}>
        {/* Top Header */}
        <header className="bg-[#003366] text-white px-6 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">SmartSpend</span>
            <span className="text-[10px] text-blue-200 border border-blue-400 px-2 py-0.5 rounded ml-2">Personal Finance Portal</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-2 text-blue-100">
              <span>{new Date().toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#004A99] px-3 py-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <span className="bg-white text-[#003366] w-6 h-6 rounded-full flex items-center justify-center font-bold">JD</span>
              <span>Welcome, John</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-200" onClick={handleHardReset}>
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="bg-white border-b border-[#D1D1D1] px-6 flex items-center">
          {([
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Transactions", icon: ArrowRightLeft },
            { name: "Accounts", icon: User },
            { name: "Settings", icon: Settings },
          ]).map(({ name }) => (
            <button
              key={name}
              onClick={() => name !== "Accounts" && setActiveNav(name as any)}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeNav === name || (name === "Accounts" && false)
                ? "border-[#003366] text-[#003366] bg-slate-50"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {name}
            </button>
          ))}
        </nav>

        {/* Main Content Grid */}
        <main className="p-6 max-w-[1400px] mx-auto">
          {activeNav === "Dashboard" ? renderDashboardCharts() : currentView}
        </main>
      </div>
    );
  }

  return (
    <div className={containerClass[effectiveTier]}>
      {/* FAKE ADS — BROKE ONLY */}
      {effectiveTier === "broke" && fakeAds.filter((ad) => !closedAds.includes(ad.id)).map((ad) => (
        <div key={ad.id} className="fixed z-[999] bg-yellow-400 text-red-700 font-black text-lg px-6 py-4 shadow-2xl border-4 border-red-600 animate-pulse"
          style={{
            top: (ad as any).top,
            bottom: (ad as any).bottom,
            left: (ad as any).left,
            right: (ad as any).right,
            transform: `rotate(${ad.rotate})`
          }}>
          <div>{ad.text}</div>
          <button onClick={() => setClosedAds((prev) => [...prev, ad.id])}
            className="absolute -top-1 -right-1 bg-black text-yellow-400 rounded-full flex items-center justify-center hover:bg-red-800"
            style={{ width: "16px", height: "16px", fontSize: "8px", padding: 0 }} title="Close">
            <X className="w-2 h-2" />
          </button>
        </div>
      ))}

      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR (POSH & BROKE ONLY) */}
        <aside className={`w-64 flex-shrink-0 flex flex-col ${sidebarClass[effectiveTier]}`}>
          <div className={`p-6 ${effectiveTier === "posh" ? "py-10" : ""}`}>
            <h1 className={`text-2xl font-bold tracking-tighter ${effectiveTier === "posh" ? "text-white" : effectiveTier === "broke" ? "text-lime-400" : "text-slate-900"
              }`}>EgoFi</h1>
            <p className={`text-xs mt-1 ${effectiveTier === "posh" ? "text-white/30" : effectiveTier === "broke" ? "text-red-500" : "text-slate-400"
              }`}>
              {effectiveTier === "posh" ? "THE ULTIMATE MEMBERSHIP" : effectiveTier === "broke" ? "FINANCIAL INTERVENTION MODE" : "Personal Finance Dashboard"}
            </p>
          </div>

          <nav className={`flex-1 ${effectiveTier === "posh" ? "mt-8" : "mt-2"}`}>
            {([
              { name: "Dashboard" as const, icon: LayoutDashboard },
              { name: "Transactions" as const, icon: ArrowRightLeft },
              { name: "Settings" as const, icon: Settings },
            ]).map(({ name, icon: Icon }) => (
              <div key={name} className={navItemClass(activeNav === name)} onClick={() => setActiveNav(name)}>
                <Icon className="w-4 h-4" />
                <span className={effectiveTier === "broke" ? "uppercase text-sm" : "text-sm"}>{name}</span>
              </div>
            ))}

            {/* Graveyard Toggle */}
            <div
              className={`mt-10 mx-4 p-4 border-2 transition-all cursor-pointer group ${graveyardMode
                ? "border-orange-500 bg-orange-950 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }`}
              onClick={() => setGraveyardMode(!graveyardMode)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest">Graveyard Mode</span>
                <div className={`w-2 h-2 rounded-full ${graveyardMode ? "bg-orange-500 animate-pulse" : "bg-slate-800"}`} />
              </div>
              <p className="text-[8px] uppercase tracking-tighter leading-tight opacity-60">
                {graveyardMode ? "INCINERATING WASTE..." : "SWITCH TO BATTLEFIELD VIEW"}
              </p>
            </div>
          </nav>

          <div className={`p-6 ${userTier === "posh" ? "pb-10" : ""}`}>
            <div className={`text-xs uppercase tracking-[0.2em] mb-2 ${userTier === "posh" ? "text-white/20" : userTier === "broke" ? "text-lime-600" : "text-slate-400"
              }`}>Net Worth</div>
            {userTier === "broke" && !balanceRevealed ? (
              <button onClick={() => setBalanceRevealed(true)}
                className="bg-red-600 text-black text-[10px] font-black uppercase px-2 py-2 leading-tight hover:bg-yellow-400 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> PROVE YOU AREN'T A ROBOT TO VIEW BALANCE
              </button>
            ) : (
              <div className={`text-3xl font-bold tracking-tight ${userTier === "posh" ? "text-white" : userTier === "broke" ? "text-lime-400" : "text-slate-900"
                }`}>
                £{totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </div>
            )}
            <div className={`text-xs mt-6 uppercase tracking-[0.2em] mb-1 ${userTier === "posh" ? "text-white/20" : userTier === "broke" ? "text-red-600" : "text-slate-400"
              }`}>Credit Karma</div>
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-[2px] ${userTier === "posh" ? "bg-white/5" : "bg-zinc-800"} rounded-full overflow-hidden`}>
                <div
                  className={`h-full transition-all duration-1000 ${userTier === "posh" ? "bg-white" : karmaScore > 70 ? "bg-amber-400" : karmaScore > 30 ? "bg-blue-500" : "bg-red-600"
                    }`}
                  style={{ width: `${karmaScore}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${userTier === "posh" ? "text-white" : userTier === "broke" ? "text-red-500" : "text-slate-600"}`}>{karmaScore}</span>
            </div>

            <div className={`text-[10px] tracking-[0.3em] font-black text-center border py-2 ${userTier === "posh" ? "text-white border-white/20" : userTier === "broke" ? "text-red-400 border-red-900" : "text-slate-400 border-slate-200"
              }`}>{userTier.toUpperCase()} MEMBER</div>
          </div>
        </aside>

        <main className={`flex-1 transition-all duration-1000 ${graveyardMode
          ? "p-0 overflow-hidden bg-gradient-to-br from-[#1a0f00] via-black to-[#2a1a00] border-l border-orange-900/30"
          : (userTier === "posh" ? "p-0 overflow-hidden bg-gradient-to-br from-black via-[#0A0A0A] to-[#111]" : userTier === "broke" ? "p-4" : "p-6")
          }`}>

          {currentView}
        </main>
      </div>
    </div>
  );
}

const navItemClassForPosh = (active: boolean): string => {
  return active
    ? "bg-white/5 text-white border-l-2 border-white"
    : "text-white/30 hover:text-white hover:bg-white/5 border-l-2 border-transparent";
};
