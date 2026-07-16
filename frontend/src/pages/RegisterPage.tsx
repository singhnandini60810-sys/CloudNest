import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please complete all required fields.");
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

    if (!acceptedTerms) {
      setError("Please accept the terms and privacy policy.");
      return;
    }

    /*
      Temporary frontend navigation.
      Cognito registration will replace this during AWS integration.
    */
    navigate("/verify-email", {
      state: { email },
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join CloudNest and start organizing your files securely."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <label className="auth-field">
          <span>Full name</span>

          <div className="auth-input">
            <User size={19} />

            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>
        </label>

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
            />
          </div>
        </label>

        <label className="auth-field">
          <span>Password</span>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
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
          <span>Confirm password</span>

          <div className="auth-input">
            <LockKeyhole size={19} />

            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              autoComplete="new-password"
            />
          </div>
        </label>

        <label className="auth-checkbox auth-checkbox--terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />

          <span>
            I agree to the <button type="button">Terms of Service</button> and{" "}
            <button type="button">Privacy Policy</button>.
          </span>
        </label>

        <button className="primary-button auth-submit" type="submit">
          <UserPlus size={19} />
          Create Account
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;