import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { apiPost } from "../services/api";
import "./cart.css";

const CheckoutCallback = () => {
  const { clearCart } = useCart();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Processing your payment...");
  const [orderDetails, setOrderDetails] = useState(null);

  const isProcessing = useRef(false);
  const processedTxns = useRef(new Set());

  useEffect(() => {
    const processPayment = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        const hash = window.location.hash || "";
        const search = window.location.search || "";
        const combined = `${hash}${search}`;

        const isSuccess =
          hash.includes("#checkout-success") || combined.includes("checkout-success");
        const txnMatch = combined.match(/txn=([^&?#]+)/);
        const txnCode = txnMatch ? decodeURIComponent(txnMatch[1]) : null;

        if (!txnCode) {
          setStatus("failed");
          setMessage("Invalid transaction code.");
          return;
        }

        if (processedTxns.current.has(txnCode)) return;
        processedTxns.current.add(txnCode);

        const orderKey = `order_${txnCode}`;
        let raw = localStorage.getItem(orderKey);
        if (!raw) {
          const key = Object.keys(localStorage).find(
            (k) => k.toLowerCase() === orderKey.toLowerCase(),
          );
          if (key) raw = localStorage.getItem(key);
        }

        if (!raw) {
          setStatus("failed");
          setMessage("Order not found. Please contact support.");
          return;
        }

        const order = JSON.parse(raw);
        setOrderDetails(order);

        if (!isSuccess) {
          setStatus("failed");
          setMessage("Payment was not completed. Please try again.");
          localStorage.removeItem(orderKey);
          return;
        }

        if (order && (order.service_id || order.expert_id)) {
          try {
            const consultResp = await apiPost("/consultations/book", {
              ...order,
              payment_status: "Paid",
              payment_reference: txnCode,
            });

            if (consultResp?.appointment) {
              setStatus("success");
              setMessage("Consultation booked successfully.");
              localStorage.removeItem(orderKey);
            } else {
              setStatus("pending");
              setMessage("Payment received. Booking is being processed.");
            }
          } catch (err) {
            console.error("Failed to create consultation after payment", err);
            setStatus("error");
            setMessage("Payment received but booking failed. Contact support.");
          }
          return;
        }

        try {
          const resp = await apiPost("/orders/verify-payment", {
            txn_code: txnCode,
            order,
          });

          if (resp?.success) {
            clearCart();
            localStorage.removeItem(orderKey);
            setStatus("success");
            setMessage("Payment successful! Your order has been placed.");

            const confirmed = {
              ...order,
              status: "completed",
              verifiedAt: new Date().toISOString(),
            };
            localStorage.setItem(
              `order_confirmed_${txnCode}`,
              JSON.stringify(confirmed),
            );
          } else {
            setStatus("pending");
            setMessage("Payment received. Order confirmation is being processed.");
          }
        } catch (err) {
          console.warn("Backend verification failed, using fallback", err);
          clearCart();
          localStorage.removeItem(orderKey);
          setStatus("success");
          setMessage("Payment received! Your order has been placed.");
        }
      } catch (err) {
        console.error("Payment callback error", err);
        setStatus("error");
        setMessage("An error occurred while processing your payment.");
      } finally {
        isProcessing.current = false;
      }
    };

    processPayment();

    return () => {
      isProcessing.current = false;
    };
  }, [clearCart]);

  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      const isConsultation = Boolean(
        orderDetails?.service_id || orderDetails?.expert_id,
      );
      window.location.hash = isConsultation ? "#account" : "#dashboard";
    }, 2500);

    return () => clearTimeout(timer);
  }, [status, orderDetails]);

  return (
    <div className="cart-page">
      <main className="cart-content">
        <section className="payment-status">
          {status === "loading" && (
            <div className="status-content">
              <div className="status-spinner">⏳</div>
              <h1>{message}</h1>
            </div>
          )}

          {status === "success" && (
            <div className="status-content success">
              <div className="status-icon">✓</div>
              <h1>Payment Successful!</h1>
              <p>{message}</p>

              {orderDetails && (
                <div className="order-confirmation">
                  <h2>Order Details</h2>
                  <div className="confirmation-row">
                    <span>Order Date:</span>
                    <span>
                      {new Date(
                        orderDetails.timestamp || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="confirmation-row">
                    <span>Transaction ID:</span>
                    <span className="txn-code">{orderDetails.txnCode || "-"}</span>
                  </div>
                  <div className="confirmation-row">
                    <span>Total Amount:</span>
                    <span>NPR {Number(orderDetails.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="confirmation-actions">
                <a href="#dashboard" className="action-button primary">
                  Go to Dashboard
                </a>
                <a href="#shop" className="action-button secondary">
                  Continue Shopping
                </a>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="status-content pending">
              <div className="status-icon">⏱️</div>
              <h1>Order Processing</h1>
              <p>{message}</p>
              <a href="#dashboard" className="action-button primary">
                Go to Dashboard
              </a>
            </div>
          )}

          {status === "failed" && (
            <div className="status-content failed">
              <div className="status-icon">✗</div>
              <h1>Payment Failed</h1>
              <p>{message}</p>
              <div className="failed-actions">
                <a href="#checkout" className="action-button primary">
                  Try Again
                </a>
                <a href="#cart" className="action-button secondary">
                  Back to Cart
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="status-content error">
              <div className="status-icon">⚠️</div>
              <h1>Error</h1>
              <p>{message}</p>
              <a href="#dashboard" className="action-button primary">
                Back Home
              </a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CheckoutCallback;
