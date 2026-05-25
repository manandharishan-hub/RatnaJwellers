import { useState, useEffect } from "react";
import { apiGet, API_BASE } from "../services/api";
import "./track-order.css";
import "./dashboard.css";

const TrackOrder = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [userOrders, setUserOrders] = useState([]);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authUser, setAuthUser] = useState(null);

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

  // Helper to normalize order data
  const normalizeOrder = (order) => {
    return {
      id: order.id || order.order_id,
      order_number: order.order_number || order.orderId || `#${order.id}`,
      customer_name: order.customer_name || order.customer || username,
      customer_email:
        order.customer_email || order.email || authUser?.email || "",
      customer_phone: order.customer_phone || order.phone || "",
      shipping_address: order.shipping_address || order.address || "",
      subtotal: parseFloat(order.subtotal) || 0,
      tax: parseFloat(order.tax) || 0,
      shipping_cost: parseFloat(order.shipping_cost) || 0,
      total: parseFloat(order.total) || 0,
      status: order.status || "Processing",
      items: Array.isArray(order.items) ? order.items : [],
      created_at: order.created_at || order.created || new Date().toISOString(),
      date:
        order.date ||
        (order.created_at
          ? order.created_at.split("T")[0]
          : new Date().toISOString().split("T")[0]),
    };
  };

  const handleTrackOrder = () => {
    if (trackingId.trim()) {
      // Search in user orders
      const found = userOrders.find(
        (order) =>
          order.order_number === trackingId ||
          order.order_number === `#${trackingId}` ||
          String(order.id) === trackingId,
      );

      if (found) {
        setTrackingInfo(found);
        setSearched(true);
      } else {
        setTrackingInfo(null);
        setSearched(true);
      }
    }
  };

  // Load user orders on mount
  useEffect(() => {
    const loadUserOrders = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("auth_user");
        let userEmail = null;

        if (stored) {
          const parsed = JSON.parse(stored);
          setAuthUser(parsed);
          userEmail = parsed?.email;
          if (parsed?.name) {
            setUsername(parsed.name);
          }
        }

        console.log("🔍 Loading orders for user:", userEmail);

        // Try to fetch orders from API - filtered by user email or ID
        try {
          const apiUrl = userEmail
            ? `/user/orders?email=${encodeURIComponent(userEmail)}`
            : "/user/orders";

          const ordersResponse = await apiGet(apiUrl);
          console.log("📥 API Response:", ordersResponse);

          if (ordersResponse && Array.isArray(ordersResponse)) {
            const normalized = ordersResponse.map(normalizeOrder);
            console.log("✅ Orders from API (array):", normalized);
            setUserOrders(normalized);
            return;
          } else if (
            ordersResponse?.orders &&
            Array.isArray(ordersResponse.orders)
          ) {
            const normalized = ordersResponse.orders.map(normalizeOrder);
            console.log("✅ Orders from API (object):", normalized);
            setUserOrders(normalized);
            return;
          }
        } catch (apiErr) {
          console.warn("⚠️ API failed, trying localStorage:", apiErr.message);
        }

        // Fallback: Load orders from localStorage (from checkout)
        console.log("📦 Trying localStorage fallback...");
        const storedOrders = localStorage.getItem("user_orders");
        console.log("📦 localStorage user_orders:", storedOrders);

        if (storedOrders) {
          try {
            const orders = JSON.parse(storedOrders);
            if (Array.isArray(orders)) {
              const normalized = orders.map(normalizeOrder);
              console.log("✅ Orders from localStorage:", normalized);
              setUserOrders(normalized);
            }
          } catch (e) {
            console.error("❌ Failed to parse stored orders:", e);
          }
        } else {
          console.log("⚠️ No orders in localStorage");
          setUserOrders([]);
        }
      } catch (err) {
        console.error("❌ Error loading orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadUserOrders();
  }, []);

  return (
    <div className="track-order-page">
      <main className="track-order-content">
        <div className="track-order-breadcrumb">
          <a href="#dashboard" className="breadcrumb-link">
            Home
          </a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Track Order</span>
        </div>

        <section className="track-order-header">
          <h1>My Orders</h1>
          <p>View and track all your orders</p>
        </section>

        {loading ? (
          <div className="loading-message">
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : userOrders.length > 0 ? (
          <>
            <section className="track-order-search">
              <div className="track-search-box">
                <input
                  type="text"
                  placeholder="Search by Order ID (e.g., BEIGE-4812 or #123)"
                  className="track-search-input"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTrackOrder()}
                />
                <button className="track-search-btn" onClick={handleTrackOrder}>
                  Search
                </button>
              </div>
            </section>

            {searched && trackingInfo ? (
              <section className="track-order-results">
                <div className="track-order-card">
                  <div className="track-header">
                    <div className="track-id-section">
                      <span className="track-label">Order ID</span>
                      <span className="track-value">
                        {trackingInfo.order_number}
                      </span>
                    </div>
                    <div className="track-status-section">
                      <span
                        className="track-status-badge"
                        data-status={trackingInfo.status?.toLowerCase()}
                      >
                        {trackingInfo.status}
                      </span>
                    </div>
                  </div>

                  <div className="track-timeline">
                    <div className="timeline-event completed">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h4>Order Confirmed</h4>
                        <p>{trackingInfo.date}</p>
                      </div>
                    </div>
                    {trackingInfo.status === "Shipped" ||
                    trackingInfo.status === "Delivered" ? (
                      <>
                        <div className="timeline-event completed">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <h4>Processing</h4>
                            <p>Order is being prepared</p>
                          </div>
                        </div>
                        <div
                          className={`timeline-event ${trackingInfo.status === "Delivered" ? "completed" : ""}`}
                        >
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <h4>Shipped</h4>
                            <p>On the way to you</p>
                          </div>
                        </div>
                        {trackingInfo.status === "Delivered" && (
                          <div className="timeline-event completed">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <h4>Delivered</h4>
                              <p>Order delivered</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="timeline-event">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <h4>Processing</h4>
                          <p>Order is being prepared</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="track-details">
                    <div className="detail-box">
                      <h3>Shipping To</h3>
                      <p>{trackingInfo.shipping_address || "N/A"}</p>
                    </div>
                    <div className="detail-box">
                      <h3>Contact Info</h3>
                      <p>{trackingInfo.customer_email}</p>
                      {trackingInfo.customer_phone && (
                        <p>{trackingInfo.customer_phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="track-items">
                    <h3>Order Items</h3>
                    <div className="items-list">
                      {trackingInfo.items && trackingInfo.items.length > 0 ? (
                        trackingInfo.items.map((item, idx) => {
                          const itemPrice = parseFloat(
                            item.unit_price || item.price || 0,
                          );
                          const itemQty = parseInt(
                            item.quantity || item.qty || 0,
                          );
                          const itemName =
                            item.product_name || item.product || "Unknown";
                          return (
                            <div key={idx} className="item-row">
                              <span>{itemName}</span>
                              <span>x{itemQty}</span>
                              <span>NPR {itemPrice.toFixed(2)}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="item-row">
                          <span colSpan="3">No items in this order</span>
                        </div>
                      )}
                    </div>
                    <div className="items-total">
                      <div>
                        <strong>Subtotal:</strong>{" "}
                        <span>NPR {trackingInfo.subtotal.toFixed(2)}</span>
                      </div>
                      <div>
                        <strong>Tax:</strong>{" "}
                        <span>NPR {trackingInfo.tax.toFixed(2)}</span>
                      </div>
                      <div>
                        <strong>Shipping:</strong>{" "}
                        <span>NPR {trackingInfo.shipping_cost.toFixed(2)}</span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <strong>Total:</strong>{" "}
                        <span>NPR {trackingInfo.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    <button
                      className="track-search-btn"
                      onClick={() => {
                        setSearched(false);
                        setTrackingId("");
                        setTrackingInfo(null);
                      }}
                    >
                      Back to Orders
                    </button>
                  </div>
                </div>
              </section>
            ) : searched && !trackingInfo ? (
              <section className="track-order-empty">
                <div className="empty-message">
                  <p>No order found with ID: {trackingId}</p>
                  <p>Please check your order ID and try again</p>
                  <button
                    className="track-search-btn"
                    onClick={() => setSearched(false)}
                    style={{ marginTop: "20px" }}
                  >
                    View All Orders
                  </button>
                </div>
              </section>
            ) : (
              <section className="orders-list">
                <h2>Your Orders ({userOrders.length})</h2>
                <div className="orders-grid">
                  {userOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <span className="order-number">
                            {order.order_number}
                          </span>
                          <span
                            className={`order-status status-${order.status?.toLowerCase()}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span className="order-date">{order.date}</span>
                      </div>
                      <div className="order-card-body">
                        <div className="order-items-summary">
                          <span>{order.items?.length || 0} item(s)</span>
                        </div>
                        <div className="order-total">
                          <span className="label">Total:</span>
                          <span className="amount">
                            NPR {order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="order-card-footer">
                        <button
                          className="track-search-btn"
                          onClick={() => {
                            setTrackingInfo(order);
                            setSearched(true);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="track-order-empty">
            <div className="empty-message">
              <p>You don't have any orders yet</p>
              <p>Start shopping to see your orders here</p>
              <a
                href="#shop"
                className="track-search-btn"
                style={{ display: "inline-block", marginTop: "20px" }}
              >
                Continue Shopping
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TrackOrder;
