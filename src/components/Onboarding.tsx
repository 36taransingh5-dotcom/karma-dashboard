import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { UserTier } from "@/lib/tierConfig";

interface Question {
  question: string;
  options: { label: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    question: "What's your annual income?",
    options: [
      { label: "£150k+", score: 10 },
      { label: "£40k–£150k", score: 5 },
      { label: "I'd rather not say (it's bad)", score: 0 },
    ],
  },
  {
    question: "What's your credit score?",
    options: [
      { label: "Excellent (999)", score: 10 },
      { label: "Decent-ish", score: 5 },
      { label: "What's a credit score?", score: 0 },
    ],
  },
  {
    question: "Monthly rent or mortgage?",
    options: [
      { label: "I own multiple properties", score: 10 },
      { label: "£800–£2000/month", score: 5 },
      { label: "Sofa surfing", score: 0 },
    ],
  },
  {
    question: "Do you own a yacht?",
    options: [
      { label: "Obviously", score: 10 },
      { label: "No, but I've been on one", score: 5 },
      { label: "I can't even afford a kayak", score: 0 },
    ],
  },
  {
    question: "How many coffees do you buy per week?",
    options: [
      { label: "My barista knows my name", score: 3 },
      { label: "2-3, I'm reasonable", score: 7 },
      { label: "I drink instant and cry", score: 1 },
    ],
  },
  {
    question: "What's in your investment portfolio?",
    options: [
      { label: "Diversified ETFs, bonds, and crypto", score: 10 },
      { label: "A workplace pension I never check", score: 5 },
      { label: "£4.20 in a jar", score: 0 },
    ],
  },
  {
    question: "Last holiday destination?",
    options: [
      { label: "The Maldives, private villa", score: 10 },
      { label: "Airbnb in Portugal", score: 5 },
      { label: "My mate's caravan in Skegness", score: 0 },
    ],
  },
  {
    question: "How do you commute?",
    options: [
      { label: "Chauffeur or Tesla", score: 10 },
      { label: "Train/bus like a normal person", score: 5 },
      { label: "Walking 45 minutes, rain or shine", score: 0 },
    ],
  },
  {
    question: "Favourite meal deal?",
    options: [
      { label: "I don't do 'meal deals'", score: 10 },
      { label: "Tesco £3.50 — classic", score: 5 },
      { label: "I eat the free samples at Costco", score: 0 },
    ],
  },
  {
    question: "What's your savings goal?",
    options: [
      { label: "Generational wealth", score: 10 },
      { label: "House deposit by 2030", score: 5 },
      { label: "Survive until payday", score: 0 },
    ],
  },
];

interface OnboardingProps {
  onComplete: (tier: UserTier, karma: number) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateTier = (): { tier: UserTier; karma: number } => {
    const total = scores.reduce((a, b) => a + b, 0);
    const max = QUESTIONS.length * 10;
    const pct = (total / max) * 100;
    if (pct >= 65) return { tier: "posh", karma: Math.round(pct) };
    if (pct >= 30) return { tier: "middle", karma: Math.round(pct) };
    return { tier: "broke", karma: Math.round(pct) };
  };

  const progress = ((currentQ + (showResult ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-amber-200 tracking-tight font-serif">
            EgoFi
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Financial dashboard. Judgement included.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!showResult ? (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
              Question {currentQ + 1} of {QUESTIONS.length}
            </p>
            <h2 className="text-xl text-amber-100 font-semibold mb-6">
              {QUESTIONS[currentQ].question}
            </h2>
            <div className="space-y-3">
              {QUESTIONS[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full text-left px-5 py-4 rounded-xl border border-zinc-700/50 text-zinc-300 hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-200 transition-all duration-200 text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center backdrop-blur-sm">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl text-amber-100 font-bold mb-3">
              Analysis Complete
            </h2>
            <p className="text-zinc-400 text-sm mb-8">
              We've assessed your financial ego. Brace yourself.
            </p>
            <button
              onClick={() => {
                const { tier, karma } = calculateTier();
                onComplete(tier, karma);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-tr from-[#996515] via-[#D4AF37] to-[#F9E27D] text-black font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all text-lg"
            >
              Calculate My Status
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
