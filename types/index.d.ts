export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

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

export type Transaction = Income | Expense;

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
  message: React.ReactNode;
}

export interface IncomeChartProps {
  incomeData: FinancialData["income"];
  colorMap: Record<string, string>;
}

export interface ExpenseChartProps {
  expenseData: FinancialData["expenses"];
  colorMap: Record<string, string>;
}

export interface TransactionHistoryProps {
  financialData: FinancialData;
}

export interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
  itemsPerPage?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  amount: number;
  amountNeeded: number;
}

export interface GoalFormProps {
  onGoalAdded: (goal: Goal) => void;
  goalToEdit?: Goal | null;
  onEditCancel?: () => void;
  onGoalUpdated?: (goal: Goal) => void;
}

export interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}
