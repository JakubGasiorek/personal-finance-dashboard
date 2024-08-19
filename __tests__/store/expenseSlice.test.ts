import { configureStore } from "@reduxjs/toolkit";
import expenseReducer, {
  fetchExpense,
  addExpense,
  updateExpense,
  deleteExpense,
} from "@/store/expenseSlice";
import { Timestamp } from "firebase/firestore";
import {
  mockGetDocs,
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockGetFirestore,
} from "@/__mocks__/firebase";

describe("expenseSlice async thunks", () => {
  let store: any;
  const now = new Date().toISOString(); // Consistent date format

  beforeEach(() => {
    store = configureStore({
      reducer: {
        expense: expenseReducer,
      },
    });

    // Mock Firestore instance
    mockGetFirestore.mockReturnValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch expense and update state correctly", async () => {
    // Arrange: Mock data returned from Firebase
    const mockExpenseDocs = [
      {
        id: "1",
        data: () => ({
          category: "Car payment",
          amount: 1000,
          date: Timestamp.fromDate(new Date(now)),
        }),
      },
      {
        id: "2",
        data: () => ({
          category: "Food",
          amount: 500,
          date: Timestamp.fromDate(new Date(now)),
        }),
      },
    ];

    (mockGetDocs as jest.Mock).mockResolvedValueOnce({
      docs: mockExpenseDocs,
    });

    // Act: Dispatch the thunk
    await store.dispatch(fetchExpense());

    // Assert: Check if the expense state was updated correctly
    const state = store.getState().expense;
    expect(state.expense).toEqual([
      {
        id: "1",
        category: "Car payment",
        amount: 1000,
        date: now,
      },
      {
        id: "2",
        category: "Food",
        amount: 500,
        date: now,
      },
    ]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should add expense and update state correctly", async () => {
    // Arrange: Mock addDoc response
    const mockExpenseData = {
      category: "Hospital",
      amount: 400,
      date: new Date().toISOString(), // Use ISO string format
    };
    (mockAddDoc as jest.Mock).mockResolvedValueOnce({ id: "3" });

    // Act: Dispatch the thunk
    await store.dispatch(addExpense(mockExpenseData));

    // Assert: Check if the expense state was updated correctly
    const state = store.getState().expense;
    expect(state.expense).toContainEqual({ ...mockExpenseData, id: "3" });
  });

  it("should update expense and modify state correctly", async () => {
    // Arrange: Initial state and mock updateDoc response
    store = configureStore({
      reducer: {
        expense: expenseReducer,
      },
      preloadedState: {
        expense: {
          expense: [
            {
              id: "1",
              category: "Car payment",
              amount: 1000,
              date: new Date().toISOString(),
            },
          ],
          loading: false,
          error: null,
        },
      },
    });

    const updatedExpense = {
      id: "1",
      category: "Car payment",
      amount: 1500,
      date: new Date().toISOString(),
    };
    (mockUpdateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    // Act: Dispatch the thunk
    await store.dispatch(updateExpense(updatedExpense));

    // Assert: Check if the expense state was updated correctly
    const state = store.getState().expense;
    expect(state.expense).toContainEqual(updatedExpense);
  });

  it("should delete expense and update state correctly", async () => {
    // Arrange: Initial state and mock deleteDoc response
    store = configureStore({
      reducer: {
        expense: expenseReducer,
      },
      preloadedState: {
        expense: {
          expense: [
            {
              id: "1",
              category: "Car payment",
              amount: 1000,
              date: new Date().toISOString(),
            },
          ],
          loading: false,
          error: null,
        },
      },
    });

    (mockDeleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

    // Act: Dispatch the thunk
    await store.dispatch(deleteExpense("1"));

    // Assert: Check if the expense state was updated correctly
    const state = store.getState().expense;
    expect(state.expense).toHaveLength(0);
  });

  it("should handle fetch expense error correctly", async () => {
    // Arrange: Mock getDocs to throw an error
    (mockGetDocs as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch expense error")
    );

    // Act: Dispatch the thunk
    await store.dispatch(fetchExpense());

    // Assert: Check if the error state was updated correctly
    const state = store.getState().expense;
    expect(state.error).toBe("Fetch expense error");
    expect(state.loading).toBe(false);
  });
});
