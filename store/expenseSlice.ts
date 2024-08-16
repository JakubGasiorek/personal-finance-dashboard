import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Expense, ExpenseState } from "@/types";
import { db } from "@/services/firebase";
import { withAuthenticatedUser } from "@/lib/utils";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

const initialState: ExpenseState = {
  expense: [],
  loading: false,
  error: null,
};

// Convert date to ISO string
const serializeDate = (date: Date) => date.toISOString();

// Fetch expense
export const fetchExpense = createAsyncThunk(
  "expense/fetchExpense",
  async () => {
    return await withAuthenticatedUser(async (userId) => {
      const expenseSnapshot = await getDocs(
        collection(db, `users/${userId}/expenses`)
      );
      return expenseSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category,
          amount: data.amount,
          date:
            data.date instanceof Timestamp
              ? serializeDate(data.date.toDate())
              : data.date, // Convert Timestamp to ISO string
        } as Expense;
      });
    });
  }
);

// Add expense
export const addExpense = createAsyncThunk(
  "expense/addExpense",
  async (expenseData: Omit<Expense, "id">) => {
    return await withAuthenticatedUser(async (userId) => {
      const docRef = await addDoc(collection(db, `users/${userId}/expenses`), {
        ...expenseData,
        date: serializeDate(new Date(expenseData.date)), // Convert date to ISO string
      });
      return { ...expenseData, id: docRef.id };
    });
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async (expense: Expense) => {
    return await withAuthenticatedUser(async (userId) => {
      const expenseDocRef = doc(db, `users/${userId}/expenses`, expense.id);
      const expenseData = {
        category: expense.category,
        amount: expense.amount,
        date: serializeDate(new Date(expense.date)), // Convert date to ISO string
      };
      await updateDoc(expenseDocRef, expenseData);
      return { ...expense, date: new Date(expense.date).toISOString() }; // Return date as ISO string
    });
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (expenseId: string) => {
    return await withAuthenticatedUser(async (userId) => {
      await deleteDoc(doc(db, `users/${userId}/expenses`, expenseId));
      return expenseId;
    });
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.expense = action.payload;
        state.loading = false;
      })
      .addCase(fetchExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch expenses";
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expense.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expense.findIndex(
          (expense) => expense.id === action.payload.id
        );
        if (index >= 0) {
          state.expense[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expense = state.expense.filter(
          (expense) => expense.id !== action.payload
        );
      });
  },
});

export default expenseSlice.reducer;
