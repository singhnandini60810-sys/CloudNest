import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import useAuth from "../hooks/useAuth";

interface LoginLocationState {
  from?: string;
  accountVerified?: boolean;
  passwordReset?: boolean;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const locationState =
    location.state as LoginLocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
        rememberMe,
      });

      navigate(locationState?.from ?? "/", {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your CloudNest workspace."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {locationState?.accountVerified && (
          <div className="auth-success-alert">
            Your account has been verified. You can now sign in.
          </div>
        )}

        {locationState?.passwordReset && (
          <div className="auth-success-alert">
            Your password has been reset successfully.
          </div>
        )}

        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <label className="auth-field">
          <span>Email address</span>

          <div className="auth-input">
            <Mail size={19} />

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="auth-field">
          <span className="auth-field__row">
            <span>Password</span>

            <Link to="/forgot-password">Forgot password?</Link>
          </span>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="auth-input__action"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </label>

        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) =>
              setRememberMe(event.target.checked)
            }
          />

          <span>Keep me signed in</span>
        </label>

        <button
          className="primary-button auth-submit"
          type="submit"
          disabled={isSubmitting}
        >
          <LogIn size={19} />
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          className="auth-google-button"
          type="button"
          disabled
          title="Google sign-in will be connected through Amazon Cognito."
        >
          <span className="auth-google-button__logo">G</span>
          Continue with Google
        </button>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/register">Create account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;