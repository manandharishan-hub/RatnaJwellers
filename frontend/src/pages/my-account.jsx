import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost, openDynamicJoinUrl } from "../services/api";
import ConnectionStatus from "../components/ConnectionStatus";
import { consultationAPI } from "../services/consultationApi";
import "./dashboard.css";
import "./my-account.css";

const STATUS_COLORS = {
  Confirmed: "#166534",
  Pending: "#92400e",
  Completed: "#1e40af",
  Cancelled: "#991b1b",
  Rescheduled: "#5b21b6",
  Shipped: "#1d4ed8",
  Delivered: "#166534",
  Processing: "#92400e",
  Returned: "#991b1b",
};

const MyAccount = () => {
  const [tab, setTab] = useState("profile");
  const [username, setUsername] = useState("Guest");
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");

  // Profile
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Consultations
  const [consultations, setConsultations] = useState([]);
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultError, setConsultError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expires");
    localStorage.removeItem("auth_user");
    window.location.hash = "#";
  };

  const handleSearch = () => {
    if (search.trim()) {
      window.location.hash = `#shop?search=${encodeURIComponent(search)}`;
      setSearch("");
    }
  };

  // Load user profile on mount
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    const authToken = localStorage.getItem("auth_token");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.name) setUsername(parsed.name);
      setProfileForm({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
      });
    }

    if (authToken) {
      apiGet("/auth/me")
        .then((result) => {
          if (result?.user) {
            const u = result.user;
            setUsername(u.name || "Guest");
            setProfileForm({
              name: u.name || "",
              email: u.email || "",
              phone: u.phone || "",
            });
            localStorage.setItem("auth_user", JSON.stringify(u));
          }
        })
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    } else {
      setProfileLoading(false);
    }
  }, []);

  // Load data for sub-tabs
  useEffect(() => {
    if (tab === "orders") loadOrders();
    if (tab === "consultations") loadConsultations();
  }, [tab]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const stored = localStorage.getItem("auth_user");
      const email = stored ? JSON.parse(stored)?.email : null;
      const url = email
        ? `/user/orders?email=${encodeURIComponent(email)}`
        : "/user/orders";
      const data = await apiGet(url);
      setOrders(data.orders || []);
    } catch (err) {
      setOrdersError(err.message || "Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadConsultations = async () => {
    try {
      const data = await consultationAPI.mine();
      setConsultations(data.appointments || []);
    } catch (err) {
      setConsultError(err.message || "Failed to load consultations.");
    } finally {
      setConsultLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.name || !profileForm.email) {
      setProfileError("Name and email are required.");
      return;
    }
    try {
      const data = await apiPut("/auth/profile", profileForm);
      setProfileSuccess(data.message || "Profile updated!");
      setUsername(data.user?.name || profileForm.name);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      const data = await apiPost("/auth/change-password", pwForm);
      setPwSuccess(data.message || "Password changed!");
      setPwForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleCancelConsultation = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await consultationAPI.cancel(id);
      await loadConsultations();
    } catch (err) {
      setConsultError(err.message || "Failed to cancel.");
    }
  };

  return (
    <div className="dashboard">
      <ConnectionStatus />
      <main className="account-main">
        <section className="account-hero">
          <p className="account-eyebrow">Account center</p>
          <h1>My Account</h1>
          <p>Manage your profile, orders, and consultations in one place.</p>
        </section>

        <div className="account-container">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="account-avatar">
              <div className="avatar-circle">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="account-name">{username}</div>
            </div>
            <nav className="account-nav">
              {[
                { key: "profile", icon: "👤", label: "My Profile" },
                { key: "password", icon: "🔒", label: "Change Password" },
                { key: "orders", icon: "📦", label: "My Orders" },
                { key: "consultations", icon: "🧑‍⚕️", label: "My Appointments" },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`account-nav-item ${tab === key ? "active" : ""}`}
                  onClick={() => setTab(key)}
                >
                  {icon} {label}
                </button>
              ))}
              <hr className="account-nav-divider" />
              <button
                className="account-nav-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="account-content">
            {/* Profile Tab */}
            {tab === "profile" && (
              <section className="account-section">
                <h2>My Profile</h2>
                {profileLoading ? (
                  <p className="account-hint">Loading profile...</p>
                ) : (
                  <form className="account-form" onSubmit={handleSaveProfile}>
                    <div className="account-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="account-form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="account-form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+977 98XXXXXXXX"
                      />
                    </div>
                    {profileError && (
                      <p className="account-error">{profileError}</p>
                    )}
                    {profileSuccess && (
                      <p className="account-success">{profileSuccess}</p>
                    )}
                    <button type="submit" className="account-btn">
                      Save Changes
                    </button>
                  </form>
                )}
              </section>
            )}

            {/* Change Password Tab */}
            {tab === "password" && (
              <section className="account-section">
                <h2>Change Password</h2>
                <form className="account-form" onSubmit={handleChangePassword}>
                  <div className="account-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={pwForm.current_password}
                      onChange={(e) =>
                        setPwForm((p) => ({
                          ...p,
                          current_password: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="account-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={pwForm.new_password}
                      onChange={(e) =>
                        setPwForm((p) => ({
                          ...p,
                          new_password: e.target.value,
                        }))
                      }
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="account-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={pwForm.new_password_confirmation}
                      onChange={(e) =>
                        setPwForm((p) => ({
                          ...p,
                          new_password_confirmation: e.target.value,
                        }))
                      }
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                  {pwError && <p className="account-error">{pwError}</p>}
                  {pwSuccess && <p className="account-success">{pwSuccess}</p>}
                  <button
                    type="submit"
                    className="account-btn"
                    disabled={pwLoading}
                  >
                    {pwLoading ? "Updating..." : "Change Password"}
                  </button>
                </form>
              </section>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <section className="account-section">
                <h2>My Orders</h2>
                {ordersLoading && (
                  <p className="account-hint">Loading orders...</p>
                )}
                {ordersError && <p className="account-error">{ordersError}</p>}
                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <p className="account-hint">
                    You haven&apos;t placed any orders yet.
                  </p>
                )}
                {orders.map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">
                          #{order.order_number || order.id}
                        </span>
                        <span className="order-date">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : order.date || ""}
                        </span>
                      </div>
                      <div className="order-status-group">
                        <span
                          className="order-status-badge"
                          style={{
                            background:
                              STATUS_COLORS[order.status] || "#6b4f35",
                          }}
                        >
                          {order.status}
                        </span>
                        <button
                          className="order-track-btn"
                          onClick={() =>
                            (window.location.hash = `#track?order=${order.order_number || order.id}`)
                          }
                        >
                          Track
                        </button>
                      </div>
                    </div>
                    <div className="order-items-list">
                      {(order.items || []).map((item, idx) => (
                        <div className="order-item-row" key={idx}>
                          <span className="order-item-name">
                            {item.product_name || item.product || item.name}
                          </span>
                          <span className="order-item-qty">
                            × {item.quantity || item.qty || 1}
                          </span>
                          <span className="order-item-price">
                            NPR{" "}
                            {Number(item.price || item.subtotal || 0).toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="order-card-footer">
                      <span>
                        Total:{" "}
                        <strong>
                          NPR {Number(order.total || 0).toFixed(2)}
                        </strong>
                      </span>
                      <span className="order-payment-status">
                        {order.payment_status || ""}
                      </span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Consultations Tab */}
            {tab === "consultations" && (
              <section className="account-section">
                <h2>My Appointments</h2>
                {consultLoading && (
                  <p className="account-hint">Loading appointments...</p>
                )}
                {consultError && (
                  <p className="account-error">{consultError}</p>
                )}
                {!consultLoading &&
                  !consultError &&
                  consultations.length === 0 && (
                    <div className="account-empty">
                      <p>No appointments booked yet.</p>
                      <button
                        className="account-btn"
                        onClick={() => (window.location.hash = "#consult")}
                      >
                        Book an Appointment
                      </button>
                    </div>
                  )}
                {consultations.map((appt) => (
                  <div className="consult-card" key={appt.id}>
                    <div className="consult-card-header">
                      <div>
                        <h3>{appt.service?.name}</h3>
                        <p className="consult-meta">
                          Expert: <strong>{appt.expert?.name}</strong>
                        </p>
                        <p className="consult-meta">
                          {appt.appointment_date} at {appt.appointment_time} ·{" "}
                          {appt.consultation_mode}
                        </p>
                        {appt.room_id && (
                          <p className="consult-meta">
                            Room ID: <code>{appt.room_id}</code>
                          </p>
                        )}
                      </div>
                      <span
                        className="order-status-badge"
                        style={{
                          background: STATUS_COLORS[appt.status] || "#6b4f35",
                        }}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <div className="consult-actions">
                      {appt.join_url &&
                        appt.status !== "Completed" &&
                        appt.status !== "Cancelled" && (
                          <button
                            className="account-btn"
                            onClick={() =>
                              openDynamicJoinUrl(
                                appt.join_url,
                                appt.join_url_candidates || [],
                              )
                            }
                          >
                            Join Session
                          </button>
                        )}
                      {(appt.status === "Confirmed" ||
                        appt.status === "Pending" ||
                        appt.status === "Rescheduled") && (
                        <button
                          className="account-btn-outline"
                          onClick={() => handleCancelConsultation(appt.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {appt.consultation_notes && (
                      <div className="consult-notes">
                        <strong>Expert Notes:</strong>
                        <p>{appt.consultation_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAccount;
