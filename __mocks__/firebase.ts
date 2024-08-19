// Create mock functions for Firestore methods
const mockCollection = jest.fn();
const mockGetDocs = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockGetFirestore = jest.fn();

// Create mock function for Auth methods
const mockGetAuth = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();

// Mock Firebase Firestore module
jest.mock("firebase/firestore", () => ({
  getFirestore: mockGetFirestore, // Mock getFirestore
  collection: mockCollection,
  getDocs: mockGetDocs,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  doc: mockDoc,
  setDoc: mockSetDoc,
  Timestamp: jest.requireActual("firebase/firestore").Timestamp,
}));

// Mock Firebase Auth module
jest.mock("firebase/auth", () => ({
  getAuth: mockGetAuth,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

// Mock utility functions
jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...inputs) => inputs.join(" ")),
  withAuthenticatedUser: (fn: any) => fn("mockUserId"),
}));

// Export mock functions for use in tests
export {
  mockCollection,
  mockGetDocs,
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockDoc,
  mockSetDoc,
  mockGetAuth,
  mockSignInWithEmailAndPassword,
  mockSendPasswordResetEmail,
  mockGetFirestore,
};
