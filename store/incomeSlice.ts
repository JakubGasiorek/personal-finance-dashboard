import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Income, IncomeState } from "@/types";
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
import { Timestamp } from "firebase/firestore";

const initialState: IncomeState = {
  income: [],
  loading: false,
  error: null,
};

// Convert date to ISO string
const serializeDate = (date: Date) => date.toISOString();

export const fetchIncome = createAsyncThunk("income/fetchIncome", async () => {
  return await withAuthenticatedUser(async (userId) => {
    const incomeSnapshot = await getDocs(
      collection(db, `users/${userId}/income`)
    );
    return incomeSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        source: data.source,
        amount: data.amount,
        date:
          data.date instanceof Timestamp
            ? serializeDate(data.date.toDate())
            : data.date, // Convert Timestamp to ISO string
      } as Income;
    });
  });
});

export const addIncome = createAsyncThunk(
  "income/addIncome",
  async (incomeData: Omit<Income, "id">) => {
    return await withAuthenticatedUser(async (userId) => {
      const docRef = await addDoc(collection(db, `users/${userId}/income`), {
        ...incomeData,
        date: serializeDate(new Date(incomeData.date)), // Convert date to ISO string
      });
      return { ...incomeData, id: docRef.id };
    });
  }
);

export const updateIncome = createAsyncThunk(
  "income/updateIncome",
  async (income: Income) => {
    return await withAuthenticatedUser(async (userId) => {
      const incomeDocRef = doc(db, `users/${userId}/income`, income.id);
      const incomeData = {
        source: income.source,
        amount: income.amount,
        date: serializeDate(new Date(income.date)), // Convert date to ISO string
      };
      await updateDoc(incomeDocRef, incomeData);
      return { ...income, date: new Date(income.date).toISOString() }; // Return date as ISO string
    });
  }
);

export const deleteIncome = createAsyncThunk(
  "income/deleteIncome",
  async (incomeId: string) => {
    return await withAuthenticatedUser(async (userId) => {
      await deleteDoc(doc(db, `users/${userId}/income`, incomeId));
      return incomeId;
    });
  }
);

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.income = action.payload;
        state.loading = false;
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch income";
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        state.income.push(action.payload);
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        const index = state.income.findIndex(
          (income) => income.id === action.payload.id
        );
        if (index >= 0) {
          state.income[index] = action.payload;
        }
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.income = state.income.filter(
          (income) => income.id !== action.payload
        );
      });
  },
});

export default incomeSlice.reducer;
