import {
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import useAuth from "../hooks/useAuth";

interface VerifyEmailLocationState {
  email?: string;
}

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { verifyEmail, resendVerificationCode } = useAuth();

  const locationState =
    location.state as VerifyEmailLocationState | null;

  const email = locationState?.email ?? "";

  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) =>
        Math.max(currentSeconds - 1, 0),
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [secondsRemaining]);

  const handleCodeChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(-1);

    setVerificationCode((currentCode) =>
      currentCode.map((digit, digitIndex) =>
        digitIndex === index ? value : digit,
      ),
    );

    if (value && index < verificationCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Backspace" &&
      !verificationCode[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedCode) {
      return;
    }

    const codeDigits = Array.from({ length: 6 }, (_, index) =>
      pastedCode[index] ?? "",
    );

    setVerificationCode(codeDigits);

    const nextIndex = Math.min(pastedCode.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setResendMessage("");

    const completeCode = verificationCode.join("");

    if (!email) {
      setError(
        "Your email address is missing. Please return to registration.",
      );
      return;
    }

    if (completeCode.length !== 6) {
      setError(
        "Please enter the complete 6-digit verification code.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyEmail(email, completeCode);

      navigate("/login", {
        replace: true,
        state: {
          accountVerified: true,
        },
      });
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (
      secondsRemaining > 0 ||
      isResending ||
      !email
    ) {
      return;
    }

    setError("");
    setResendMessage("");
    setIsResending(true);

    try {
      await resendVerificationCode(email);

      setResendMessage(
        "A new verification code has been sent.",
      );

      setSecondsRemaining(30);

      window.setTimeout(() => {
        setResendMessage("");
      }, 3000);
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the 6-digit code sent to your email address."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="auth-success-alert" role="status">
            <CheckCircle2 size={19} />
            {resendMessage}
          </div>
        )}

        <div className="auth-information-card">
          <div className="auth-information-card__icon">
            <MailCheck size={25} />
          </div>

          <div>
            <strong>Check your inbox</strong>

            <p>
              {email ? (
                <>
                  We sent a verification code to{" "}
                  <b>{email}</b>.
                </>
              ) : (
                <>
                  Your email address could not be found.
                  Please return to registration.
                </>
              )}
            </p>
          </div>
        </div>

        <div
          className="verification-code"
          onPaste={handlePaste}
        >
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              value={digit}
              maxLength={1}
              autoComplete={
                index === 0 ? "one-time-code" : "off"
              }
              aria-label={`Verification code digit ${
                index + 1
              }`}
              onChange={(event) =>
                handleCodeChange(index, event)
              }
              onKeyDown={(event) =>
                handleKeyDown(index, event)
              }
              autoFocus={index === 0}
              disabled={isSubmitting || !email}
            />
          ))}
        </div>

        <button
          className="primary-button auth-submit"
          type="submit"
          disabled={isSubmitting || !email}
        >
          <CheckCircle2 size={19} />

          {isSubmitting
            ? "Verifying..."
            : "Verify Account"}
        </button>

        <div className="auth-resend">
          <span>Didn&apos;t receive the code?</span>

          <button
            type="button"
            disabled={
              secondsRemaining > 0 ||
              isResending ||
              !email
            }
            onClick={handleResend}
          >
            <RefreshCw size={16} />

            {isResending
              ? "Sending..."
              : secondsRemaining > 0
                ? `Resend in ${secondsRemaining}s`
                : "Resend code"}
          </button>
        </div>

        <Link className="auth-back-link" to="/register">
          <ArrowLeft size={17} />
          Back to registration
        </Link>
      </form>
    </AuthLayout>
  );
}

export default VerifyEmailPage;