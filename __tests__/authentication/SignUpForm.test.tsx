import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpForm from "@/components/forms/SignUpForm";
import { signUpUser } from "@/services/user.actions";

// Mock the Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock signUpUser service
jest.mock("@/services/user.actions", () => ({
  signUpUser: jest.fn(),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should render form elements correctly", () => {
    render(<SignUpForm onSignUpSuccess={() => {}} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("should show error messages for invalid input", async () => {
    render(<SignUpForm onSignUpSuccess={() => {}} />);

    // Type form fields
    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      await userEvent.type(emailInput, "invalid email");
    });

    const passwordInput = screen.getByLabelText("Password");
    await act(async () => {
      await userEvent.type(passwordInput, "short");
    });

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await act(async () => {
      await userEvent.type(confirmPasswordInput, "different");
    });

    userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(
        screen.getByText("Password must be at least 6 characters")
      ).toBeInTheDocument();
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("should handle successful sign-up", async () => {
    // Setup mock to resolve successfully
    (signUpUser as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<SignUpForm onSignUpSuccess={() => {}} />);

    // Type form fields
    const nameInput = screen.getByLabelText(/name/i);
    await act(async () => {
      await userEvent.type(nameInput, "John Doe");
    });

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      await userEvent.type(emailInput, "test@example.com");
    });

    const passwordInput = screen.getByLabelText("Password");
    await act(async () => {
      await userEvent.type(passwordInput, "password123");
    });

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await act(async () => {
      await userEvent.type(confirmPasswordInput, "password123");
    });

    // Submit the form
    await act(async () => {
      userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    });

    // Wait for the sign-up process to complete
    await waitFor(() => {
      expect(signUpUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "John Doe",
      });
    });

    // Check if router.push was called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    // Ensure loading state is reset
    expect(screen.queryByText(/signing up.../i)).not.toBeInTheDocument();
  });

  it("should handle password confirmation mismatch", async () => {
    render(<SignUpForm onSignUpSuccess={() => {}} />);

    // Type form fields
    const nameInput = screen.getByLabelText(/name/i);
    await act(async () => {
      await userEvent.type(nameInput, "John Doe");
    });

    const emailInput = screen.getByLabelText(/email/i);
    await act(async () => {
      await userEvent.type(emailInput, "test@example.com");
    });

    const passwordInput = screen.getByLabelText("Password");
    await act(async () => {
      await userEvent.type(passwordInput, "password123");
    });

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    await act(async () => {
      await userEvent.type(confirmPasswordInput, "differentpassword");
    });

    userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });
});
