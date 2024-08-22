import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInForm from "@/components/forms/SignInForm";
import {
  mockSignInWithEmailAndPassword,
  mockSendPasswordResetEmail,
  mockGetAuth,
} from "@/__mocks__/firebase";

// Mock the Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("SignInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render form elements correctly", () => {
    render(<SignInForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /forgot your password\?/i })
    ).toBeInTheDocument();
  });

  it("should show error messages for invalid input", async () => {
    render(<SignInForm />);

    userEvent.type(screen.getByLabelText(/email/i), "invalid@example.com");
    userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");
    userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.includes("Invalid email or password")
        )
      ).toBeInTheDocument();
    });
  });

  it("should handle successful sign-in", async () => {
    render(<SignInForm />);

    // Type email
    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      await userEvent.type(emailInput, "test@example.com");
    });

    // Type password
    const passwordInput = screen.getByLabelText(/password/i);
    await act(async () => {
      await userEvent.type(passwordInput, "password123");
    });

    // Submit the form
    await act(async () => {
      userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    });

    // Wait for the sign-in process to complete
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        mockGetAuth(),
        "test@example.com",
        "password123"
      );
    });
    // Check if router.push was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    // Check if the loading state is reset
    expect(screen.queryByText(/signing in.../i)).not.toBeInTheDocument();
  });

  it("should handle password reset with valid email", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      await userEvent.type(emailInput, "test@example.com");
    });
    expect(emailInput).toHaveValue("test@example.com");

    userEvent.click(
      screen.getByRole("button", { name: /forgot your password\?/i })
    );

    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        mockGetAuth(),
        "test@example.com"
      );
    });
    expect(alertSpy).toHaveBeenCalledWith(
      "Password reset email sent! Please check your inbox."
    );
    expect(
      screen.queryByRole("button", { name: /sending reset email/i })
    ).not.toBeInTheDocument();
  });
});
