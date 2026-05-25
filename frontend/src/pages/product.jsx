import { useState, useEffect } from "react";
import { apiGet, findBestProductMatch, resolveMediaUrl } from "../services/api";
import { products as mockProducts } from "../data/products";
import { useCart } from "../context/CartContext";
import ProductReviews from "../components/ProductReviews";
import "./dashboard.css";
import "./product.css";

const ProductDetails = ({ productId }) => {
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { addToCart } = useCart();

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

          // Find the current product
          const found = normalizedProducts.find(
            (item) => item.id === parseInt(productId),
          );
          setCurrentProduct(found || normalizedProducts[0]);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        // Fallback to mock data
        setProducts(mockProducts);
        const found = mockProducts.find(
          (item) => item.id === parseInt(productId),
        );
        setCurrentProduct(found || mockProducts[0]);
      }
    };

    loadProducts();
  }, [productId]);

  if (!currentProduct) return null;
  const product = currentProduct;

  const parseImages = (imagesRaw) => {
    if (!imagesRaw) return [];
    if (typeof imagesRaw === "string") {
      try {
        const p = JSON.parse(imagesRaw);
        return Array.isArray(p) ? p : [p];
      } catch (_) {
        return [{ src: imagesRaw }];
      }
    }
    if (Array.isArray(imagesRaw)) return imagesRaw;
    return [{ src: String(imagesRaw) }];
  };

  const images = parseImages(product.images);

  return (
    <div className="product-page">
      <main className="product-main">
        <section className="product-content">
          <div className="product-left">
            <div className="product-image">
              {images[0] ? (
                <img
                  src={resolveMediaUrl(images[selectedImageIndex]?.src || images[selectedImageIndex])}
                  alt={product.name}
                  className="main-product-image"
                />
              ) : (
                <div className="product-image-placeholder" />
              )}
            </div>
            <div className="product-thumbs">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`product-thumb ${idx === selectedImageIndex ? "active" : ""}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={resolveMediaUrl(img?.src || img)} alt={`${product.name} ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info">
            <p className="product-tone">{product.tone}</p>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
            <div className="product-price">NPR {Number(product.price || 0).toFixed(2)}</div>

            <div className="product-actions">
              <div className="quantity-control">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <input value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))} />
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button
                className="product-primary"
                onClick={() => {
                  addToCart(product, quantity);
                  setAddedMessage("Added to cart!");
                  setTimeout(() => setAddedMessage(""), 2000);
                }}
              >
                Add to cart
              </button>
              {addedMessage && <p className="product-added">{addedMessage}</p>}
            </div>

            <div className="product-details">
              <h3>Details</h3>
              <ul>
                <li>Carefully formulated with natural ingredients</li>
                <li>Suitable for all skin types</li>
                <li>Dermatologist tested and gentle on sensitive skin</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="product-recommend">
          <h2>Pairs well with</h2>
          <div className="recommend-grid">
            {products
              .filter((item) => item.id !== product.id)
              .slice(0, 3)
              .map((item) => {
                let imageUrl = "";
                if (item.images) {
                  if (typeof item.images === "string") {
                    try {
                      const parsed = JSON.parse(item.images);
                      imageUrl = Array.isArray(parsed) ? parsed[0]?.src : parsed?.src || parsed;
                    } catch (e) {
                      imageUrl = item.images;
                    }
                  } else if (Array.isArray(item.images)) {
                    imageUrl = item.images[0]?.src || item.images[0];
                  }
                }

                return (
                  <div className="recommend-card" key={item.id}>
                    <div
                      className="recommend-swatch"
                      style={{
                        backgroundImage: imageUrl ? `url(${resolveMediaUrl(imageUrl)})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div>
                      <h4>{item.name}</h4>
                      <p>NPR {Number(item.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <ProductReviews productId={product.id} />
      </main>
    </div>
  );
};

export default ProductDetails;
