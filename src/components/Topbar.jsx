import "./Topbar.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  ChevronDown,
  Menu,
} from "lucide-react";

function Topbar({ setSidebarOpen }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  // TODO: Replace with Supabase live search
  const handleSearch = () => {
    if (!search.trim()) return;

    navigate(`/customer/${search}`);
  };

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        <h2>🏡 Real Estate Dashboard</h2>

      </div>

      <div className="topbar-right">

        <div className="search-bar">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search Plot No / Name / Mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            className="search-btn"
            onClick={handleSearch}
          >
            Search
          </button>

        </div>

        {search && (
          <div className="search-results">
            <div className="search-item">Press Enter to search: <strong>{search}</strong></div>
          </div>
        )}

        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <button className="icon-btn">
          <MessageCircle size={20} />
        </button>

        <div className="profile">

          

          <div>
            <h4>Hari</h4>
            <span>Administrator</span>
          </div>

          <ChevronDown size={18} />

        </div>

      </div>

    </header>
  );
}

export default Topbar;