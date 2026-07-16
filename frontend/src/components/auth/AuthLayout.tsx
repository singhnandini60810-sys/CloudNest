import { Cloud, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-visual">
          <Link to="/" className="auth-brand">
            <span className="auth-brand__logo">
              <Cloud size={30} strokeWidth={1.8} />
            </span>

            <span>
              <strong>CloudNest</strong>
              <small>Your secure cloud space</small>
            </span>
          </Link>

          <div className="auth-visual__content">
            <span className="auth-visual__eyebrow">
              <Sparkles size={17} />
              Secure cloud storage
            </span>

            <h1>Your files deserve a safe and beautiful home.</h1>

            <p>
              Upload, organize and securely share your documents from one
              simple cloud workspace.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span>
                  <ShieldCheck size={21} />
                </span>

                <div>
                  <strong>Secure by design</strong>
                  <p>Private storage with authenticated user access.</p>
                </div>
              </div>

              <div className="auth-feature">
                <span>
                  <Cloud size={21} />
                </span>

                <div>
                  <strong>Access anywhere</strong>
                  <p>Your files remain available across your devices.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-visual__cloud auth-visual__cloud--one">
            ☁️
          </div>

          <div className="auth-visual__cloud auth-visual__cloud--two">
            ☁️
          </div>

          <footer className="auth-visual__footer">
            Store • Share • Secure
          </footer>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel__mobile-brand">
            <span>
              <Cloud size={27} />
            </span>

            <strong>CloudNest</strong>
          </div>

          <div className="auth-panel__heading">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          {children}
        </section>
      </section>
    </main>
  );
}

export default AuthLayout;