import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { FinancialData, Income, Expense, Summary } from "@/types";

const useFinancialData = (): FinancialData => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    summary: [],
    income: [],
    expenses: [],
  });

  useEffect(() => {
    const fetchData = async (user: User) => {
      try {
        const userId = user.uid;
        const [summarySnapshot, incomeSnapshot, expensesSnapshot] =
          await Promise.all([
            getDocs(collection(db, `users/${userId}/summary`)),
            getDocs(collection(db, `users/${userId}/income`)),
            getDocs(collection(db, `users/${userId}/expenses`)),
          ]);

        const summaryData = summarySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Summary[];

        const incomeData = incomeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? doc.data().date.toDate() : new Date(),
        })) as Income[];

        const expensesData = expensesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? doc.data().date.toDate() : new Date(),
        })) as Expense[];

        setFinancialData({
          summary: summaryData,
          income: incomeData,
          expenses: expensesData,
        });
      } catch (error) {
        console.error("Error fetching financial data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        setFinancialData({
          summary: [],
          income: [],
          expenses: [],
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return financialData;
};

export default useFinancialData;
