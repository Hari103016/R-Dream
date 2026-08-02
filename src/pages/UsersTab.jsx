import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function UsersTab() {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Sales Executive",
    status: "Active",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("crm_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data || []);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function addUser() {
    if (!formData.full_name || !formData.email) {
      toast.error("Name and Email are required.");
      return;
    }

    const { error } = await supabase
      .from("crm_users")
      .insert([formData]);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("User Added");

    setFormData({
      full_name: "",
      email: "",
      phone: "",
      role: "Sales Executive",
      status: "Active",
    });

    loadUsers();
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;

    const { error } = await supabase
      .from("crm_users")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("User Deleted");

    loadUsers();
  }

  return (
    <div className="settings-card">

      <h2>
        <Users size={22} />
        User Management
      </h2>

      <div className="settings-grid">

        <div className="form-group">
          <label>Full Name</label>

          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Role</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option>Admin</option>
            <option>Sales Executive</option>
            <option>Accountant</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={addUser}
      >
        <Plus size={18} />
        Add User
      </button>

      <hr style={{ margin: "30px 0" }} />

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user.id}>

              <td>{user.full_name}</td>

              <td>{user.email}</td>

              <td>{user.role}</td>

              <td>{user.status}</td>

              <td>

                <button
                  className="delete-user-btn"
                  onClick={() => deleteUser(user.id)}
                >
                  <Trash2 size={16} />
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UsersTab;