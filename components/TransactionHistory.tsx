import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FinancialData, Transaction } from "@/types";

interface TransactionHistoryProps {
  financialData: FinancialData;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  financialData,
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    let filtered: Transaction[] = [
      ...financialData.income,
      ...financialData.expenses,
    ];

    if (startDate) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) <= endDate
      );
    }

    if (filter) {
      filtered = filtered.filter(
        (transaction) =>
          ("category" in transaction &&
            transaction.category
              ?.toLowerCase()
              .includes(filter.toLowerCase())) ||
          ("source" in transaction &&
            transaction.source?.toLowerCase().includes(filter.toLowerCase()))
      );
    }

    setFilteredTransactions(filtered);
  }, [startDate, endDate, filter, financialData]);

  return (
    <div className="p-4 bg-dark-400 rounded-md">
      <h2 className="text-xl mb-4">Transaction History</h2>
      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <div>
          <label className="block mb-2">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy/MM/dd"
            className="w-full h-10 px-3 py-2 border rounded-md bg-dark-300 text-white"
          />
        </div>
        <div>
          <label className="block mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy/MM/dd"
            className="w-full h-10 px-3 py-2 border rounded-md bg-dark-300 text-white"
          />
        </div>
        <div>
          <label className="block mb-2">Filter by Category/Source</label>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Category/Source"
            className="w-full h-10 px-3 py-2 border rounded-md bg-dark-300 text-white"
          />
        </div>
      </div>
      <div>
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="p-2 border-b border-dark-300">
            <div>
              <strong>{"source" in transaction ? "Income" : "Expense"}</strong>
            </div>
            <div>{new Date(transaction.date).toLocaleDateString()}</div>
            <div>Amount: ${transaction.amount.toFixed(2)}</div>
            <div>
              {"category" in transaction
                ? transaction.category
                : transaction.source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
