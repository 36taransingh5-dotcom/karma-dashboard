export type UserTier = "posh" | "middle" | "broke";
export type AppView = "onboarding" | "dashboard" | "transactions" | "settings";

export interface Transaction {
  id: number;
  amount: number; // This will be the total (price * quantity)
  price: number;
  quantity: number;
  category: string;
  date: string;
  description?: string;
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, amount: 42.5, price: 42.5, quantity: 1, category: "Dining", date: "2026-03-13", description: "Nando's with mates" },
  { id: 2, amount: 120.0, price: 120.0, quantity: 1, category: "Shopping", date: "2026-03-12", description: "ASOS haul" },
  { id: 3, amount: 8.99, price: 8.99, quantity: 1, category: "Coffee", date: "2026-03-11", description: "Oat milk latte" },
  { id: 4, amount: 55.0, price: 55.0, quantity: 1, category: "Transport", date: "2026-03-10", description: "Uber surge pricing" },
];

export const FULL_TRANSACTIONS: Transaction[] = [
  ...INITIAL_TRANSACTIONS,
  { id: 5, amount: 15.0, price: 15.0, quantity: 1, category: "Subscriptions", date: "2026-03-09", description: "Netflix Premium" },
  { id: 6, amount: 340.0, price: 340.0, quantity: 1, category: "Bills", date: "2026-03-08", description: "Electric bill" },
  { id: 7, amount: 22.5, price: 22.5, quantity: 1, category: "Dining", date: "2026-03-07", description: "Deliveroo order" },
  { id: 8, amount: 67.0, price: 67.0, quantity: 1, category: "Shopping", date: "2026-03-06", description: "New trainers" },
  { id: 9, amount: 4.5, price: 4.5, quantity: 1, category: "Coffee", date: "2026-03-05", description: "Flat white" },
  { id: 10, amount: 200.0, price: 200.0, quantity: 1, category: "Transport", date: "2026-03-04", description: "Monthly Oyster card" },
];

export function getAIMessage(tier: UserTier): string {
  if (tier === "posh") {
    return "Your Excellency, every transaction you make elevates the economy. Shall I polish your portfolio?";
  }
  if (tier === "middle") {
    return "Are you sure about that spending? Your pension is crying. Maybe consider a thermos?";
  }
  // broke
  return "WAKE UP! STOP BUYING TAKEAWAY AND START DROPSHIPPING! YOUR BANK CALLED — THEY WANT THEIR OVERDRAFT BACK!";
}

export const containerClass: Record<UserTier, string> = {
  posh: "bg-[#2A0505] text-amber-200 font-serif min-h-screen transition-all duration-700",
  middle: "bg-white text-slate-900 font-sans min-h-screen transition-all duration-300",
  broke: "bg-black text-lime-400 font-mono min-h-screen border-8 border-red-600 transition-all duration-100",
};

export const buttonClass: Record<UserTier, string> = {
  posh: "bg-gradient-to-tr from-[#996515] via-[#D4AF37] to-[#F9E27D] text-black font-bold hover:brightness-110 transition-all duration-700 px-4 py-2 rounded-lg",
  middle: "bg-blue-600 text-white rounded-2xl px-4 py-2 hover:bg-blue-700 transition-colors font-medium",
  broke: "bg-red-600 text-black font-black uppercase rounded-none px-4 py-2 hover:bg-yellow-400 transition-none",
};

export const cardClass: Record<UserTier, string> = {
  posh: "bg-white/5 border border-amber-500/20 rounded-xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.1)]",
  middle: "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm",
  broke: "bg-zinc-900 border-4 border-lime-400 p-4",
};

export const inputClass: Record<UserTier, string> = {
  posh: "bg-white/5 border border-amber-500/20 text-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 placeholder:text-amber-700/50 backdrop-blur-sm",
  middle: "bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400",
  broke: "bg-black border-2 border-lime-400 text-lime-400 px-3 py-2 focus:outline-none placeholder:text-lime-700 font-mono",
};

export const sidebarClass: Record<UserTier, string> = {
  posh: "bg-[#1A0303]/80 border-r border-amber-500/10",
  middle: "bg-slate-50 border-r border-slate-200",
  broke: "bg-zinc-950 border-r-4 border-red-600",
};
