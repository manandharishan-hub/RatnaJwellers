import { useState } from "react";
import { apiPost } from "../services/api";
import "./login-otp.css";

const LoginOTP = () => {
  const [step, setStep] = useState("email"); // "email" or "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost("/auth/otp/send", { email });
      setMessage("OTP sent to your email! Check your inbox.");
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost("/auth/otp/verify", { email, otp_code: otp });
      setMessage("Login successful! Redirecting...");
      // Store user and redirect
      localStorage.setItem("user", JSON.stringify(response.user));
      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-otp-container">
      <div className="login-otp-card">
        <h1>eComerce Login</h1>
        <p>Secure login with OTP</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {step === "email" ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <p className="info-text">
              We'll send a 6-digit OTP code to your email
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Email: {email}</label>
              <button
                type="button"
                className="btn-link"
                onClick={() => setStep("email")}
              >
                Change email
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="otp">OTP Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                disabled={loading}
                className="otp-input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="info-text">
              Check your email for the 6-digit code (valid for 10 minutes)
            </p>
            <button
              type="button"
              className="btn-link"
              onClick={handleSendOtp}
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="footer-links">
          <button
            className="btn-link"
            onClick={() => (window.location.hash = "#register")}
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginOTP;
