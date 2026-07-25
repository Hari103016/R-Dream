import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/CustomerDetails";

function App() {
  const isLoggedIn = localStorage.getItem("loggedIn");

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/dashboard"
        element={
          isLoggedIn ? <Dashboard /> : <Navigate to="/" replace />
        }
      />

      <Route
        path="/customer/:id"
        element={
          isLoggedIn ? (
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
            to={isLoggedIn ? "/dashboard" : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;