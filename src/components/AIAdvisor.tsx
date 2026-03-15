import { Bot } from "lucide-react";
import type { UserTier } from "@/lib/tierConfig";
import { cardClass, getAIMessage } from "@/lib/tierConfig";

interface AIAdvisorProps {
  userTier: UserTier;
  karmaScore: number;
}

export default function AIAdvisor({ userTier, karmaScore }: AIAdvisorProps) {
  return (
    <div className={cardClass[userTier]}>
      <div className="flex items-center gap-2 mb-4">
        <Bot className={`w-5 h-5 ${
          userTier === "posh" ? "text-amber-400" : userTier === "broke" ? "text-red-500" : "text-blue-600"
        }`} />
        <h3 className={`font-bold ${
          userTier === "posh" ? "text-amber-300" : userTier === "broke" ? "text-lime-400 uppercase text-sm" : "text-slate-800"
        }`}>
          {userTier === "posh" ? "Concierge AI" : userTier === "broke" ? "⚠️ INTERVENTION BOT" : "AI Advisor"}
        </h3>
      </div>
      <div className={`text-sm leading-relaxed ${
        userTier === "posh" ? "text-amber-200/80 italic" : userTier === "broke" ? "text-lime-400 font-black uppercase" : "text-slate-600"
      }`}>
        {getAIMessage(userTier, karmaScore)}
      </div>
      <div className={`mt-4 pt-4 border-t text-xs ${
        userTier === "posh" ? "border-amber-500/10 text-amber-500/40" : userTier === "broke" ? "border-red-600 text-red-500" : "border-slate-100 text-slate-400"
      }`}>
        Karma Score Impact: {karmaScore > 70 ? "Positive" : karmaScore > 30 ? "Neutral" : "Critical"}
      </div>
    </div>
  );
}
