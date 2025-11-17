export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
}

export interface Envelope {
  id: string;
  name: string;
  budget: number;
  balance: number;
  isFavorite: boolean;
  recurringTransactions?: RecurringTransaction[];
  lastProcessed?: string; // e.g., "2024-07"
}

export type TransactionType = 'add' | 'spend';