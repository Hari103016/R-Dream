import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  Edit3,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState({
    full_name: "",
    role: "Administrator",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    role: "Administrator",
    avatar_url: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!currentUser) {
        navigate("/", { replace: true });
        return;
      }

      setUser(currentUser);

      const { data, error: profileError } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const profile = {
        full_name: data?.full_name || "",
        role: data?.role || "Administrator",
        avatar_url: data?.avatar_url || "",
      };

      setAdmin(profile);
      setForm(profile);
    } catch (err) {
      console.error("Admin profile load error:", err);
      setError(err?.message || "Unable to load admin profile.");
    } finally {
      setLoading(false);
    }
  }

  const displayName =
    admin.full_name?.trim() ||
    user?.user_metadata?.full_name ||
    "Administrator";

  const displayRole = admin.role?.trim() || "Administrator";

  const email = user?.email || "No email available";

  const initials = useMemo(() => {
    const words = displayName.trim().split(/\s+/).filter(Boolean);

    if (!words.length) return "AD";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }, [displayName]);

  const avatarUrl = admin.avatar_url?.trim();

  function showMessage(text) {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function openEdit() {
    setForm({
      full_name: admin.full_name || "",
      role: admin.role || "Administrator",
      avatar_url: admin.avatar_url || "",
    });
    setError("");
    setEditOpen(true);
  }

  async function saveProfile(event) {
    event.preventDefault();

    const fullName = form.full_name.trim();

    if (!fullName) {
      setError("Please enter the admin name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        full_name: fullName,
        role: form.role.trim() || "Administrator",
        avatar_url: form.avatar_url.trim(),
      };

      const { data, error: updateError } = await supabase
        .from("admin_profiles")
        .update(payload)
        .eq("id", user.id)
        .select("*")
        .maybeSingle();

      if (updateError) throw updateError;

      const updatedProfile = {
        full_name: data?.full_name ?? payload.full_name,
        role: data?.role ?? payload.role,
        avatar_url: data?.avatar_url ?? payload.avatar_url,
      };

      setAdmin(updatedProfile);
      setForm(updatedProfile);
      setEditOpen(false);
      showMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Admin profile update error:", err);
      setError(err?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    if (passwordForm.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: passwordForm.password,
      });

      if (passwordError) throw passwordError;

      setPasswordForm({
        password: "",
        confirmPassword: "",
      });

      setPasswordOpen(false);
      showMessage("Password changed successfully.");
    } catch (err) {
      console.error("Password update error:", err);
      setError(err?.message || "Unable to change password.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  if (loading) {
    return (
      <div className="admin-profile-page admin-profile-loading">
        <div className="admin-loading-card">
          <div className="admin-loading-orbit" />
          <span>R DREAM INFRA DEVELOPERS</span>
          <h2>Loading Admin Profile</h2>
          <p>Preparing your secure account workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-bg-orb orb-one" />
      <div className="admin-profile-bg-orb orb-two" />

      <div className="admin-profile-container">
        <header className="admin-profile-top">
          <button
            type="button"
            className="admin-back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="admin-breadcrumb">
            <span>Administration</span>
            <ChevronRight size={15} />
            <strong>Admin Profile</strong>
          </div>
        </header>

        {message && (
          <div className="admin-toast success">
            <span className="toast-icon">
              <Check size={17} />
            </span>
            <div>
              <strong>Profile updated</strong>
              <span>{message}</span>
            </div>
          </div>
        )}

        {error && !editOpen && !passwordOpen && (
          <div className="admin-inline-error">
            <strong>Action could not be completed.</strong>
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <section className="admin-hero-card">
          <div className="hero-grid-glow" />

          <div className="admin-identity">
            <div className="admin-avatar-wrap">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="admin-profile-avatar"
                />
              ) : (
                <div className="admin-profile-avatar admin-avatar-initials">
                  {initials}
                </div>
              )}

              <span className="admin-online-dot" />
              <span className="admin-avatar-badge">
                <ShieldCheck size={15} />
              </span>
            </div>

            <div className="admin-identity-copy">
              <div className="admin-kicker">
                <Sparkles size={13} />
                R DREAM INFRA DEVELOPERS
              </div>

              <h1>{displayName}</h1>

              <div className="admin-role-line">
                <BadgeCheck size={17} />
                <span>{displayRole}</span>
                <span className="admin-status-pill">ACTIVE</span>
              </div>

              <div className="admin-email">
                <Mail size={15} />
                {email}
              </div>
            </div>
          </div>

          <div className="admin-hero-actions">
            <button
              type="button"
              className="admin-primary-button"
              onClick={openEdit}
            >
              <Edit3 size={17} />
              Edit Profile
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setError("");
                setPasswordOpen(true);
              }}
            >
              <KeyRound size={17} />
              Change Password
            </button>
          </div>
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-main-column">
            <div className="admin-section-heading">
              <div>
                <span className="section-eyebrow">ACCOUNT OVERVIEW</span>
                <h2>Administrator workspace</h2>
              </div>

              <span className="secure-label">
                <LockKeyhole size={14} />
                Secure account
              </span>
            </div>

            <div className="admin-info-grid">
              <article className="admin-info-card featured">
                <div className="info-icon">
                  <UserRound size={20} />
                </div>
                <div>
                  <span>Full Name</span>
                  <strong>{displayName}</strong>
                  <small>Primary administrator identity</small>
                </div>
              </article>

              <article className="admin-info-card">
                <div className="info-icon blue">
                  <Mail size={20} />
                </div>
                <div>
                  <span>Email Address</span>
                  <strong>{email}</strong>
                  <small>Authentication email</small>
                </div>
              </article>

              <article className="admin-info-card">
                <div className="info-icon green">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <span>Account Role</span>
                  <strong>{displayRole}</strong>
                  <small>Administrative access</small>
                </div>
              </article>

              <article className="admin-info-card">
                <div className="info-icon gold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span>Security</span>
                  <strong>Protected</strong>
                  <small>Supabase authentication</small>
                </div>
              </article>
            </div>

            <div className="admin-security-card">
              <div className="security-visual">
                <div className="security-ring ring-one" />
                <div className="security-ring ring-two" />
                <div className="security-lock">
                  <LockKeyhole size={25} />
                </div>
              </div>

              <div className="security-copy">
                <span className="section-eyebrow">SECURITY CENTER</span>
                <h3>Keep your administrator account protected</h3>
                <p>
                  Use a strong password and keep your account information
                  current. Password changes are handled through Supabase
                  Authentication.
                </p>
              </div>

              <button
                type="button"
                className="security-action"
                onClick={() => {
                  setError("");
                  setPasswordOpen(true);
                }}
              >
                Update Password
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <aside className="admin-side-column">
            <div className="admin-quick-card">
              <div className="quick-card-top">
                <div>
                  <span className="section-eyebrow">QUICK ACTIONS</span>
                  <h3>Manage account</h3>
                </div>
                <div className="quick-mark">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <button type="button" onClick={openEdit}>
                <span className="quick-icon">
                  <Edit3 size={17} />
                </span>
                <span>
                  <strong>Edit profile</strong>
                  <small>Update your admin details</small>
                </span>
                <ChevronRight size={17} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPasswordOpen(true);
                }}
              >
                <span className="quick-icon">
                  <KeyRound size={17} />
                </span>
                <span>
                  <strong>Change password</strong>
                  <small>Secure your login credentials</small>
                </span>
                <ChevronRight size={17} />
              </button>

              <button type="button" onClick={logout} className="quick-logout">
                <span className="quick-icon danger">
                  <LogOut size={17} />
                </span>
                <span>
                  <strong>Sign out</strong>
                  <small>End this administrator session</small>
                </span>
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="admin-brand-card">
              <div className="brand-mark">RD</div>
              <span>R DREAM INFRA DEVELOPERS</span>
              <p>Real Estate Operations Console</p>
              <div className="brand-line">
                <span />
                <span />
                <span />
              </div>
            </div>
          </aside>
        </section>
      </div>

      {editOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditOpen(false);
          }}
        >
          <form className="admin-modal" onSubmit={saveProfile}>
            <div className="modal-top-accent" />

            <div className="modal-header">
              <div>
                <span className="section-eyebrow">PROFILE SETTINGS</span>
                <h2>Edit Admin Profile</h2>
                <p>Update the information shown across your CRM.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setEditOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-avatar-preview">
              {form.avatar_url.trim() ? (
                <img src={form.avatar_url} alt="Preview" />
              ) : (
                <span>{initials}</span>
              )}

              <div>
                <strong>Profile identity</strong>
                <p>Use an image URL if you want a custom profile photo.</p>
              </div>
            </div>

            <label className="admin-field">
              <span>Full Name *</span>
              <div className="field-shell">
                <UserRound size={17} />
                <input
                  value={form.full_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  placeholder="Enter admin name"
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="admin-field">
              <span>Role</span>
              <div className="field-shell">
                <BadgeCheck size={17} />
                <input
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  placeholder="Administrator"
                />
              </div>
            </label>

            <label className="admin-field">
              <span>Profile Image URL</span>
              <div className="field-shell">
                <Camera size={17} />
                <input
                  value={form.avatar_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      avatar_url: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </label>

            {error && (
              <div className="modal-error">
                <X size={16} />
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="modal-save"
                disabled={saving}
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPasswordOpen(false);
              setPasswordForm({ password: "", confirmPassword: "" });
            }
          }}
        >
          <form className="admin-modal password-modal" onSubmit={changePassword}>
            <div className="modal-top-accent password-accent" />

            <div className="modal-header">
              <div>
                <span className="section-eyebrow">SECURITY</span>
                <h2>Change Password</h2>
                <p>Create a new password for your administrator account.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setPasswordOpen(false);
                  setPasswordForm({ password: "", confirmPassword: "" });
                }}
              >
                <X size={19} />
              </button>
            </div>

            <div className="password-visual">
              <div>
                <LockKeyhole size={25} />
              </div>
              <span>
                Passwords are securely managed by Supabase Authentication.
              </span>
            </div>

            <label className="admin-field">
              <span>New Password *</span>
              <div className="field-shell">
                <KeyRound size={17} />
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label className="admin-field">
              <span>Confirm Password *</span>
              <div className="field-shell">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </div>
            </label>

            {error && (
              <div className="modal-error">
                <X size={16} />
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => {
                  setPasswordOpen(false);
                  setPasswordForm({ password: "", confirmPassword: "" });
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="modal-save password-save"
                disabled={saving}
              >
                {saving ? (
                  "Updating..."
                ) : (
                  <>
                    <KeyRound size={17} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
