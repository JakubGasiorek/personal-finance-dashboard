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

export interface IncomeFormProps {
  onIncomeAdded: (income: Income) => void;
  incomeToEdit?: Income | null;
  onEditCancel?: () => void;
  onIncomeUpdated?: (income: Income) => void;
}

export interface ExpenseFormProps {
  onExpenseAdded: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
  onEditCancel?: () => void;
  onExpenseUpdated?: (expense: Expense) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}
