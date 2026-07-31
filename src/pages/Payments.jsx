import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Download,
  Eye,
  CreditCard,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";

import "./Payments.css";

function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        customers (
          id,
          name,
          mobile,
          plot_no
        )
      `)
      .order("payment_date", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setPayments(data || []);
    setFilteredPayments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    const value = search.toLowerCase();

    const result = payments.filter((payment) => {
      return (
        payment.customers?.name
          ?.toLowerCase()
          .includes(value) ||
        payment.customers?.mobile
          ?.includes(search) ||
        payment.customers?.plot_no
          ?.toString()
          .includes(search)
      );
    });

    setFilteredPayments(result);
  }, [search, payments]);

  function exportExcel() {
    const rows = filteredPayments.map((payment) => ({
      "Customer Name": payment.customers?.name,
      "Plot No": payment.customers?.plot_no,
      Mobile: payment.customers?.mobile,
      Amount: payment.amount,
      "Payment Mode": payment.payment_mode,
      "Payment Date": payment.payment_date,
      Remarks: payment.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Payments"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer]),
      `Payments_${new Date().toLocaleDateString()}.xlsx`
    );
  }
    return (
    <div className="payments-page">

      <div className="payments-header">

        <h2>Payments</h2>

        <div className="header-actions">

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search Name / Plot / Mobile"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <button
            className="export-btn"
            onClick={exportExcel}
          >
            <Download size={18} />
            Export Excel
          </button>

        </div>

      </div>

      {loading ? (

        <div className="empty">
          Loading Payments...
        </div>

      ) : filteredPayments.length === 0 ? (

        <div className="empty">
          No Payments Found
        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>Customer</th>
                <th>Plot</th>
                <th>Mobile</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredPayments.map((payment) => (

                <tr key={payment.id}>

                  <td>{payment.customers?.name}</td>

                  <td>{payment.customers?.plot_no}</td>

                  <td>{payment.customers?.mobile}</td>

                  <td>
                    ₹
                    {Number(payment.amount).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>

                    <span className="payment-mode">

                      <CreditCard size={15} />

                      {payment.payment_mode}

                    </span>

                  </td>

                  <td>{payment.payment_date}</td>

                  <td>{payment.remarks}</td>

                  <td>

                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(
                          `/customer/${payment.customer_id}`
                        )
                      }
                    >
                      <Eye size={16} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}
          </div>
  );
}

export default Payments;