import { useEffect, useState } from "react";
import { apiGet, findBestProductMatch } from "../services/api";
import { products as mockProducts } from "../data/products";
import "./dashboard.css";

const Dashboard = () => {
  const [username, setUsername] = useState("Guest");
  const [role, setRole] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [trackOrderId, setTrackOrderId] = useState("");
  const [products, setProducts] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    storeName: "BEIGE",
    freeShippingThreshold: "3000",
  });

  const isAdmin = String(role || "").toLowerCase() === "admin";

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const product = findBestProductMatch(products, searchQuery);
    if (product?.id) {
      window.location.hash = `#product/${product.id}`;
    } else {
      window.location.hash = `#shop?search=${encodeURIComponent(searchQuery)}`;
    }
    setSearchQuery("");
  };

  const handleTrackOrder = () => {
    if (trackOrderId.trim()) {
      window.location.hash = `#track?order=${encodeURIComponent(trackOrderId)}`;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    const authToken = localStorage.getItem("auth_token");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUsername(parsed.name);
        if (parsed?.role) setRole(parsed.role);
      } catch {
        // ignore bad cache payloads
      }
    }

    if (authToken) {
      apiGet("/auth/me")
        .then((result) => {
          if (result?.user?.name) {
            setUsername(result.user.name);
            localStorage.setItem("auth_user", JSON.stringify(result.user));
          }
          if (result?.user?.role) {
            setRole(result.user.role);
          }
        })
        .catch(() => {});
    }

    apiGet("/admin/products")
      .then((result) => {
        const normalizedProducts = (result?.products || []).map((product) => ({
          id: product.id,
          name: product.name || "Unknown",
          price: product.price || 0,
        }));
        setProducts(normalizedProducts.length ? normalizedProducts : mockProducts);
      })
      .catch(() => setProducts(mockProducts));

    apiGet("/admin/settings")
      .then((result) => {
        if (result?.settings) {
          setStoreSettings((prev) => ({ ...prev, ...result.settings }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-eyebrow">Updated experience</p>
            <h1>{storeSettings.storeName || "BEIGE"} Beauty Studio</h1>
            <p>
              Shop products, book consultations, track orders, and manage your
              account from one refreshed home base.
            </p>
            <div className="dashboard-cta">
              <button
                className="dashboard-primary"
                onClick={() => (window.location.hash = "#shop")}
              >
                Shop now
              </button>
              <button
                className="dashboard-secondary"
                onClick={() => (window.location.hash = "#consult")}
              >
                Book consultation
              </button>
              <button
                className="dashboard-tertiary"
                onClick={() => (window.location.hash = "#account")}
              >
                Open account
              </button>
            </div>
          </div>

          <div className="dashboard-hero-panel">
            <div className="dashboard-hero-card">
              <span>What&apos;s new</span>
              <strong>
                Consultations, order tracking, exports, and account tools in one
                place
              </strong>
            </div>
            <div className="dashboard-hero-card">
              <span>Free shipping</span>
              <strong>
                On orders over NPR{" "}
                {Number(storeSettings.freeShippingThreshold || 3000).toFixed(2)}
              </strong>
            </div>
            <div className="dashboard-hero-card">
              <span>Support flow</span>
              <strong>Book, follow up, and manage sessions faster</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-strip">
          <p>Welcome back, {username}. Your next order is one click away.</p>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-stats">
            <h2>Quick overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Orders</h3>
                <p>03</p>
              </div>
              <div className="stat-card">
                <h3>Saved items</h3>
                <p>12</p>
              </div>
              <div className="stat-card">
                <h3>Saved</h3>
                <p>08</p>
              </div>
              <div className="stat-card">
                <h3>Track order</h3>
                <p>1 active</p>
              </div>
            </div>
          </div>

          <div className="dashboard-track">
            <h2>Track your order</h2>
            <p>Enter your order ID to check its delivery status.</p>
            <div className="track-form">
              <input
                type="text"
                placeholder="Order ID"
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTrackOrder()}
              />
              <button onClick={handleTrackOrder}>Track</button>
            </div>
            <div className="track-summary">
              <span>Last order</span>
              <strong>#BEIGE-4812 · Out for delivery</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-collections">
          <h2>Featured collections</h2>
          <div className="collection-grid">
            <div
              className="collection-card"
              onClick={() => (window.location.hash = "#shop?cat=Serums")}
              style={{ cursor: "pointer" }}
            >
              <h3>Skin Prep</h3>
              <p>Cleansers, serums, and moisturizers for daily care.</p>
            </div>
            <div
              className="collection-card"
              onClick={() => (window.location.hash = "#shop?cat=Foundation")}
              style={{ cursor: "pointer" }}
            >
              <h3>Base Essentials</h3>
              <p>Foundation-focused picks for a smooth, natural finish.</p>
            </div>
            <div
              className="collection-card"
              onClick={() => (window.location.hash = "#shop?cat=Lips")}
              style={{ cursor: "pointer" }}
            >
              <h3>Color Edit</h3>
              <p>Blush, lips, and soft color accents for everyday wear.</p>
            </div>
            <div
              className="collection-card"
              onClick={() => (window.location.hash = "#shop?cat=Eyes")}
              style={{ cursor: "pointer" }}
            >
              <h3>Eye &amp; Night Care</h3>
              <p>Eye cream and night formulas for recovery and glow.</p>
            </div>
          </div>
        </section>

        <section className="dashboard-carousel">
          <h2>New Arrivals</h2>
          <div className="carousel-track">
            {(products.length > 0 ? [...products] : [...mockProducts])
              .sort((a, b) => Number(b.id) - Number(a.id))
              .slice(0, 4)
              .map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => (window.location.hash = `#product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-swatch" />
                  <h4>{product.name}</h4>
                  <p>NPR {Number(product.price || 0).toFixed(2)}</p>
                </div>
              ))}
          </div>
        </section>

        <section className="dashboard-editorial">
          <div>
            <h2>Skincare tips for natural beauty</h2>
            <p>
              Learn the best practices for layering products, choosing the right
              shades for your skin tone, and maintaining a healthy glow.
            </p>
          </div>
          <button
            className="dashboard-secondary"
            onClick={() => (window.location.hash = "#about")}
          >
            Read the story
          </button>
        </section>

        {isAdmin && (
          <section className="dashboard-editorial">
            <div>
              <h2>Admin access</h2>
              <p>Open the admin console to manage products, consultations, and settings.</p>
            </div>
            <button
              className="dashboard-primary"
              onClick={() => (window.location.hash = "#admin")}
            >
              Go to admin
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
