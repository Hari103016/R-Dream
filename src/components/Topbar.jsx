import "./Topbar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

function Topbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
  if (!search.trim()) return;

  navigate(`/customer/${search}`);
};

  return (
    <header className="topbar">
      <div className="topbar-left">
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

        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <button className="icon-btn">
          <MessageCircle size={20} />
        </button>

        <div className="profile">
          <img
            src="https://i.pravatar.cc/80?img=15"
            alt="profile"
          />

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