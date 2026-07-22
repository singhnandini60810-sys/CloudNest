import {
  confirmResetPassword,
  confirmSignUp,
  fetchUserAttributes,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterDetails {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;

  register: (details: RegisterDetails) => Promise<void>;

  verifyEmail: (
    email: string,
    confirmationCode: string,
  ) => Promise<void>;

  resendVerificationCode: (email: string) => Promise<void>;

  requestPasswordReset: (email: string) => Promise<void>;

  completePasswordReset: (
    email: string,
    confirmationCode: string,
    newPassword: string,
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);

function getReadableAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "An unexpected authentication error occurred.";
  }

  switch (error.name) {
    case "UsernameExistsException":
      return "An account with this email address already exists.";

    case "UserNotFoundException":
      return "No CloudNest account was found for this email address.";

    case "NotAuthorizedException":
      return "The email address or password is incorrect.";

    case "UserNotConfirmedException":
      return "Please verify your email address before signing in.";

    case "CodeMismatchException":
      return "The verification code is incorrect.";

    case "ExpiredCodeException":
      return "The verification code has expired. Request a new code.";

    case "InvalidPasswordException":
      return "The password does not meet CloudNest security requirements.";

    case "LimitExceededException":
      return "Too many attempts were made. Please wait before trying again.";

    case "TooManyRequestsException":
      return "Too many requests were made. Please try again shortly.";

    case "PasswordResetRequiredException":
      return "You must reset your password before signing in.";

    case "InvalidParameterException":
      return "Some authentication information is invalid. Please check your details.";

    default:
      return error.message || "Authentication failed. Please try again.";
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const email =
        attributes.email ??
        currentUser.signInDetails?.loginId ??
        currentUser.username;

      const name =
        attributes.name ??
        email.split("@")[0] ??
        "CloudNest User";

      setUser({
        id: currentUser.userId,
        name,
        email,
      });
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuthentication = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuthentication();
  }, [refreshUser]);

  const login = async ({
    email,
    password,
  }: LoginCredentials) => {
    try {
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail || !password) {
        throw new Error(
          "Please enter your email address and password.",
        );
      }

      const result = await signIn({
        username: normalizedEmail,
        password,
      });

      if (!result.isSignedIn) {
        switch (result.nextStep.signInStep) {
          case "CONFIRM_SIGN_UP":
            throw new Error(
              "Please verify your email address before signing in.",
            );

          case "RESET_PASSWORD":
            throw new Error(
              "You must reset your password before signing in.",
            );

          case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
            throw new Error(
              "A new password is required before you can continue.",
            );

          default:
            throw new Error(
              `Additional sign-in action is required: ${result.nextStep.signInStep}`,
            );
        }
      }

      await refreshUser();
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const register = async ({
    fullName,
    email,
    password,
  }: RegisterDetails) => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedName = fullName.trim();

      if (!normalizedName || !normalizedEmail || !password) {
        throw new Error(
          "Please complete all registration fields.",
        );
      }

      const result = await signUp({
        username: normalizedEmail,
        password,
        options: {
          userAttributes: {
            email: normalizedEmail,
            name: normalizedName,
          },
        },
      });

      if (
        result.nextStep.signUpStep !== "CONFIRM_SIGN_UP" &&
        result.nextStep.signUpStep !== "DONE"
      ) {
        throw new Error(
          `Unexpected registration step: ${result.nextStep.signUpStep}`,
        );
      }
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const verifyEmail = async (
    email: string,
    confirmationCode: string,
  ) => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedCode = confirmationCode.trim();

      if (!normalizedEmail || !normalizedCode) {
        throw new Error(
          "Email address and verification code are required.",
        );
      }

      const result = await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: normalizedCode,
      });

      if (!result.isSignUpComplete) {
        throw new Error(
          `Additional verification action is required: ${result.nextStep.signUpStep}`,
        );
      }
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const resendVerificationCode = async (
    email: string,
  ) => {
    try {
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        throw new Error("Email address is required.");
      }

      await resendSignUpCode({
        username: normalizedEmail,
      });
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const requestPasswordReset = async (
    email: string,
  ) => {
    try {
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        throw new Error("Email address is required.");
      }

      const result = await resetPassword({
        username: normalizedEmail,
      });

      if (
        result.nextStep.resetPasswordStep !==
          "CONFIRM_RESET_PASSWORD_WITH_CODE" &&
        result.nextStep.resetPasswordStep !== "DONE"
      ) {
        throw new Error(
          `Unexpected password reset step: ${result.nextStep.resetPasswordStep}`,
        );
      }
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const completePasswordReset = async (
    email: string,
    confirmationCode: string,
    newPassword: string,
  ) => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedCode = confirmationCode.trim();

      if (
        !normalizedEmail ||
        !normalizedCode ||
        !newPassword
      ) {
        throw new Error(
          "Email, verification code and new password are required.",
        );
      }

      await confirmResetPassword({
        username: normalizedEmail,
        confirmationCode: normalizedCode,
        newPassword,
      });
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } finally {
      setUser(null);
    }
  };

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      verifyEmail,
      resendVerificationCode,
      requestPasswordReset,
      completePasswordReset,
      logout,
      refreshUser,
    }),
    [isLoading, refreshUser, user],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;