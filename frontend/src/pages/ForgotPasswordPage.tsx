import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import useAuth from "../hooks/useAuth";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(normalizedEmail);

      navigate("/reset-password", {
        state: {
          email: normalizedEmail,
        },
      });
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to send the password reset code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email address and we’ll help you reset your password."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        <div className="auth-information-card">
          <div className="auth-information-card__icon">
            <Mail size={24} />
          </div>

          <div>
            <strong>Reset instructions</strong>

            <p>
              CloudNest will send a verification code to your
              registered email address.
            </p>
          </div>
        </div>

        <label className="auth-field">
          <span>Email address</span>

          <div className="auth-input">
            <Mail size={19} />

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="name@example.com"
              autoComplete="email"
              autoFocus
              required
              disabled={isSubmitting}
            />
          </div>
        </label>

        <button
          className="primary-button auth-submit"
          type="submit"
          disabled={isSubmitting}
        >
          <Send size={19} />

          {isSubmitting
            ? "Sending..."
            : "Send Reset Code"}
        </button>

        <Link className="auth-back-link" to="/login">
          <ArrowLeft size={17} />
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;