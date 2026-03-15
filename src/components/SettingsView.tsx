import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { UserTier } from "@/lib/tierConfig";
import { cardClass, buttonClass } from "@/lib/tierConfig";

interface SettingsViewProps {
  userTier: UserTier;
  onHardReset: () => void;
}

export default function SettingsView({ userTier, onHardReset }: SettingsViewProps) {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleClass = (on: boolean) => {
    if (userTier === "posh") return on ? "bg-amber-500" : "bg-zinc-700";
    if (userTier === "broke") return on ? "bg-lime-500" : "bg-zinc-700";
    return on ? "bg-blue-600" : "bg-slate-300";
  };

  return (
    <div className="max-w-lg">
      <div className={cardClass[userTier]}>
        <h2 className={`font-bold mb-6 ${
          userTier === "posh" ? "text-xl text-amber-300" : userTier === "broke" ? "text-lg uppercase text-lime-400" : "text-lg text-slate-800"
        }`}>
          {userTier === "posh" ? "Preferences" : userTier === "broke" ? "⚙️ SETTINGS (DON'T TOUCH)" : "Settings"}
        </h2>

        {/* Profile */}
        <div className="mb-6">
          <h3 className={`text-sm font-semibold mb-3 ${
            userTier === "posh" ? "text-amber-400/70" : userTier === "broke" ? "text-lime-500 uppercase" : "text-slate-600"
          }`}>Profile</h3>
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            userTier === "posh" ? "bg-white/5" : userTier === "broke" ? "bg-zinc-800 border-2 border-lime-600" : "bg-slate-50"
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
              userTier === "posh" ? "bg-amber-500/20 text-amber-300" : userTier === "broke" ? "bg-red-600 text-black" : "bg-blue-100 text-blue-600"
            }`}>
              {userTier === "posh" ? "👑" : userTier === "broke" ? "💀" : "U"}
            </div>
            <div>
              <div className="font-semibold text-sm">
                {userTier === "posh" ? "Lord Moneybags III" : userTier === "broke" ? "DEBT_MACHINE_42" : "User"}
              </div>
              <div className={`text-xs ${userTier === "posh" ? "text-amber-500/50" : userTier === "broke" ? "text-lime-700" : "text-slate-400"}`}>
                {userTier === "posh" ? "Premium Wealth Tier" : userTier === "broke" ? "FINANCIAL THREAT LEVEL: MAX" : "Standard Account"}
              </div>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm">Push Notifications</span>
            <button onClick={() => setPushNotifs(!pushNotifs)} className={`w-11 h-6 rounded-full relative transition-colors ${toggleClass(pushNotifs)}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${pushNotifs ? "left-5.5" : "left-0.5"}`} style={{ left: pushNotifs ? "22px" : "2px" }} />
            </button>
          </div>
        </div>

        {/* Hard Reset */}
        <div className={`pt-6 border-t ${userTier === "posh" ? "border-amber-500/10" : userTier === "broke" ? "border-red-600" : "border-slate-200"}`}>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className={`flex items-center gap-2 text-sm ${
                userTier === "broke" ? "text-red-500 font-black uppercase" : "text-red-500 hover:text-red-600"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Hard Reset Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className={`text-sm ${userTier === "broke" ? "text-red-400 uppercase font-bold" : "text-red-500"}`}>
                This will return you to the onboarding quiz. Are you sure?
              </p>
              <div className="flex gap-2">
                <button onClick={onHardReset} className={`${buttonClass[userTier]} text-sm`}>
                  {userTier === "broke" ? "DESTROY IT ALL" : "Yes, reset"}
                </button>
                <button onClick={() => setShowConfirm(false)} className="text-sm text-slate-400 hover:text-slate-600 px-3">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
