import type { Transaction } from "./tierConfig";

export type SpendingType = "signal" | "noise";

export interface AuditedTransaction extends Transaction {
    spendingType: SpendingType;
    auditReason: string;
}

const NOISE_CATEGORIES = ["coffee", "snacks", "subscriptions", "gaming", "streaming", "junk food", "entertainment"];
const SIGNAL_CATEGORIES = ["rent", "mortgage", "utilities", "groceries", "savings", "investment", "transport", "health"];

export const auditTransaction = (tx: Transaction): AuditedTransaction => {
    const category = tx.category.toLowerCase();

    // 1. Noise Identification
    if (tx.amount < 5 && (category.includes("fee") || category.includes("bank"))) {
        return { ...tx, spendingType: "noise", auditReason: "Parasitic bank fee identified." };
    }

    if (tx.amount < 5 && NOISE_CATEGORIES.some(c => category.includes(c))) {
        return { ...tx, spendingType: "noise", auditReason: "Small scale lifestyle inflation." };
    }

    if (NOISE_CATEGORIES.some(c => category.includes(c)) && tx.amount < 15) {
        return { ...tx, spendingType: "noise", auditReason: "Luxury noise detected." };
    }

    // 2. Signal Identification
    if (SIGNAL_CATEGORIES.some(c => category.includes(c))) {
        return { ...tx, spendingType: "signal", auditReason: "Load-bearing essential expense." };
    }

    if (tx.amount > 100 && (category.includes("investment") || category.includes("savings"))) {
        return { ...tx, spendingType: "signal", auditReason: "Wealth signal confirmed." };
    }

    // Default to signal for larger unknown expenses, noise for small unknown ones
    return tx.amount < 10
        ? { ...tx, spendingType: "noise", auditReason: "Undocumented financial leakage." }
        : { ...tx, spendingType: "signal", auditReason: "Structural expense." };
};

export const auditSpending = (transactions: Transaction[]): AuditedTransaction[] => {
    return transactions.map(auditTransaction);
};
