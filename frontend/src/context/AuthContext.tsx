import {
  createContext,
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
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = "cloudnest-auth-user";
const PENDING_REGISTRATION_KEY = "cloudnest-pending-registration";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function createUser(name: string, email: string): AuthUser {
  return {
    id: `user-${Date.now()}`,
    name,
    email,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(AUTH_STORAGE_KEY) ??
        sessionStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({
    email,
    password,
    rememberMe,
  }: LoginCredentials) => {
    if (!email.trim() || !password.trim()) {
      throw new Error("Please enter your email and password.");
    }

    await new Promise((resolve) => window.setTimeout(resolve, 600));

    const pendingRegistration = localStorage.getItem(
      PENDING_REGISTRATION_KEY,
    );

    let name = email.split("@")[0];

    if (pendingRegistration) {
      try {
        const registration = JSON.parse(pendingRegistration) as {
          fullName?: string;
          email?: string;
        };

        if (registration.email === email && registration.fullName) {
          name = registration.fullName;
        }
      } catch {
        localStorage.removeItem(PENDING_REGISTRATION_KEY);
      }
    }

    const authenticatedUser = createUser(name, email);

    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(authenticatedUser),
    );

    setUser(authenticatedUser);
  };

  const register = async ({
    fullName,
    email,
    password,
  }: RegisterDetails) => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      throw new Error("Please complete all registration fields.");
    }

    await new Promise((resolve) => window.setTimeout(resolve, 600));

    localStorage.setItem(
      PENDING_REGISTRATION_KEY,
      JSON.stringify({
        fullName,
        email,
      }),
    );
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, user],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;