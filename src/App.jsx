import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/CustomerDetails";
import EditCustomer from "./pages/EditCustomer";
import AddPayment from "./pages/AddPayment";
import Customers from "./pages/Customers";
import ReceiptPage from "./pages/ReceiptPage";
import Plots from "./pages/Plots";
import BookPlot from "./pages/BookPlot";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <h2 style={{ color: "white", textAlign: "center" }}>
        Loading...
      </h2>
    );
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
        path="/customers"
        element={
          session ? <Customers /> : <Navigate to="/" replace />
        }
      />

      <Route
        path="/plots"
        element={
          session ? <Plots /> : <Navigate to="/" replace />
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
        path="/edit-customer/:id"
        element={
          session ? (
            <EditCustomer />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/add-payment/:id"
        element={
          session ? (
            <AddPayment />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/receipt"
        element={
          session ? (
            <ReceiptPage />
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
      <Route path="/book/:id" element={<BookPlot />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default App;