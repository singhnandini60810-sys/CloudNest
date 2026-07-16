import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";

interface ResetPasswordLocationState {
  email?: string;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as ResetPasswordLocationState | null;

  const email = locationState?.email ?? "";

  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return score;
  }, [password]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    navigate("/login", {
      state: {
        passwordReset: true,
      },
    });
  };

  return (
    <AuthLayout
      title="Create a new password"
      description={
        email
          ? `Enter the code sent to ${email} and choose a new password.`
          : "Enter your verification code and create a new secure password."
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <div className="auth-information-card">
          <div className="auth-information-card__icon">
            <KeyRound size={24} />
          </div>

          <div>
            <strong>Secure password reset</strong>
            <p>
              Your new password should be different from your previous
              password.
            </p>
          </div>
        </div>

        <label className="auth-field">
          <span>Verification code</span>

          <div className="auth-input">
            <KeyRound size={19} />

            <input
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(event) =>
                setVerificationCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              placeholder="Enter 6-digit code"
              maxLength={6}
              autoFocus
            />
          </div>
        </label>

        <label className="auth-field">
          <span>New password</span>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a new password"
              autoComplete="new-password"
            />

            <button
              type="button"
              className="auth-input__action"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>

          {password && (
            <div className="password-strength">
              <div className="password-strength__bars">
                {[1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={
                      passwordStrength >= bar
                        ? "password-strength__bar password-strength__bar--active"
                        : "password-strength__bar"
                    }
                  />
                ))}
              </div>

              <small>
                Use 8+ characters with uppercase, number and symbol.
              </small>
            </div>
          )}
        </label>

        <label className="auth-field">
          <span>Confirm new password</span>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter the new password again"
              autoComplete="new-password"
            />
          </div>
        </label>

        <button className="primary-button auth-submit" type="submit">
          <CheckCircle2 size={19} />
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;