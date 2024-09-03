import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import PaginatedList from "@/components/PaginatedList";
import { Transaction } from "@/types";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "./ui/label";

const getItemsPerPage = (width: number) => {
  if (width > 1440) return 5;
  if (width >= 1024) return 4;
  return 3; // smaller screens
};

const TransactionHistory: React.FC = () => {
  const income = useSelector((state: RootState) => state.income.income);
  const expenses = useSelector((state: RootState) => state.expense.expense);

  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(3); // Default to smallest screen size

  useEffect(() => {
    // This effect will only run on the client side
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage(window.innerWidth));
    };

    // Set initial value
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Function to filter transactions
    let filtered: Transaction[] = [...income, ...expenses];

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

    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setFilteredTransactions(filtered);
  }, [startDate, endDate, filter, income, expenses]);

  return (
    <div className="mt-4 bg-dark-400 rounded-md w-full">
      <h2 className="text-xl mb-4">Transaction history</h2>
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div>
          <Label htmlFor="start-date" className="block mb-2">
            Start date
          </Label>
          <div className="flex flex-col">
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy/MM/dd"
              className="h-10 w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              popperPlacement="bottom-start"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="end-date" className="block mb-2">
            End date
          </Label>
          <div className="flex flex-col">
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy/MM/dd"
              className="h-10 w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              popperPlacement="bottom-start"
            />
          </div>
        </div>
        <div className="col-span-2">
          <Label htmlFor="filter-input" className="block mb-2">
            Filter by name
          </Label>
          <Input
            id="filter-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Category/Source"
            className="h-10 w-full border rounded-md border-dark-500 bg-dark-400"
          />
        </div>
      </div>
      <PaginatedList
        items={filteredTransactions}
        itemsPerPage={itemsPerPage}
        renderItem={(transaction) => {
          const isIncome = "source" in transaction;
          const textColor = isIncome ? "text-green-500" : "text-red-500";

          return (
            <div
              key={transaction.id}
              className="p-[0.82rem] bg-dark-300 rounded-md mb-2"
            >
              <div>
                <strong className={`${textColor}`}>
                  {isIncome ? "Income" : "Expense"}
                </strong>
              </div>
              <div className="truncate">
                {isIncome ? transaction.source : transaction.category}
              </div>
              <div>${transaction.amount.toFixed(2)}</div>
              <div>{new Date(transaction.date).toLocaleDateString()}</div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TransactionHistory;
