import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/CustomerDetails";

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <h2 style={{ color: "white", textAlign: "center" }}>Loading...</h2>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/dashboard"
        element={
          session ? <Dashboard /> : <Navigate to="/" replace />
        }
      />

      <Route
        path="/customer/:id"
        element={
          session ? (
            <CustomerDetails />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={session ? "/dashboard" : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;