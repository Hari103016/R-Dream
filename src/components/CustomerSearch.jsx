import "./CustomerSearch.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function CustomerSearch() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Please enter Plot No, Name or Mobile");
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(
        `plot_no.eq.${search},name.ilike.%${search}%,mobile.ilike.%${search}%`
      );

    if (error) {
      alert(error.message);
      return;
    }

    if (data.length === 0) {
      alert("Customer not found");
      return;
    }

    navigate(`/customer-details/${data[0].id}`);
  };

  return (
    <div className="search-card">
      <h2>🔍 Search Customer</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter Plot No / Customer Name / Mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
}

export default CustomerSearch;