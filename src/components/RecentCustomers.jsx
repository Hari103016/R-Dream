import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./RecentCustomers.css";


function RecentCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setCustomers(data);
    }
  }

  return (
    <div className="recent-customers">
      <h2>👥 Recent Customers</h2>

      <table>
        <thead>
          <tr>
            <th>Plot No</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Status</th>
            <th>Total Amount</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.plot_no}</td>
              <td>{customer.name}</td>
              <td>{customer.mobile}</td>
              <td>
                <span className={`status ${customer.status.toLowerCase()}`}>
                  {customer.status}
                </span>
              </td>
              <td>₹{Number(customer.total_amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentCustomers;