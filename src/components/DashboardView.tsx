import { useState } from "react";
import { Plus } from "lucide-react";
import type { UserTier, Transaction } from "@/lib/tierConfig";
import { buttonClass, cardClass, inputClass } from "@/lib/tierConfig";

interface DashboardViewProps {
  userTier: UserTier;
  transactions: Transaction[];
  onAddExpense: (amount: string, category: string) => void;
}

export default function DashboardView({ userTier, transactions, onAddExpense }: DashboardViewProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const handleAdd = () => {
    if (!amount || !category) return;
    onAddExpense(amount, category);
    setAmount("");
    setCategory("");
  };

  return (
    <div className={`max-w-2xl ${userTier === "posh" ? "mx-auto" : ""}`}>
      {/* Add Expense */}
      <div className={cardClass[userTier]}>
        <h2 className={`font-bold mb-4 ${
          userTier === "posh" ? "text-xl text-amber-300" : userTier === "broke" ? "text-lg uppercase text-lime-400" : "text-lg text-slate-800"
        }`}>
          {userTier === "posh" ? "Record an Expenditure" : userTier === "broke" ? "⚠️ ADD EXPENSE (WHY??)" : "Add Expense"}
        </h2>
        <div className={`flex gap-3 ${userTier === "broke" ? "flex-col" : "items-end"}`}>
          <div className="flex-1">
            <label className={`text-xs block mb-1 ${
              userTier === "posh" ? "text-amber-400/60" : userTier === "broke" ? "text-lime-600 uppercase" : "text-slate-500"
            }`}>Amount (£)</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full ${inputClass[userTier]}`} />
          </div>
          <div className="flex-1">
            <label className={`text-xs block mb-1 ${
              userTier === "posh" ? "text-amber-400/60" : userTier === "broke" ? "text-lime-600 uppercase" : "text-slate-500"
            }`}>Category</label>
            <input type="text" placeholder={userTier === "broke" ? "YOUR EXCUSE" : "e.g. Food"} value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full ${inputClass[userTier]}`} />
          </div>
          <button onClick={handleAdd} className={`${buttonClass[userTier]} flex items-center gap-2 whitespace-nowrap`}>
            <Plus className="w-4 h-4" /> {userTier === "broke" ? "SUBMIT" : "Add"}
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`${cardClass[userTier]} mt-6`}>
        <h2 className={`font-bold mb-4 ${
          userTier === "posh" ? "text-xl text-amber-300" : userTier === "broke" ? "text-lg uppercase text-lime-400" : "text-lg text-slate-800"
        }`}>
          {userTier === "posh" ? "Recent Activity" : userTier === "broke" ? "💸 YOUR CRIMES 💸" : "Recent Transactions"}
        </h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className={`flex justify-between items-center py-2 px-3 rounded ${
              userTier === "posh" ? "border-b border-amber-500/10 hover:bg-amber-500/5" : userTier === "broke" ? "border-b-2 border-lime-700 hover:bg-red-900/30" : "border-b border-slate-100 hover:bg-slate-50"
            }`}>
              <div>
                <div className={`font-medium text-sm ${userTier === "broke" ? "uppercase" : ""}`}>{tx.category}</div>
                <div className={`text-xs ${userTier === "posh" ? "text-amber-500/40" : userTier === "broke" ? "text-lime-700" : "text-slate-400"}`}>{tx.date}</div>
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
