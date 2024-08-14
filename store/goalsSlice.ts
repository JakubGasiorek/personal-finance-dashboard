import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Goal, GoalsState } from "@/types";
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

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

// Fetch goals
export const fetchGoals = createAsyncThunk("goals/fetchGoals", async () => {
  return await withAuthenticatedUser(async (userId) => {
    const goalsSnapshot = await getDocs(
      collection(db, `users/${userId}/goals`)
    );
    return goalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Goal[];
  });
});

// Add goal
export const addGoal = createAsyncThunk(
  "goals/addGoal",
  async (goalData: Omit<Goal, "id">) => {
    return await withAuthenticatedUser(async (userId) => {
      const docRef = await addDoc(
        collection(db, `/users/${userId}/goals`),
        goalData
      );
      return { ...goalData, id: docRef.id };
    });
  }
);

// Update goal
export const updateGoal = createAsyncThunk(
  "goals/updateGoal",
  async (goal: Goal) => {
    return await withAuthenticatedUser(async (userId) => {
      const goalDocRef = doc(db, `users/${userId}/goals`, goal.id);
      const goalData = {
        title: goal.title,
        description: goal.description,
        amount: goal.amount,
        amountNeeded: goal.amountNeeded,
      };
      await updateDoc(goalDocRef, goalData);
      return goal;
    });
  }
);

// Delete goal
export const deleteGoal = createAsyncThunk(
  "goals/deleteGoal",
  async (goalId: string) => {
    return await withAuthenticatedUser(async (userId) => {
      await deleteDoc(doc(db, `users/${userId}/goals`, goalId));
      return goalId;
    });
  }
);

const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
        state.loading = false;
      })

      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch goals";
      })

      .addCase(addGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })

      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(
          (goal) => goal.id === action.payload.id
        );
        if (index >= 0) {
          state.goals[index] = action.payload;
        }
      })

      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((goal) => goal.id !== action.payload);
      });
  },
});

export default goalsSlice.reducer;
