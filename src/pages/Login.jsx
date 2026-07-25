import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="overlay"></div>

      <div className="login-card">

        <div className="logo">
          🏡
        </div>

        <h1>R DREAM</h1>

        <p>Luxury Real Estate Management</p>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">

            <label>

              <input type="checkbox"/>

              Remember Me

            </label>

            <a href="/">Forgot Password?</a>

          </div>

          <button className="login-btn">
            Sign In
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;