import { ArrowDownLeft, ArrowUpRight, Search, Flame } from "lucide-react";
import type { UserTier, Transaction } from "@/lib/tierConfig";
import { cardClass, inputClass } from "@/lib/tierConfig";
import { FULL_TRANSACTIONS } from "@/lib/tierConfig";
import { auditSpending } from "@/lib/wasteAuditor";

interface TransactionsViewProps {
  userTier: UserTier;
  extraTransactions: Transaction[];
  graveyardMode?: boolean;
}

export default function TransactionsView({ userTier, extraTransactions, graveyardMode }: TransactionsViewProps) {
  const allTransactions = [...extraTransactions, ...FULL_TRANSACTIONS].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const auditedTx = auditSpending(allTransactions);
  const displayedTx = graveyardMode
    ? auditedTx.filter(tx => tx.spendingType === "signal")
    : auditedTx;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${graveyardMode ? "text-orange-500 font-black tracking-tighter" : userTier === "posh" ? "text-white uppercase tracking-widest" : "text-slate-900"}`}>
            {graveyardMode && <Flame className="w-6 h-6 animate-pulse" />}
            {graveyardMode ? "BATTLEFIELD REPORT" : userTier === "posh" ? "Ledger / Statements" : "Transactions"}
          </h2>
          <p className={`text-sm ${graveyardMode ? "text-orange-900 font-bold uppercase" : "text-slate-500"}`}>
            {graveyardMode ? "ONLY LOAD-BEARING SIGNALS REMAIN" : userTier === "posh" ? "Comprehensive asset movement history" : "View and manage your recent activity"}
          </p>
        </div>
      </div>
      <div className={`${cardClass[userTier]} p-0 overflow-hidden ${graveyardMode ? "border-orange-900/50 bg-[#0a0500]" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${graveyardMode ? "border-orange-900/50 bg-orange-950/20" : userTier === "posh" ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Status</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Ledger Entry</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Category</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Reference</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Quantity</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>Valuation</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${graveyardMode ? "divide-orange-900/30" : userTier === "posh" ? "divide-white/5" : "divide-slate-100"}`}>
              {displayedTx.map((tx) => (
                <tr key={tx.id} className={`group transition-colors ${graveyardMode ? "hover:bg-orange-500/5" : userTier === "posh" ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${graveyardMode ? "bg-orange-500/10 text-orange-500" :
                      userTier === "posh" ? "bg-white/5 text-white" : "bg-red-50 text-red-600"
                      }`}>
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-bold ${graveyardMode ? "text-orange-200" : userTier === "posh" ? "text-white" : "text-slate-900"}`}>{tx.category}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-widest opacity-40 ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white" : "text-slate-500"}`}>{tx.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest ${graveyardMode ? "bg-orange-900/30 text-orange-500 border border-orange-500/20" :
                      userTier === "posh" ? "bg-white/5 text-white border border-white/10" : "bg-slate-100 text-slate-600"
                      }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-xs ${graveyardMode ? "text-orange-400 font-mono italic" : userTier === "posh" ? "text-white/40" : "text-slate-500"}`}>
                      {graveyardMode ? tx.auditReason : `TXID-${String(tx.id).slice(0, 8)}`}
                    </p>
                  </td>
                  <td className={`px-6 py-4 text-xs font-bold text-right ${graveyardMode ? "text-orange-200" : userTier === "posh" ? "text-white" : "text-slate-600"}`}>
                    {tx.quantity}x
                  </td>
                  <td className={`px-6 py-4 text-left font-black text-right ${graveyardMode ? "text-orange-500" : userTier === "posh" ? "text-white" : "text-slate-900"}`}>
                    £{tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
