import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("loggedIn", "true");

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="login-page">

      <div className="overlay"></div>

      <div className="login-container">

        {/* ================= LEFT PANEL ================= */}

        <div className="left-panel">

          <img
            src={logo}
            alt="R Dream Infra Developers"
            className="brand-logo"
          />

          <h1>R DREAM</h1>

          <h2>REAL ESTATE CRM</h2>

          <p className="brand-description">
            Manage your plots, customers, bookings,
            payments and reports from one secure dashboard.
          </p>

          <div className="highlights">

            

            <div>✔ Ready For Registration</div>

            <div>✔ Premium Residential Plots</div>

            <div>✔ Secure Cloud Based CRM</div>

          </div>

          <div className="features">

            <div className="feature-card">
              <h3>272+</h3>
              <span>Premium Plots</span>
            </div>

            <div className="feature-card">
              <h3>180+</h3>
              <span>Happy Customers</span>
            </div>

            <div className="feature-card">
              <h3>₹12Cr+</h3>
              <span>Property Value</span>
            </div>

          </div>

        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="login-card">

          <div className="login-header">

            <h2>Welcome Back</h2>

            <p>
              Sign in to access your Real Estate CRM dashboard.
            </p>

          </div>

          <form onSubmit={handleLogin}>

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </div>

            <div className="login-options">

              <label>

                <input type="checkbox" />

                Remember Me

              </label>

              <a href="/">Forgot Password?</a>

            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <div className="login-footer">
            © {new Date().getFullYear()} R Dream Infra Developers
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;