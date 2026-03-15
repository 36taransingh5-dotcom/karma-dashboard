import type { UserTier, Transaction } from "@/lib/tierConfig";
import { cardClass } from "@/lib/tierConfig";
import { FULL_TRANSACTIONS } from "@/lib/tierConfig";

interface TransactionsViewProps {
  userTier: UserTier;
  extraTransactions: Transaction[];
}

export default function TransactionsView({ userTier, extraTransactions }: TransactionsViewProps) {
  const allTx = [...extraTransactions, ...FULL_TRANSACTIONS];

  return (
    <div className="max-w-3xl">
      <div className={cardClass[userTier]}>
        <h2 className={`font-bold mb-6 ${userTier === "posh" ? "text-xl text-amber-300" : userTier === "broke" ? "text-lg uppercase text-lime-400" : "text-lg text-slate-800"
          }`}>
          {userTier === "posh" ? "Full Transaction Ledger" : userTier === "broke" ? "💀 COMPLETE CRIME LOG 💀" : "All Transactions"}
        </h2>
        <div className="space-y-1">
          {allTx.map((tx) => (
            <div key={tx.id} className={`flex justify-between items-center py-3 px-4 rounded-lg ${userTier === "posh" ? "border-b border-amber-500/10 hover:bg-amber-500/5" : userTier === "broke" ? "border-b-2 border-lime-700 hover:bg-red-900/30" : "border-b border-slate-100 hover:bg-slate-50"
              }`}>
              <div className="flex-1">
                <div className={`font-medium text-sm ${userTier === "broke" ? "uppercase" : ""}`}>{tx.category}</div>
                <div className={`text-xs ${userTier === "posh" ? "text-amber-500/40" : userTier === "broke" ? "text-lime-700" : "text-slate-400"}`}>
                  {tx.quantity} x £{tx.price.toFixed(2)} • {tx.date}
                </div>
              </div>
              <div className={`font-bold ${userTier === "posh" ? "text-amber-300" : userTier === "broke" ? "text-red-500" : "text-slate-900"}`}>
                -£{tx.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
