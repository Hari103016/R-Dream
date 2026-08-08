import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Building2,
  Image,
  Palette,
  Bell,
  MessageCircle,
  Mail,
  Users,
  Lock,
  Receipt,
  DatabaseBackup,
  Info,
  Save,
  Upload,
  Trash2,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("company");

  /* =========================
     COMPANY
  ========================= */

  const [company, setCompany] = useState({
    companyName: "R Dream Infra Developers",
    phone: "9876543210",
    email: "info@rdreaminfra.com",
    website: "",
    address: "NTR District, Andhra Pradesh",
    gst: "",
    pan: "",
    adminName: "Hari",
    username: "admin",
  });

  /* =========================
     APPEARANCE
  ========================= */

  const [appearance, setAppearance] = useState({
    primaryColor: "#2563eb",
    theme: "dark",
    density: "comfortable",
  });

  /* =========================
     NOTIFICATIONS
  ========================= */

  const [notifications, setNotifications] = useState({
    booking: true,
    payment: true,
    pendingBalance: true,
    customer: true,
  });

  /* =========================
     WHATSAPP
  ========================= */

  const [whatsapp, setWhatsapp] = useState({
    number: "",
    bookingMessage:
      "Hello {customer}, your booking for Plot #{plot} has been successfully recorded.",
    paymentMessage:
      "Hello {customer}, we have received your payment of ₹{amount} for Plot #{plot}.",
    balanceMessage:
      "Hello {customer}, your pending balance for Plot #{plot} is ₹{balance}.",
  });

  /* =========================
     EMAIL
  ========================= */

  const [emailSettings, setEmailSettings] = useState({
    email: "",
    senderName: "R Dream Infra Developers",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
  });

  /* =========================
     USERS
  ========================= */

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Hari",
      username: "admin",
      role: "Administrator",
      status: "Active",
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    role: "Staff",
  });

  /* =========================
     SECURITY
  ========================= */

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =========================
     RECEIPT
  ========================= */

  const [receipt, setReceipt] = useState({
    showLogo: true,
    showCompanyName: true,
    showAddress: true,
    showPhone: true,
    receiptPrefix: "RCPT-",
    footer:
      "Thank you for choosing R Dream Infra Developers.",
  });

  /* =========================
     LOGO
  ========================= */

  const [logo, setLogo] = useState("");

  /* =========================
     LOAD SETTINGS
  ========================= */

  useEffect(() => {
    try {
      const savedCompany = localStorage.getItem("companySettings");
      const savedAppearance = localStorage.getItem("appearanceSettings");
      const savedNotifications = localStorage.getItem(
        "notificationSettings"
      );
      const savedWhatsapp = localStorage.getItem("whatsappSettings");
      const savedEmail = localStorage.getItem("emailSettings");
      const savedUsers = localStorage.getItem("adminUsers");
      const savedReceipt = localStorage.getItem("receiptSettings");
      const savedLogo = localStorage.getItem("companyLogo");

      if (savedCompany) {
        setCompany(JSON.parse(savedCompany));
      }

      if (savedAppearance) {
        setAppearance(JSON.parse(savedAppearance));
      }

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }

      if (savedWhatsapp) {
        setWhatsapp(JSON.parse(savedWhatsapp));
      }

      if (savedEmail) {
        setEmailSettings(JSON.parse(savedEmail));
      }

      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }

      if (savedReceipt) {
        setReceipt(JSON.parse(savedReceipt));
      }

      if (savedLogo) {
        setLogo(savedLogo);
      }
    } catch (error) {
      console.error("Settings load error:", error);
    }
  }, []);

  /* =========================
     APPLY APPEARANCE
  ========================= */

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary-color",
      appearance.primaryColor
    );

    if (appearance.theme === "light") {
      document.body.classList.add("settings-light-theme");
    } else {
      document.body.classList.remove("settings-light-theme");
    }
  }, [appearance]);

  /* =========================
     SAVE COMPANY
  ========================= */

  function saveCompany() {
    localStorage.setItem("companySettings", JSON.stringify(company));
    toast.success("Company settings saved successfully");
  }

  /* =========================
     SAVE APPEARANCE
  ========================= */

  function saveAppearance() {
    localStorage.setItem(
      "appearanceSettings",
      JSON.stringify(appearance)
    );

    toast.success("Appearance settings saved");
  }

  /* =========================
     SAVE NOTIFICATIONS
  ========================= */

  function saveNotifications() {
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(notifications)
    );

    toast.success("Notification settings saved");
  }

  /* =========================
     SAVE WHATSAPP
  ========================= */

  function saveWhatsapp() {
    localStorage.setItem(
      "whatsappSettings",
      JSON.stringify(whatsapp)
    );

    toast.success("WhatsApp settings saved");
  }

  /* =========================
     SAVE EMAIL
  ========================= */

  function saveEmail() {
    localStorage.setItem(
      "emailSettings",
      JSON.stringify(emailSettings)
    );

    toast.success("Email settings saved");
  }

  /* =========================
     SAVE RECEIPT
  ========================= */

  function saveReceipt() {
    localStorage.setItem(
      "receiptSettings",
      JSON.stringify(receipt)
    );

    toast.success("Receipt settings saved");
  }

  /* =========================
     LOGO UPLOAD
  ========================= */

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      setLogo(image);
      localStorage.setItem("companyLogo", image);

      toast.success("Logo uploaded successfully");
    };

    reader.readAsDataURL(file);
  }

  /* =========================
     DELETE LOGO
  ========================= */

  function deleteLogo() {
    setLogo("");
    localStorage.removeItem("companyLogo");

    toast.success("Logo removed");
  }

  /* =========================
     ADD USER
  ========================= */

  function addUser() {
    if (!newUser.name.trim()) {
      toast.error("Enter user name");
      return;
    }

    if (!newUser.username.trim()) {
      toast.error("Enter username");
      return;
    }

    const user = {
      id: Date.now(),
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
      status: "Active",
    };

    const updatedUsers = [...users, user];

    setUsers(updatedUsers);
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));

    setNewUser({
      name: "",
      username: "",
      role: "Staff",
    });

    toast.success("User added successfully");
  }

  /* =========================
     DELETE USER
  ========================= */

  function deleteUser(id) {
    if (users.length === 1) {
      toast.error("At least one administrator must remain");
      return;
    }

    const updatedUsers = users.filter((user) => user.id !== id);

    setUsers(updatedUsers);
    localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));

    toast.success("User deleted");
  }

  /* =========================
     CHANGE PASSWORD
  ========================= */

  function changePassword() {
    if (!security.currentPassword) {
      toast.error("Enter current password");
      return;
    }

    if (!security.newPassword) {
      toast.error("Enter new password");
      return;
    }

    if (security.newPassword.length < 6) {
      toast.error("Password must contain at least 6 characters");
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success("Password change request completed");

    setSecurity({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  /* =========================
     BACKUP
  ========================= */

  function createBackup() {
    const backupData = {
      company,
      appearance,
      notifications,
      whatsapp,
      emailSettings,
      users,
      receipt,
      logo,
      backupDate: new Date().toISOString(),
    };

    const blob = new Blob(
      [JSON.stringify(backupData, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `dream-infra-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    link.click();

    URL.revokeObjectURL(url);

    toast.success("Backup downloaded successfully");
  }

  /* =========================
     RESTORE BACKUP
  ========================= */

  function restoreBackup(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (data.company) {
          setCompany(data.company);
          localStorage.setItem(
            "companySettings",
            JSON.stringify(data.company)
          );
        }

        if (data.appearance) {
          setAppearance(data.appearance);
          localStorage.setItem(
            "appearanceSettings",
            JSON.stringify(data.appearance)
          );
        }

        if (data.notifications) {
          setNotifications(data.notifications);
          localStorage.setItem(
            "notificationSettings",
            JSON.stringify(data.notifications)
          );
        }

        if (data.whatsapp) {
          setWhatsapp(data.whatsapp);
          localStorage.setItem(
            "whatsappSettings",
            JSON.stringify(data.whatsapp)
          );
        }

        if (data.emailSettings) {
          setEmailSettings(data.emailSettings);
          localStorage.setItem(
            "emailSettings",
            JSON.stringify(data.emailSettings)
          );
        }

        if (data.users) {
          setUsers(data.users);
          localStorage.setItem(
            "adminUsers",
            JSON.stringify(data.users)
          );
        }

        if (data.receipt) {
          setReceipt(data.receipt);
          localStorage.setItem(
            "receiptSettings",
            JSON.stringify(data.receipt)
          );
        }

        if (data.logo) {
          setLogo(data.logo);
          localStorage.setItem("companyLogo", data.logo);
        }

        toast.success("Backup restored successfully");
      } catch (error) {
        console.error(error);
        toast.error("Invalid backup file");
      }
    };

    reader.readAsText(file);
  }

  /* =========================
     MENU
  ========================= */

  const menu = [
    {
      id: "company",
      label: "Company",
      icon: <Building2 size={17} />,
    },
    {
      id: "logo",
      label: "Logo",
      icon: <Image size={17} />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette size={17} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={17} />,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle size={17} />,
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail size={17} />,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={17} />,
    },
    {
      id: "security",
      label: "Security",
      icon: <Lock size={17} />,
    },
    {
      id: "receipt",
      label: "Receipt",
      icon: <Receipt size={17} />,
    },
    {
      id: "backup",
      label: "Backup & Restore",
      icon: <DatabaseBackup size={17} />,
    },
    {
      id: "about",
      label: "About",
      icon: <Info size={17} />,
    },
  ];

  /* =========================
     COMPANY TAB
  ========================= */

  function CompanyTab() {
    return (
      <>
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Company Information</h2>
              <p>Manage your company details</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="form-group">
              <label>Company Name</label>

              <input
                value={company.companyName}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    companyName: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                value={company.phone}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={company.email}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Website</label>

              <input
                value={company.website}
                placeholder="https://example.com"
                onChange={(e) =>
                  setCompany({
                    ...company,
                    website: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group full-width">
              <label>Address</label>

              <textarea
                rows="4"
                value={company.address}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    address: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>GST Number</label>

              <input
                value={company.gst}
                placeholder="Enter GST number"
                onChange={(e) =>
                  setCompany({
                    ...company,
                    gst: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>PAN Number</label>

              <input
                value={company.pan}
                placeholder="Enter PAN number"
                onChange={(e) =>
                  setCompany({
                    ...company,
                    pan: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Administrator</h2>
          <p className="section-description">
            Details of the main administrator account.
          </p>

          <div className="settings-grid">
            <div className="form-group">
              <label>Admin Name</label>

              <input
                value={company.adminName}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    adminName: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Username</label>

              <input
                value={company.username}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    username: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={saveCompany}
        >
          <Save size={17} />
          Save Company Settings
        </button>
      </>
    );
  }

  /* =========================
     LOGO TAB
  ========================= */

  function LogoTab() {
    return (
      <div className="settings-card">
        <h2>Company Logo</h2>

        <p className="section-description">
          Upload the company logo used throughout the admin panel
          and receipts.
        </p>

        <div className="logo-settings">
          <div className="logo-preview">
            {logo ? (
              <img src={logo} alt="Company Logo" />
            ) : (
              <div className="logo-empty">
                <Image size={45} />
                <span>No Logo</span>
              </div>
            )}
          </div>

          <div className="logo-actions">
            <label className="upload-button">
              <Upload size={17} />
              Upload Logo

              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                hidden
              />
            </label>

            {logo && (
              <button
                className="delete-logo-btn"
                onClick={deleteLogo}
              >
                <Trash2 size={17} />
                Delete Logo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     APPEARANCE TAB
  ========================= */

  function AppearanceTab() {
    return (
      <>
        <div className="settings-card">
          <h2>Appearance</h2>

          <p className="section-description">
            Customize the look and feel of your admin panel.
          </p>

          <div className="appearance-section">
            <h3>Primary Color</h3>

            <div className="color-row">
              <input
                type="color"
                value={appearance.primaryColor}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    primaryColor: e.target.value,
                  })
                }
              />

              <input
                value={appearance.primaryColor}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    primaryColor: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="appearance-section">
            <h3>Theme</h3>

            <div className="option-grid">
              <button
                className={
                  appearance.theme === "dark"
                    ? "option-card selected"
                    : "option-card"
                }
                onClick={() =>
                  setAppearance({
                    ...appearance,
                    theme: "dark",
                  })
                }
              >
                <span>🌙</span>
                <strong>Dark</strong>
                <small>Dark admin interface</small>
              </button>

              <button
                className={
                  appearance.theme === "light"
                    ? "option-card selected"
                    : "option-card"
                }
                onClick={() =>
                  setAppearance({
                    ...appearance,
                    theme: "light",
                  })
                }
              >
                <span>☀️</span>
                <strong>Light</strong>
                <small>Light admin interface</small>
              </button>
            </div>
          </div>

          <div className="appearance-section">
            <h3>Layout Density</h3>

            <select
              value={appearance.density}
              onChange={(e) =>
                setAppearance({
                  ...appearance,
                  density: e.target.value,
                })
              }
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={saveAppearance}
        >
          <Save size={17} />
          Save Appearance
        </button>
      </>
    );
  }

  /* =========================
     NOTIFICATION TAB
  ========================= */

  function NotificationTab() {
    const items = [
      {
        key: "booking",
        title: "Booking Notifications",
        description: "Notify when a new plot is booked.",
      },
      {
        key: "payment",
        title: "Payment Notifications",
        description: "Notify when a payment is received.",
      },
      {
        key: "pendingBalance",
        title: "Pending Balance",
        description: "Notify about customer pending balances.",
      },
      {
        key: "customer",
        title: "Customer Notifications",
        description: "Enable customer-related notifications.",
      },
    ];

    return (
      <>
        <div className="settings-card">
          <h2>Notifications</h2>

          <p className="section-description">
            Choose which notifications should be enabled.
          </p>

          <div className="toggle-list">
            {items.map((item) => (
              <div className="toggle-item" key={item.key}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                  />

                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={saveNotifications}
        >
          <Save size={17} />
          Save Notifications
        </button>
      </>
    );
  }

  /* =========================
     WHATSAPP TAB
  ========================= */

  function WhatsAppTab() {
    return (
      <>
        <div className="settings-card">
          <h2>WhatsApp Settings</h2>

          <p className="section-description">
            Configure WhatsApp messages for customers.
          </p>

          <div className="form-group">
            <label>WhatsApp Number</label>

            <input
              value={whatsapp.number}
              placeholder="9876543210"
              onChange={(e) =>
                setWhatsapp({
                  ...whatsapp,
                  number: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Booking Message</label>

            <textarea
              rows="4"
              value={whatsapp.bookingMessage}
              onChange={(e) =>
                setWhatsapp({
                  ...whatsapp,
                  bookingMessage: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Payment Message</label>

            <textarea
              rows="4"
              value={whatsapp.paymentMessage}
              onChange={(e) =>
                setWhatsapp({
                  ...whatsapp,
                  paymentMessage: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Balance Reminder</label>

            <textarea
              rows="4"
              value={whatsapp.balanceMessage}
              onChange={(e) =>
                setWhatsapp({
                  ...whatsapp,
                  balanceMessage: e.target.value,
                })
              }
            />
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={saveWhatsapp}
        >
          <Save size={17} />
          Save WhatsApp Settings
        </button>
      </>
    );
  }

  /* =========================
     EMAIL TAB
  ========================= */

  function EmailTab() {
    return (
      <>
        <div className="settings-card">
          <h2>Email Settings</h2>

          <p className="section-description">
            Configure email notification settings.
          </p>

          <div className="settings-grid">
            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                value={emailSettings.email}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Sender Name</label>

              <input
                value={emailSettings.senderName}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    senderName: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>SMTP Host</label>

              <input
                value={emailSettings.smtpHost}
                placeholder="smtp.gmail.com"
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpHost: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>SMTP Port</label>

              <input
                value={emailSettings.smtpPort}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPort: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>SMTP Username</label>

              <input
                value={emailSettings.smtpUsername}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpUsername: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>SMTP Password</label>

              <input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={saveEmail}
        >
          <Save size={17} />
          Save Email Settings
        </button>
      </>
    );
  }

  /* =========================
     USERS TAB
  ========================= */

  function UsersTab() {
    return (
      <>
        <div className="settings-card">
          <h2>Add User</h2>

          <div className="settings-grid">
            <div className="form-group">
              <label>Name</label>

              <input
                value={newUser.name}
                placeholder="User name"
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Username</label>

              <input
                value={newUser.username}
                placeholder="Username"
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    username: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Role</label>

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value,
                  })
                }
              >
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">
                  Administrator
                </option>
              </select>
            </div>
          </div>

          <button
            className="save-settings-btn"
            onClick={addUser}
          >
            <Users size={17} />
            Add User
          </button>
        </div>

        <div className="settings-card">
          <h2>Users</h2>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>

                    <td>
                      <span className="status-active">
                        <CheckCircle size={14} />
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-user-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  /* =========================
     SECURITY TAB
  ========================= */

  function SecurityTab() {
    return (
      <>
        <div className="settings-card">
          <h2>Security</h2>

          <p className="section-description">
            Manage your administrator password.
          </p>

          <div className="password-field">
            <div className="form-group">
              <label>Current Password</label>

              <input
                type={showCurrentPassword ? "text" : "password"}
                value={security.currentPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
            >
              {showCurrentPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <div className="password-field">
            <div className="form-group">
              <label>New Password</label>

              <input
                type={showNewPassword ? "text" : "password"}
                value={security.newPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(!showNewPassword)
              }
            >
              {showNewPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <div className="password-field">
            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type={
                  showConfirmPassword ? "text" : "password"
                }
                value={security.confirmPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={changePassword}
        >
          <Lock size={17} />
          Change Password
        </button>
      </>
    );
  }

  /* =========================
     RECEIPT TAB
  ========================= */

  function ReceiptTab() {
    return (
      <>
        <div className="settings-card">
          <h2>Receipt Settings</h2>

          <p className="section-description">
            Configure what appears on customer receipts.
          </p>

          <div className="toggle-list">
            <div className="toggle-item">
              <div>
                <strong>Show Company Logo</strong>
                <p>Display logo on printed receipts.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={receipt.showLogo}
                  onChange={(e) =>
                    setReceipt({
                      ...receipt,
                      showLogo: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div>
                <strong>Show Company Name</strong>
                <p>Display company name on receipt.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={receipt.showCompanyName}
                  onChange={(e) =>
                    setReceipt({
                      ...receipt,
                      showCompanyName: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div>
                <strong>Show Address</strong>
                <p>Display company address.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={receipt.showAddress}
                  onChange={(e) =>
                    setReceipt({
                      ...receipt,
                      showAddress: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div>
                <strong>Show Phone</strong>
                <p>Display company phone number.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={receipt.showPhone}
                  onChange={(e) =>
                    setReceipt({
                      ...receipt,
                      showPhone: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-grid receipt-form">
            <div className="form-group">
              <label>Receipt Prefix</label>

              <input
                value={receipt.receiptPrefix}
                onChange={(e) =>
                  setReceipt({
                    ...receipt,
                    receiptPrefix: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group full-width">
              <label>Receipt Footer</label>

              <textarea
                rows="4"
                value={receipt.footer}
                onChange={(e) =>
                  setReceipt({
                    ...receipt,
                    footer: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={saveReceipt}
        >
          <Save size={17} />
          Save Receipt Settings
        </button>
      </>
    );
  }

  /* =========================
     BACKUP TAB
  ========================= */

  function BackupTab() {
    return (
      <>
        <div className="settings-card">
          <h2>Backup & Restore</h2>

          <p className="section-description">
            Create a backup of your admin settings and restore
            them whenever required.
          </p>

          <div className="backup-grid">
            <div className="backup-box">
              <div className="backup-icon">
                <Download size={25} />
              </div>

              <h3>Create Backup</h3>

              <p>
                Download your current settings as a backup
                file.
              </p>

              <button
                className="save-settings-btn"
                onClick={createBackup}
              >
                <Download size={17} />
                Download Backup
              </button>
            </div>

            <div className="backup-box">
              <div className="backup-icon restore">
                <RotateCcw size={25} />
              </div>

              <h3>Restore Backup</h3>

              <p>
                Restore your settings from a previous backup.
              </p>

              <label className="upload-button">
                <RotateCcw size={17} />
                Select Backup

                <input
                  type="file"
                  accept=".json"
                  onChange={restoreBackup}
                  hidden
                />
              </label>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================
     ABOUT TAB
  ========================= */

  function AboutTab() {
    return (
      <div className="settings-card">
        <div className="about-header">
          <div className="about-logo">
            {logo ? (
              <img src={logo} alt="Company Logo" />
            ) : (
              <Building2 size={45} />
            )}
          </div>

          <div>
            <h2>R Dream Infra Developers</h2>
            <p>Real Estate Management System</p>
          </div>
        </div>

        <div className="about-table">
          <div>
            <span>Application</span>
            <strong>Dream Infra Admin Panel</strong>
          </div>

          <div>
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>

          <div>
            <span>Platform</span>
            <strong>React + Supabase</strong>
          </div>

          <div>
            <span>Environment</span>
            <strong>Production Ready</strong>
          </div>

          <div>
            <span>Company</span>
            <strong>{company.companyName}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>{company.phone}</strong>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER ACTIVE TAB
  ========================= */

  function renderTab() {
    switch (activeTab) {
      case "company":
        return <CompanyTab />;

      case "logo":
        return <LogoTab />;

      case "appearance":
        return <AppearanceTab />;

      case "notifications":
        return <NotificationTab />;

      case "whatsapp":
        return <WhatsAppTab />;

      case "email":
        return <EmailTab />;

      case "users":
        return <UsersTab />;

      case "security":
        return <SecurityTab />;

      case "receipt":
        return <ReceiptTab />;

      case "backup":
        return <BackupTab />;

      case "about":
        return <AboutTab />;

      default:
        return <CompanyTab />;
    }
  }

  /* =========================
     MAIN
  ========================= */

  return (
    <div className="settings-wrapper">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="settings-sidebar">

        <div className="settings-sidebar-title">
          <h2>Settings</h2>
          <p>Manage your admin panel</p>
        </div>

        <div className="settings-menu-list">
          {menu.map((item) => (
            <button
              key={item.id}
              className={
                activeTab === item.id
                  ? "settings-menu active"
                  : "settings-menu"
              }
              onClick={() => setActiveTab(item.id)}
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </div>

      </aside>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="settings-content">

        {/* BACK BUTTON */}

        <button
          className="settings-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* PAGE HEADER */}

        <div className="settings-page-header">
          <div>
            <h1>
              {
                menu.find(
                  (item) => item.id === activeTab
                )?.label
              }
            </h1>

            <p>
              Configure your{" "}
              {
                menu.find(
                  (item) => item.id === activeTab
                )?.label
              }{" "}
              settings
            </p>
          </div>
        </div>

        {renderTab()}

      </main>
    </div>
  );
}

export default Settings;