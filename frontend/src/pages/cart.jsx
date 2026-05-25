import { useCart } from "../context/CartContext";
import "./cart.css";
import { useState, useEffect } from "react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal } = useCart();
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [search, setSearch] = useState("");

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

  const subtotal = getSubtotal();
  const shipping = subtotal > 120 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-page">
      

      <main className="cart-content">
        <section className="cart-header">
          <h1>Your Cart</h1>
          <p>{cartItems.length} items</p>
        </section>

        {cartItems.length === 0 ? (
          <section className="cart-empty">
            <div className="empty-state">
              <p className="empty-icon">🛍️</p>
              <h2>Your cart is empty</h2>
              <p>Start shopping to add items to your cart</p>
              <a href="#shop" className="cart-cta">
                Continue Shopping
              </a>
            </div>
          </section>
        ) : (
          <section className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="item-swatch" />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                  </div>
                  <div className="item-quantity">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value) || 1)
                      }
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-price">
                    NPR {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="item-remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>NPR {subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>NPR {tax.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="free">Free</span>
                  ) : (
                    `NPR ${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {shipping > 0 && (
                <p className="shipping-note">
                  Free shipping on orders over NPR 3000
                </p>
              )}

              <div className="summary-total">
                <span>Total</span>
                <span>NPR {total.toFixed(2)}</span>
              </div>

              <a href="#checkout" className="checkout-button">
                Proceed to Checkout
              </a>

              <a href="#shop" className="continue-shopping">
                Continue Shopping
              </a>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
};

export default Cart;
