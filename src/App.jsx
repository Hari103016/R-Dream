import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { supabase } from "./services/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import EditCustomer from "./pages/EditCustomer";
import AddPayment from "./pages/AddPayment";
import ReceiptPage from "./pages/ReceiptPage";
import Plots from "./pages/Plots";
import BookPlot from "./pages/BookPlot";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LayoutMap from "./pages/LayoutMap";
import AdminProfile from "./pages/AdminProfile"; // NEW

function App() {

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {

    async function checkSession() {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);

    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();

  }, []);

  if (loading) {
    return (
      <div
        style={{
          color: "white",
          textAlign: "center",
          marginTop: "50px",
          fontSize: "24px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (

    <Routes>

      {/* Login */}

      <Route
        path="/"
        element={
          session
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      {/* Dashboard */}

      <Route
        path="/dashboard"
        element={
          session
            ? <Dashboard />
            : <Navigate to="/" replace />
        }
      />

      {/* Customers */}

      <Route
        path="/customers"
        element={
          session
            ? <Customers />
            : <Navigate to="/" replace />
        }
      />

      {/* Customer Details */}

      <Route
        path="/customer/:id"
        element={
          session
            ? <CustomerDetails />
            : <Navigate to="/" replace />
        }
      />

      {/* Edit Customer */}

      <Route
        path="/edit-customer/:id"
        element={
          session
            ? <EditCustomer />
            : <Navigate to="/" replace />
        }
      />

      {/* Add Payment */}

      <Route
        path="/add-payment/:id"
        element={
          session
            ? <AddPayment />
            : <Navigate to="/" replace />
        }
      />

      {/* Receipt */}

      <Route
        path="/receipt"
        element={
          session
            ? <ReceiptPage />
            : <Navigate to="/" replace />
        }
      />

      {/* Plots */}

      <Route
        path="/plots"
        element={
          session
            ? <Plots />
            : <Navigate to="/" replace />
        }
      />

      {/* Book Plot */}

      <Route
        path="/book/:id"
        element={
          session
            ? <BookPlot />
            : <Navigate to="/" replace />
        }
      />

      {/* Bookings */}

      <Route
        path="/bookings"
        element={
          session
            ? <Bookings />
            : <Navigate to="/" replace />
        }
      />

      {/* Payments */}

      <Route
        path="/payments"
        element={
          session
            ? <Payments />
            : <Navigate to="/" replace />
        }
      />

      {/* Reports */}

      <Route
        path="/reports"
        element={
          session
            ? <Reports />
            : <Navigate to="/" replace />
        }
      />

      {/* Settings */}

      <Route
        path="/settings"
        element={
          session
            ? <Settings />
            : <Navigate to="/" replace />
        }
      />

      {/* Admin Profile */}

      <Route
        path="/admin-profile"
        element={
          session
            ? <AdminProfile />
            : <Navigate to="/" replace />
        }
      />

      {/* Unknown Route */}

      <Route
        path="*"
        element={
          <Navigate
            to={session ? "/dashboard" : "/"}
            replace
          />
        }
      />
      <Route
        path="/layout-map"
        element={
          session
          ? <LayoutMap />
          : <Navigate to="/" replace />
        }
      />

    </Routes>

  );
}

export default App;