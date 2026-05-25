import React, { useEffect, useState } from "react";
import ProfileMenu from "./ProfileMenu";
import CartIcon from "./CartIcon";
import Footer from "./Footer";
import { apiGet, findBestProductMatch } from "../services/api";
import "../pages/dashboard.css";

const Layout = ({ children }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUsername(parsed.name);
      } catch {}
    }

    apiGet("/admin/products")
      .then((result) => {
        setProducts((result?.products || []).map((p) => ({ id: p.id, name: p.name })) || []);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expires");
    localStorage.removeItem("auth_user");
    window.location.hash = "#";
  };

  const handleSearch = () => {
    if (search.trim()) {
      const product = findBestProductMatch(products, search);
      if (product?.id) {
        window.location.hash = `#product/${product.id}`;
      } else {
        window.location.hash = `#shop?search=${encodeURIComponent(search)}`;
      }
      setSearch("");
    }
  };

  return (
    <div className="app-layout">
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
          Shop
        </a>
        <a href="#consult" className="dashboard-link">
          Book Consultation
        </a>
        <a href="#track" className="dashboard-link">
          Track Order
        </a>
        <a href="#about" className="dashboard-link">
          About Us
        </a>
      </nav>

      <main className="app-content">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
