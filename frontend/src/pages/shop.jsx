import { useEffect, useMemo, useState } from "react";
import { apiGet, findBestProductMatch, resolveMediaUrl } from "../services/api";
import { products as mockProducts } from "../data/products";
import ProductFilters from "../components/ProductFilters";
import "./dashboard.css";
import "./shop.css";

const Shop = () => {
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    rating: 0,
    category: [],
    sortBy: "newest",
  });
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [products, setProducts] = useState([]);

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
        setSearch("");
        return;
      }

      setSearch(search.trim());
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

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiGet("/admin/products");
        if (response && response.products) {
          // Normalize products from API
          const normalizedProducts = response.products.map((product) => ({
            id: product.id,
            name: product.name || "Unknown",
            description: product.description || "",
            price: parseFloat(product.price) || 0,
            tone: product.tone || "",
            category: product.category || "General",
            images: product.images || [],
            average_rating: Number(product.average_rating || 0),
            review_count: Number(product.review_count || 0),
            stock: parseInt(product.stock) || 0,
          }));
          setProducts(normalizedProducts);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        // Fallback to mock data if API fails
        setProducts(mockProducts);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const applyHashFilter = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#shop")) {
        const query = hash.split("?")[1] || "";
        const params = new URLSearchParams(query);
        const cat = params.get("cat");
        const searchParam = params.get("search");
        if (cat) {
          setFilters((prev) => ({
            ...prev,
            category: [cat],
          }));
        }
        if (searchParam) {
          setSearch(searchParam);
        }
      }
    };

    applyHashFilter();
    window.addEventListener("hashchange", applyHashFilter);
    return () => window.removeEventListener("hashchange", applyHashFilter);
  }, []);

  const handleProductClick = (id) => {
    window.location.hash = `#product/${id}`;
  };

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    let items = products.filter((item) => {
      const normalizedCategory = String(item.category || "")
        .trim()
        .toLowerCase();
      const selectedCategories = filters.category.map((category) =>
        String(category).trim().toLowerCase(),
      );
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(normalizedCategory);
      const matchPrice =
        item.price >= filters.priceMin && item.price <= filters.priceMax;
      const itemRating = Number(
        item.average_rating ?? item.averageRating ?? item.rating ?? 0,
      );
      const matchRating = filters.rating === 0 || itemRating >= filters.rating;
      const matchSearch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.tone.toLowerCase().includes(normalized);
      return matchCategory && matchSearch && matchPrice && matchRating;
    });

    if (filters.sortBy === "price-low") {
      items = [...items].sort((a, b) => a.price - b.price);
    }
    if (filters.sortBy === "price-high") {
      items = [...items].sort((a, b) => b.price - a.price);
    }
    if (filters.sortBy === "rating") {
      items = [...items].sort((a, b) => {
        const aRating = Number(a.average_rating ?? a.averageRating ?? 0);
        const bRating = Number(b.average_rating ?? b.averageRating ?? 0);
        return bRating - aRating;
      });
    }
    if (filters.sortBy === "newest") {
      items = [...items].sort((a, b) => b.id - a.id);
    }

    return items;
  }, [filters, search, products]);

  return (
    <div className="shop-page">
      

      <main className="shop-content">
        <section className="shop-hero">
          <div>
            <p className="shop-eyebrow">Beauty collection</p>
            <h1>Makeup & Skincare</h1>
            <p>
              Clean beauty products with natural tones and nourishing formulas
              for healthy, glowing skin.
            </p>
          </div>
        </section>

        <section className="shop-layout">
          <aside className="shop-sidebar">
            <ProductFilters filters={filters} onFilterChange={setFilters} />
          </aside>

          <div className="shop-results">
            <div className="shop-results-bar">
              <div>
                <strong>{filteredProducts.length}</strong> items
              </div>
              <div className="shop-sort">
                <span>Sort by</span>
                <select
                  value={filters.sortBy}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: event.target.value,
                    }))
                  }
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price low to high</option>
                  <option value="price-high">Price high to low</option>
                  <option value="rating">Highest rated</option>
                </select>
              </div>
            </div>

            <section className="shop-grid">
              {filteredProducts.map((item) => {
                // Helper to fix image URLs
                // Get first image - handle both array and string formats
                let imageUrl = "";
                if (item.images) {
                  if (typeof item.images === "string") {
                    try {
                      const parsed = JSON.parse(item.images);
                      imageUrl = Array.isArray(parsed)
                        ? parsed[0]?.src
                        : parsed?.src;
                    } catch (e) {
                      imageUrl = item.images;
                    }
                  } else if (Array.isArray(item.images)) {
                    imageUrl = item.images[0]?.src;
                  }
                }

                return (
                  <article className="shop-card" key={item.id}>
                    <div
                      className="shop-swatch"
                      style={{
                        backgroundImage: imageUrl
                          ? `url(${resolveMediaUrl(imageUrl)})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="shop-card-body">
                      <div>
                        <h3>{item.name}</h3>
                        <p className="shop-tone">
                          {item.category || "General"}
                        </p>
                      </div>
                      <div className="shop-price">
                        NPR {item.price.toFixed(2)}
                      </div>
                    </div>
                    <button
                      className="shop-button"
                      onClick={() => handleProductClick(item.id)}
                    >
                      View details
                    </button>
                  </article>
                );
              })}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Shop;
