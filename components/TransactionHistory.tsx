import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Transaction, TransactionHistoryProps } from "@/types";
import PaginatedList from "@/components/PaginatedList";

const ITEMS_PER_PAGE = 6;

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
    <div className="py-4 bg-dark-400 rounded-md">
      <h2 className="text-xl mb-4">Transaction History</h2>
      <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2 mb-[1.1rem]">
        <div>
          <label className="block mb-2">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy/MM/dd"
            className="h-10 w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label className="block mb-2">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy/MM/dd"
            className="h-10 w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label className="block mb-2">Filter by name</label>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Category/Source"
            className="h-10 w-full border rounded-md border-dark-500 bg-dark-400"
          />
        </div>
      </div>
      <PaginatedList
        items={filteredTransactions}
        itemsPerPage={ITEMS_PER_PAGE}
        renderItem={(transaction) => {
          const isIncome = "source" in transaction;
          const textColor = isIncome ? "text-green-500" : "text-red-500";

          return (
            <div
              key={transaction.id}
              className="p-2 bg-dark-300 rounded-md mb-2"
            >
              <div>
                <strong className={`${textColor}`}>
                  {isIncome ? "Income" : "Expense"}
                </strong>
              </div>
              <div>{new Date(transaction.date).toLocaleDateString()}</div>
              <div>Amount: ${transaction.amount.toFixed(2)}</div>
              <div className="truncate">
                {isIncome ? transaction.source : transaction.category}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TransactionHistory;
