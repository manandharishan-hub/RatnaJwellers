import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { apiPost } from "../services/api";
import CouponInput from "../components/CouponInput";
import "./cart.css";

const SAVED_DELIVERY_KEY = "saved_delivery_details";

const Checkout = () => {
  const { cartItems, getSubtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [savedDelivery, setSavedDelivery] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  useEffect(() => {
    const authRaw = localStorage.getItem("auth_user");
    const savedRaw = localStorage.getItem(SAVED_DELIVERY_KEY);

    let saved = null;
    if (savedRaw) {
      try {
        saved = JSON.parse(savedRaw);
        setSavedDelivery(saved);
      } catch {
        saved = null;
      }
    }

    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw);
        setFormData((prev) => ({
          ...prev,
          fullName: auth?.name || saved?.fullName || "",
          email: auth?.email || saved?.email || "",
          phone: saved?.phone || prev.phone,
          address: saved?.address || prev.address,
          city: saved?.city || prev.city,
          zipCode: saved?.zipCode || prev.zipCode,
        }));
        return;
      } catch {
        // ignore malformed auth payload
      }
    }

    if (saved) {
      setFormData((prev) => ({ ...prev, ...saved }));
    }
  }, []);

  const subtotal = getSubtotal();
  const discountedSubtotal = useMemo(
    () => Math.max(0, Number(subtotal || 0) - Number(couponDiscount || 0)),
    [subtotal, couponDiscount],
  );
  const shipping = discountedSubtotal > 3000 ? 0 : 100;
  const tax = Number((discountedSubtotal * 0.1).toFixed(2));
  const total = Number((discountedSubtotal + shipping + tax).toFixed(2));

  const applySavedDelivery = () => {
    if (!savedDelivery) return;
    setFormData((prev) => ({
      ...prev,
      phone: savedDelivery.phone || prev.phone,
      address: savedDelivery.address || "",
      city: savedDelivery.city || "",
      zipCode: savedDelivery.zipCode || "",
    }));
  };

  const clearSavedDelivery = () => {
    localStorage.removeItem(SAVED_DELIVERY_KEY);
    setSavedDelivery(null);
  };

  const validateForm = () => {
    const next = {};
    if (!formData.fullName.trim()) next.fullName = "Full name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    if (!formData.phone.trim()) next.phone = "Phone is required";
    if (!formData.address.trim()) next.address = "Address is required";
    if (!formData.city.trim()) next.city = "City is required";
    if (!formData.zipCode.trim()) next.zipCode = "Zip code is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const initiateEsewaPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const transactionUUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );

      const amount = Number(discountedSubtotal).toFixed(2);
      const taxAmount = Number(tax).toFixed(2);
      const totalAmount = Number(total).toFixed(2);
      const productCode = "EPAYTEST";

      const signResp = await apiPost("/orders/generate-signature", {
        total_amount: totalAmount,
        transaction_uuid: transactionUUID,
        product_code: productCode,
      });

      const signature = signResp?.signature;
      if (!signature) {
        throw new Error("Could not generate eSewa signature.");
      }

      const orderData = {
        txnCode: transactionUUID,
        customer: formData,
        items: cartItems,
        subtotal,
        discount: couponDiscount,
        coupon: appliedCoupon,
        tax,
        shipping,
        total,
        timestamp: new Date().toISOString(),
        status: "pending",
      };
      localStorage.setItem(`order_${transactionUUID}`, JSON.stringify(orderData));

      if (saveAsDefault) {
        const deliveryData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        };
        localStorage.setItem(SAVED_DELIVERY_KEY, JSON.stringify(deliveryData));
        setSavedDelivery(deliveryData);
      }

      const esewaForm = document.createElement("form");
      esewaForm.setAttribute(
        "action",
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      );
      esewaForm.setAttribute("method", "POST");

      const formFields = {
        amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUUID,
        product_code: productCode,
        product_service_charge: "0",
        product_delivery_charge: Number(shipping).toFixed(2),
        success_url: `${window.location.origin}/#checkout-success?txn=${transactionUUID}`,
        failure_url: `${window.location.origin}/#checkout-failure?txn=${transactionUUID}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      };

      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        esewaForm.appendChild(input);
      });

      document.body.appendChild(esewaForm);
      esewaForm.submit();
    } catch (err) {
      console.error(err);
      setErrors({ payment: err?.message || "Failed to initiate payment." });
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <main className="cart-content">
          <section className="cart-empty">
            <div className="empty-state">
              <p className="empty-icon">🛍️</p>
              <h2>Your cart is empty</h2>
              <p>Go back to shop and add items</p>
              <a href="#shop" className="cart-cta">
                Continue Shopping
              </a>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <main className="cart-content">
        <section className="cart-header">
          <h1>Checkout</h1>
          <p>Complete your purchase</p>
        </section>

        <section className="cart-layout">
          <div className="checkout-form">
            <h2>Delivery Information</h2>

            <div className="delivery-actions">
              <button
                type="button"
                className="delivery-btn"
                onClick={applySavedDelivery}
                disabled={!savedDelivery}
              >
                Use Saved Address
              </button>
              <button
                type="button"
                className="delivery-btn danger"
                onClick={clearSavedDelivery}
                disabled={!savedDelivery}
              >
                Clear Saved
              </button>
            </div>

            {errors.payment && (
              <div className="form-error-banner">{errors.payment}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className={errors.fullName ? "input-error" : ""}
                />
                {errors.fullName && (
                  <span className="error-text">{errors.fullName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className={errors.phone ? "input-error" : ""}
                />
                {errors.phone && (
                  <span className="error-text">{errors.phone}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter your street address"
                  className={errors.address ? "input-error" : ""}
                />
                {errors.address && (
                  <span className="error-text">{errors.address}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Enter your city"
                  className={errors.city ? "input-error" : ""}
                />
                {errors.city && (
                  <span className="error-text">{errors.city}</span>
                )}
              </div>
              <div className="form-group">
                <label>Zip Code *</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  placeholder="Enter your zip code"
                  className={errors.zipCode ? "input-error" : ""}
                />
                {errors.zipCode && (
                  <span className="error-text">{errors.zipCode}</span>
                )}
              </div>
            </div>

            <div className="save-delivery-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                />
                Save delivery details for next order
              </label>
            </div>
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <CouponInput
              totalAmount={subtotal}
              onApplyCoupon={(result) => {
                setCouponDiscount(result.discount || 0);
                setAppliedCoupon(result.code || null);
              }}
              onRemoveCoupon={() => {
                setCouponDiscount(0);
                setAppliedCoupon(null);
              }}
            />

            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>NPR {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>NPR {Number(subtotal).toFixed(2)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="summary-row discount">
                <span>Coupon {appliedCoupon ? `(${appliedCoupon})` : ""}</span>
                <span>-NPR {Number(couponDiscount).toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>NPR {tax.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `NPR ${shipping.toFixed(2)}`}</span>
            </div>

            {shipping > 0 && (
              <p className="shipping-note">Free shipping on orders over NPR 3000</p>
            )}

            <div className="summary-total">
              <span>Total Amount</span>
              <span>NPR {total.toFixed(2)}</span>
            </div>

            <button
              className="checkout-button"
              onClick={initiateEsewaPayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay with eSewa"}
            </button>

            <a href="#cart" className="continue-shopping">
              Back to Cart
            </a>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Checkout;
