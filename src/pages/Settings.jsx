import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Check,
  ChevronRight,
  Database,
  Globe2,
  LayoutGrid,
  LockKeyhole,
  MonitorCog,
  Moon,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserRound,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const DEFAULT_SETTINGS = {
  notifications: true,
  paymentAlerts: true,
  bookingAlerts: true,
  followUpAlerts: true,
  sound: false,
  compactMode: false,
  confirmDelete: true,
  showStatusColors: true,
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  timezone: "Asia/Kolkata",
};

const STORAGE_KEY = "r-dream-crm-settings";

function readSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("workspace");

  useEffect(() => {
    document.body.classList.toggle(
      "r-dream-compact-mode",
      settings.compactMode
    );

    return () => {
      document.body.classList.remove("r-dream-compact-mode");
    };
  }, [settings.compactMode]);

  const enabledCount = useMemo(
    () =>
      [
        settings.notifications,
        settings.paymentAlerts,
        settings.bookingAlerts,
        settings.followUpAlerts,
        settings.sound,
        settings.confirmDelete,
        settings.showStatusColors,
      ].filter(Boolean).length,
    [settings]
  );

  function update(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Reset all CRM settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function SettingSwitch({ value, onChange }) {
    return (
      <button
        type="button"
        className={`settings-switch ${value ? "on" : ""}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <span />
      </button>
    );
  }

  function SettingRow({
    icon: Icon,
    title,
    description,
    value,
    onChange,
    accent = "blue",
  }) {
    return (
      <div className={`setting-row accent-${accent}`}>
        <div className="setting-row-icon">
          <Icon size={19} />
        </div>

        <div className="setting-row-copy">
          <strong>{title}</strong>
          <span>{description}</span>
        </div>

        <SettingSwitch value={value} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-noise" />
      <div className="settings-orb settings-orb-one" />
      <div className="settings-orb settings-orb-two" />

      <div className="settings-shell">
        <header className="settings-header">
          <div className="settings-title-area">
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="settings-eyebrow">
              <Sparkles size={13} />
              R DREAM CONTROL CENTER
            </div>

            <h1>Settings</h1>

            <p>
              Configure the CRM workspace, alerts, appearance and
              operational preferences from one place.
            </p>
          </div>

          <div className="settings-header-actions">
            <button
              type="button"
              className="settings-reset"
              onClick={resetSettings}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              className="settings-save"
              onClick={saveSettings}
            >
              {saved ? <Check size={17} /> : <Save size={17} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </header>

        <section className="settings-status-strip">
          <div className="settings-status-brand">
            <div className="rd-settings-logo">RD</div>
            <div>
              <strong>R Dream Infra Developers</strong>
              <span>Real Estate CRM Configuration</span>
            </div>
          </div>

          <div className="settings-status-items">
            <div>
              <span className="live-dot" />
              <strong>System Ready</strong>
            </div>

            <div>
              <ShieldCheck size={15} />
              <span>Protected Workspace</span>
            </div>

            <div>
              <SlidersHorizontal size={15} />
              <span>{enabledCount} active preferences</span>
            </div>
          </div>
        </section>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            <div className="settings-sidebar-label">CONTROL CENTER</div>

            <button
              type="button"
              className={activeSection === "workspace" ? "active" : ""}
              onClick={() => setActiveSection("workspace")}
            >
              <LayoutGrid size={18} />
              <span>
                <strong>Workspace</strong>
                <small>CRM behaviour</small>
              </span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className={activeSection === "alerts" ? "active" : ""}
              onClick={() => setActiveSection("alerts")}
            >
              <BellRing size={18} />
              <span>
                <strong>Notifications</strong>
                <small>Alerts & reminders</small>
              </span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className={activeSection === "appearance" ? "active" : ""}
              onClick={() => setActiveSection("appearance")}
            >
              <Palette size={18} />
              <span>
                <strong>Appearance</strong>
                <small>Display preferences</small>
              </span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className={activeSection === "regional" ? "active" : ""}
              onClick={() => setActiveSection("regional")}
            >
              <Globe2 size={18} />
              <span>
                <strong>Regional</strong>
                <small>Currency & dates</small>
              </span>
              <ChevronRight size={16} />
            </button>

            <div className="settings-sidebar-bottom">
              <div className="settings-mini-security">
                <LockKeyhole size={17} />
                <div>
                  <strong>Security</strong>
                  <span>Authentication is handled by Supabase.</span>
                </div>
              </div>

              <button
                type="button"
                className="profile-shortcut"
                onClick={() => navigate("/admin-profile")}
              >
                <UserRound size={17} />
                <span>Open Admin Profile</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </aside>

          <main className="settings-content">
            {activeSection === "workspace" && (
              <section className="settings-section">
                <SectionHeading
                  icon={MonitorCog}
                  eyebrow="WORKSPACE"
                  title="CRM behaviour"
                  description="Control how the R Dream CRM behaves during daily operations."
                />

                <div className="settings-card">
                  <SettingRow
                    icon={ShieldCheck}
                    title="Confirm destructive actions"
                    description="Ask for confirmation before deleting customers, visits or records."
                    value={settings.confirmDelete}
                    onChange={(value) => update("confirmDelete", value)}
                    accent="gold"
                  />

                  <SettingRow
                    icon={Palette}
                    title="Status colour system"
                    description="Keep Available, Booked and Sold status colours visible across the CRM."
                    value={settings.showStatusColors}
                    onChange={(value) => update("showStatusColors", value)}
                    accent="green"
                  />

                  <SettingRow
                    icon={LayoutGrid}
                    title="Compact workspace"
                    description="Reduce spacing in CRM components for a denser desktop workspace."
                    value={settings.compactMode}
                    onChange={(value) => update("compactMode", value)}
                    accent="purple"
                  />
                </div>

                <div className="settings-feature-grid">
                  <FeatureCard
                    icon={Database}
                    label="DATA"
                    title="Supabase Connected"
                    description="Your CRM data continues to use the existing Supabase backend."
                  />

                  <FeatureCard
                    icon={ShieldCheck}
                    label="ACCESS"
                    title="Protected Session"
                    description="Administrator authentication remains managed by Supabase Auth."
                  />

                  <FeatureCard
                    icon={LayoutGrid}
                    label="LAYOUT"
                    title="R Dream Workspace"
                    description="Settings are stored locally so your interface preferences persist."
                  />
                </div>
              </section>
            )}

            {activeSection === "alerts" && (
              <section className="settings-section">
                <SectionHeading
                  icon={BellRing}
                  eyebrow="NOTIFICATIONS"
                  title="Alerts & reminders"
                  description="Choose which CRM events should be surfaced to you."
                />

                <div className="settings-card">
                  <SettingRow
                    icon={Bell}
                    title="CRM notifications"
                    description="Master switch for in-app CRM notification preferences."
                    value={settings.notifications}
                    onChange={(value) => update("notifications", value)}
                    accent="blue"
                  />

                  <SettingRow
                    icon={Database}
                    title="Payment alerts"
                    description="Receive attention prompts for payment-related activity."
                    value={settings.paymentAlerts}
                    onChange={(value) => update("paymentAlerts", value)}
                    accent="green"
                  />

                  <SettingRow
                    icon={LayoutGrid}
                    title="Booking alerts"
                    description="Highlight important booking activity in the workspace."
                    value={settings.bookingAlerts}
                    onChange={(value) => update("bookingAlerts", value)}
                    accent="gold"
                  />

                  <SettingRow
                    icon={BellRing}
                    title="Follow-up reminders"
                    description="Keep pending customer follow-ups visible and actionable."
                    value={settings.followUpAlerts}
                    onChange={(value) => update("followUpAlerts", value)}
                    accent="purple"
                  />

                  <SettingRow
                    icon={Volume2}
                    title="Notification sound"
                    description="Enable a browser sound when supported notifications appear."
                    value={settings.sound}
                    onChange={(value) => update("sound", value)}
                    accent="red"
                  />
                </div>

                <div className="notification-preview">
                  <div className="preview-icon">
                    <BellRing size={21} />
                  </div>
                  <div>
                    <span>NOTIFICATION PREVIEW</span>
                    <strong>Payment activity detected</strong>
                    <p>
                      Your notification preferences are ready for the CRM
                      alert system.
                    </p>
                  </div>
                  <span className="preview-time">NOW</span>
                </div>
              </section>
            )}

            {activeSection === "appearance" && (
              <section className="settings-section">
                <SectionHeading
                  icon={Palette}
                  eyebrow="APPEARANCE"
                  title="Display preferences"
                  description="Personalize how the CRM workspace feels on your screen."
                />

                <div className="appearance-card">
                  <div className="appearance-preview">
                    <div className="preview-top">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="preview-body">
                      <div className="preview-sidebar">
                        <b>RD</b>
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="preview-main">
                        <div className="preview-heading" />
                        <div className="preview-cards">
                          <i />
                          <i />
                          <i />
                        </div>
                        <div className="preview-table">
                          <i />
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="appearance-copy">
                    <span className="settings-eyebrow small">
                      CURRENT THEME
                    </span>
                    <h3>Midnight Command</h3>
                    <p>
                      A focused dark interface designed for long CRM
                      sessions, dashboards and operational work.
                    </p>

                    <div className="theme-chip">
                      <Moon size={15} />
                      Dark workspace
                    </div>

                    <div className="theme-chip disabled">
                      <Sun size={15} />
                      Light mode
                      <span>Coming later</span>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <SettingRow
                    icon={LayoutGrid}
                    title="Compact workspace"
                    description="Use tighter spacing throughout the CRM interface."
                    value={settings.compactMode}
                    onChange={(value) => update("compactMode", value)}
                    accent="purple"
                  />
                </div>
              </section>
            )}

            {activeSection === "regional" && (
              <section className="settings-section">
                <SectionHeading
                  icon={Globe2}
                  eyebrow="REGIONAL"
                  title="Regional preferences"
                  description="Set the formatting used when information is displayed."
                />

                <div className="regional-grid">
                  <label className="select-setting">
                    <span>Currency</span>
                    <small>Used for CRM financial displays.</small>
                    <select
                      value={settings.currency}
                      onChange={(event) =>
                        update("currency", event.target.value)
                      }
                    >
                      <option value="INR">₹ INR — Indian Rupee</option>
                      <option value="USD">$ USD — US Dollar</option>
                      <option value="AED">د.إ AED — UAE Dirham</option>
                    </select>
                  </label>

                  <label className="select-setting">
                    <span>Date format</span>
                    <small>Used for operational dates.</small>
                    <select
                      value={settings.dateFormat}
                      onChange={(event) =>
                        update("dateFormat", event.target.value)
                      }
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </label>

                  <label className="select-setting wide">
                    <span>Time zone</span>
                    <small>Default operational time zone for this CRM.</small>
                    <select
                      value={settings.timezone}
                      onChange={(event) =>
                        update("timezone", event.target.value)
                      }
                    >
                      <option value="Asia/Kolkata">
                        Asia/Kolkata — India Standard Time
                      </option>
                      <option value="Asia/Dubai">
                        Asia/Dubai — Gulf Standard Time
                      </option>
                      <option value="UTC">UTC — Coordinated Universal Time</option>
                    </select>
                  </label>
                </div>

                <div className="regional-note">
                  <Globe2 size={19} />
                  <div>
                    <strong>Regional settings are interface preferences.</strong>
                    <span>
                      They do not modify the original values stored in your
                      Supabase database.
                    </span>
                  </div>
                </div>
              </section>
            )}

            <footer className="settings-footer">
              <div>
                <span className="footer-status-dot" />
                <span>R Dream CRM Settings</span>
              </div>

              <span>Local preferences • Secure authentication • Supabase</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="settings-section-heading">
      <div className="section-heading-icon">
        <Icon size={21} />
      </div>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, label, title, description }) {
  return (
    <article className="settings-feature-card">
      <div className="feature-card-icon">
        <Icon size={18} />
      </div>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </article>
  );
}

export default Settings;
