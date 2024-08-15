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
} from "firebase/firestore";

const initialState: ExpenseState = {
  expense: [],
  loading: false,
  error: null,
};

// Fetch expense
export const fetchExpense = createAsyncThunk(
  "expense/fetchExpense",
  async () => {
    return await withAuthenticatedUser(async (userId) => {
      const expenseSnapshot = await getDocs(
        collection(db, `users/${userId}/expense`)
      );
      return expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
    });
  }
);

// Add expense
export const addExpense = createAsyncThunk(
  "expense/addExpense",
  async (expenseData: Omit<Expense, "id">) => {
    return await withAuthenticatedUser(async (userId) => {
      const docRef = await addDoc(
        collection(db, `users/${userId}/expense`),
        expenseData
      );
      return { ...expenseData, id: docRef.id };
    });
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async (expense: Expense) => {
    return await withAuthenticatedUser(async (userId) => {
      const expenseDocRef = doc(db, `users/${userId}/expense`, expense.id);
      const expenseData = {
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
      };
      await updateDoc(expenseDocRef, expenseData);
      return expense;
    });
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (expenseId: string) => {
    return await withAuthenticatedUser(async (userId) => {
      await deleteDoc(doc(db, `users/${userId}/expense`, expenseId));
      return expenseId;
    });
  }
);

const expenseSlice = createSlice({
  name: "expense",
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
        state.error = action.error.message || "Failed to fetch expense";
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
