export interface Income {
  id: string;
  source: string;
  amount: number;
  date: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Date;
}

export interface Summary {
  id: string;
  netBalance: number;
  totalExpenses: number;
  totalIncome: number;
}

export interface FinancialData {
  summary: Summary[];
  income: Income[];
  expenses: Expense[];
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}
