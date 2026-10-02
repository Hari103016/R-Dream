import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        setError(loginError.message || "Invalid email or password.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="login-page login-loading">
        <div className="login-loading-card">
          <div className="login-loader">
            <span />
            <span />
            <span />
          </div>
          <strong>R DREAM</strong>
          <span>Preparing secure workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-background-grid" />
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <main className="login-shell">
        {/* BRAND / VISUAL PANEL */}
        <section className="login-brand-panel">
          <div className="brand-top">
            <div className="brand-symbol">R</div>

            <div>
              <strong>R DREAM</strong>
              <span>INFRA DEVELOPERS</span>
            </div>
          </div>

          <div className="brand-main">
            <div className="brand-kicker">
              <Sparkles size={15} />
              REAL ESTATE OPERATIONS
            </div>

            <h1>
              Your property
              <br />
              <span>command center.</span>
            </h1>

            <p>
              Manage plots, customers, bookings, payments and daily
              operations through one secure workspace.
            </p>

            <div className="brand-features">
              <div>
                <span className="feature-icon">
                  <Building2 size={18} />
                </span>
                <span>
                  <strong>Plot Management</strong>
                  <small>Track your entire layout</small>
                </span>
              </div>

              <div>
                <span className="feature-icon green">
                  <CheckCircle2 size={18} />
                </span>
                <span>
                  <strong>Live CRM Data</strong>
                  <small>Connected to your database</small>
                </span>
              </div>

              <div>
                <span className="feature-icon purple">
                  <ShieldCheck size={18} />
                </span>
                <span>
                  <strong>Secure Access</strong>
                  <small>Protected administrator login</small>
                </span>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <span>R DREAM INFRA DEVELOPERS</span>
            <span className="brand-footer-dot" />
            <span>ADMIN CONSOLE</span>
          </div>
        </section>

        {/* LOGIN PANEL */}
        <section className="login-form-panel">
          <div className="login-form-card">
            <div className="login-card-top">
              <div className="secure-badge">
                <LockKeyhole size={17} />
              </div>

              <div className="secure-status">
                <span />
                Secure Login
              </div>
            </div>

            <div className="login-heading">
              <span className="login-eyebrow">ADMINISTRATOR ACCESS</span>
              <h2>Welcome back.</h2>
              <p>
                Sign in to continue to your R Dream CRM workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="login-field">
                <span>Email Address</span>

                <div className="login-input-wrap">
                  <Mail size={19} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </label>

              <label className="login-field">
                <span>Password</span>

                <div className="login-input-wrap">
                  <LockKeyhole size={19} />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="login-error" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing in..." : "Sign in to CRM"}
                </span>

                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            <div className="login-security-note">
              <ShieldCheck size={17} />
              <div>
                <strong>Protected administrator area</strong>
                <span>
                  Authentication is securely handled by Supabase.
                </span>
              </div>
            </div>

            <div className="login-card-footer">
              <span>R DREAM</span>
              <span>•</span>
              <span>INFRA DEVELOPERS</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
