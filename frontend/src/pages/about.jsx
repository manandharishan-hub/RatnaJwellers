import "./about.css";
import { useState, useEffect } from "react";
import { apiGet, findBestProductMatch } from "../services/api";
import { products as mockProducts } from "../data/products";

const About = () => {
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    storeName: "BEIGE",
    aboutUs:
      "Discover the story behind BEIGE—where conscious beauty meets timeless elegance.",
    storeEmail: "info@beige.com",
    storePhone: "",
    storeAddress: "",
  });

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
        const normalizedProducts = (result?.products || []).map((product) => ({
          id: product.id,
          name: product.name || "Unknown",
          tone: product.tone || "",
          category: product.category || "General",
        }));
        setProducts(normalizedProducts.length > 0 ? normalizedProducts : mockProducts);
      })
      .catch(() => setProducts(mockProducts));

    apiGet("/admin/settings").then((result) => {
      if (result?.settings) {
        setStoreSettings((prev) => ({ ...prev, ...result.settings }));
      }
    }).catch(() => {});
  }, []);

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
    <div className="about-page">
      <main className="about-content">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-text">
            <h1>About {storeSettings.storeName || "BEIGE"}</h1>
            <p>{storeSettings.aboutUs}</p>
          </div>
        </section>

        {/* ... rest of content unchanged ... */}
        <section className="about-story">
          <div className="about-container">
            <div className="story-text">
              <h2>Store Details</h2>
              <p>{storeSettings.storeEmail}</p>
              <p>{storeSettings.storePhone}</p>
              <p>{storeSettings.storeAddress}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
