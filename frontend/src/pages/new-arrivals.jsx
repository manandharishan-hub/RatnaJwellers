import { useState, useEffect } from "react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import CartIcon from "../components/CartIcon";
import Footer from "../components/Footer";
import ProfileMenu from "../components/ProfileMenu";
import "./new-arrivals.css";
import "./dashboard.css";

const NewArrivals = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const { addToCart } = useCart();

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

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.name) {
        setUsername(parsed.name);
      }
    }
  }, []);

  // Get newest products (sorted by ID in reverse for newest)
  const newestProducts = [...products].slice(0, 8);

  return (
    <div className="new-arrivals-page">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-brand">
            <div className="dashboard-title">BEIGE</div>
            <div className="dashboard-subtitle">By Monica</div>
            <div className="dashboard-rule" />
          </div>
          <div className="dashboard-actions">
            <ProfileMenu
              username={username}
              showProfile={showProfile}
              setShowProfile={setShowProfile}
              onLogout={handleLogout}
            />
            <CartIcon />
          </div>
        </div>
      </header>

      <div className="dashboard-search-section">
        <div className="dashboard-search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="dashboard-search-input-large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="dashboard-search-btn-large" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <nav className="dashboard-nav">
        <a href="#dashboard" className="dashboard-link">
          Home
        </a>
        <a href="#shop" className="dashboard-link">
          Shop ▾
        </a>
        <a href="#new" className="dashboard-link active">
          New Arrivals
        </a>
        <a href="#track" className="dashboard-link">
          Track Order
        </a>
        <a href="#about" className="dashboard-link">
          About Us
        </a>
      </nav>

      <main className="new-arrivals-content">
        <div className="new-arrivals-breadcrumb">
          <a href="#dashboard" className="breadcrumb-link">
            Home
          </a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">New Arrivals</span>
        </div>

        <section className="new-arrivals-header">
          <h1>New Arrivals</h1>
          <p>Discover our latest collection of premium beauty products</p>
        </section>

        <section className="new-arrivals-grid">
          {newestProducts.map((product) => (
            <div key={product.id} className="new-arrival-card">
              <div className="arrival-image-container">
                <div className="arrival-image" />
                <span className="new-badge">NEW</span>
              </div>
              <div className="arrival-info">
                <p className="arrival-tone">{product.tone}</p>
                <h3>{product.name}</h3>
                <p className="arrival-description">{product.description}</p>
                <div className="arrival-footer">
                  <span className="arrival-price">
                    NPR {product.price.toFixed(2)}
                  </span>
                  <button
                    className="arrival-add-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewArrivals;
