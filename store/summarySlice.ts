// summarySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Summary, SummaryState } from "@/types";
import { db } from "@/services/firebase";
import { withAuthenticatedUser } from "@/lib/utils";
import { collection, getDocs } from "firebase/firestore";

const initialState: SummaryState = {
  summary: null,
  loading: false,
  error: null,
};

// Fetch summary
export const fetchSummary = createAsyncThunk(
  "summary/fetchSummary",
  async () => {
    return await withAuthenticatedUser(async (userId) => {
      // Fetching income and expenses
      const [incomeSnapshot, expensesSnapshot] = await Promise.all([
        getDocs(collection(db, `users/${userId}/income`)),
        getDocs(collection(db, `users/${userId}/expenses`)),
      ]);

      // Calculate totals
      const totalIncome = incomeSnapshot.docs.reduce(
        (acc, doc) => acc + (doc.data().amount || 0),
        0
      );
      const totalExpenses = expensesSnapshot.docs.reduce(
        (acc, doc) => acc + (doc.data().amount || 0),
        0
      );
      const netBalance = totalIncome - totalExpenses;

      return {
        totalIncome,
        totalExpenses,
        netBalance,
      } as Summary;
    });
  }
);

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = false;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch summary";
      });
  },
});

export default summarySlice.reducer;
