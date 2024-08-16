import { configureStore } from "@reduxjs/toolkit";
import goalsReducer from "@/store/goalsSlice";
import incomeReducer from "@/store/incomeSlice";
import expenseReducer from "@/store/expenseSlice";

export const store = configureStore({
  reducer: {
    goals: goalsReducer,
    income: incomeReducer,
    expense: expenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
