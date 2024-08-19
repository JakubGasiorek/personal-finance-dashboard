import { configureStore } from "@reduxjs/toolkit";
import incomeReducer, {
  fetchIncome,
  addIncome,
  updateIncome,
  deleteIncome,
} from "@/store/incomeSlice";
import { Timestamp } from "firebase/firestore";
import {
  mockGetDocs,
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockGetFirestore,
} from "@/__mocks__/firebase";

describe("incomeSlice async thunks", () => {
  let store: any;
  const now = new Date().toISOString(); // Consistent date format

  beforeEach(() => {
    store = configureStore({
      reducer: {
        income: incomeReducer,
      },
    });

    // Mock Firestore instance
    mockGetFirestore.mockReturnValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch income and update state correctly", async () => {
    // Arrange: Mock data returned from Firebase
    const mockIncomeDocs = [
      {
        id: "1",
        data: () => ({
          source: "Job",
          amount: 1000,
          date: Timestamp.fromDate(new Date(now)),
        }),
      },
      {
        id: "2",
        data: () => ({
          source: "Freelance",
          amount: 500,
          date: Timestamp.fromDate(new Date(now)),
        }),
      },
    ];

    (mockGetDocs as jest.Mock).mockResolvedValueOnce({
      docs: mockIncomeDocs,
    });

    // Act: Dispatch the thunk
    await store.dispatch(fetchIncome());

    // Assert: Check if the income state was updated correctly
    const state = store.getState().income;
    expect(state.income).toEqual([
      {
        id: "1",
        source: "Job",
        amount: 1000,
        date: now,
      },
      {
        id: "2",
        source: "Freelance",
        amount: 500,
        date: now,
      },
    ]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should add income and update state correctly", async () => {
    // Arrange: Mock addDoc response
    const mockIncomeData = {
      source: "Consulting",
      amount: 1200,
      date: new Date().toISOString(), // Use ISO string format
    };
    (mockAddDoc as jest.Mock).mockResolvedValueOnce({ id: "3" });

    // Act: Dispatch the thunk
    await store.dispatch(addIncome(mockIncomeData));

    // Assert: Check if the income state was updated correctly
    const state = store.getState().income;
    expect(state.income).toContainEqual({ ...mockIncomeData, id: "3" });
  });

  it("should update income and modify state correctly", async () => {
    // Arrange: Initial state and mock updateDoc response
    store = configureStore({
      reducer: {
        income: incomeReducer,
      },
      preloadedState: {
        income: {
          income: [
            {
              id: "1",
              source: "Job",
              amount: 1000,
              date: new Date().toISOString(),
            },
          ],
          loading: false,
          error: null,
        },
      },
    });

    const updatedIncome = {
      id: "1",
      source: "Job",
      amount: 1500,
      date: new Date().toISOString(),
    };
    (mockUpdateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    // Act: Dispatch the thunk
    await store.dispatch(updateIncome(updatedIncome));

    // Assert: Check if the income state was updated correctly
    const state = store.getState().income;
    expect(state.income).toContainEqual(updatedIncome);
  });

  it("should delete income and update state correctly", async () => {
    // Arrange: Initial state and mock deleteDoc response
    store = configureStore({
      reducer: {
        income: incomeReducer,
      },
      preloadedState: {
        income: {
          income: [
            {
              id: "1",
              source: "Job",
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
    await store.dispatch(deleteIncome("1"));

    // Assert: Check if the income state was updated correctly
    const state = store.getState().income;
    expect(state.income).toHaveLength(0);
  });

  it("should handle fetch income error correctly", async () => {
    // Arrange: Mock getDocs to throw an error
    (mockGetDocs as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch income error")
    );

    // Act: Dispatch the thunk
    await store.dispatch(fetchIncome());

    // Assert: Check if the error state was updated correctly
    const state = store.getState().income;
    expect(state.error).toBe("Fetch income error");
    expect(state.loading).toBe(false);
  });
});
