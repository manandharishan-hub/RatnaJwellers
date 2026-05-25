import { useState } from "react";
import { apiPost } from "../services/api";
import "./auth.css";

const Signup = () => {
  const [step, setStep] = useState("email"); // "email", "register", or "otp"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/otp/send", { email });
      setMessage("OTP sent to your email!");
      setStep("register");
    } catch (err) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Verify data before submission
      if (!username || !email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (!otp || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        setLoading(false);
        return;
      }

      // Register with OTP verification
      const result = await apiPost("/auth/register", {
        username,
        email,
        password,
        otp_code: otp,
      });

      setMessage("Account created and email verified! Logging you in...");
      localStorage.setItem("auth_user", JSON.stringify(result.user));

      setTimeout(() => {
        const next = result?.user?.role === "admin" ? "#admin" : "#dashboard";
        window.location.hash = next;
      }, 1500);
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {step === "email" ? (
          <form className="auth-card" onSubmit={handleSendOtp}>
            <h1 className="auth-title">Create Account</h1>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Enter your email to get started
            </p>

            {message && <p className="auth-alert success">{message}</p>}
            {error && <p className="auth-alert error">{error}</p>}

            <p className="auth-subtitle">Email</p>
            <input
              className="auth-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
            />

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>

            <div className="auth-links">
              <a href="#login">Already have an account?</a>
            </div>
          </form>
        ) : (
          <form className="auth-card" onSubmit={handleSubmit}>
            <h1 className="auth-title">Complete Sign Up</h1>

            {message && <p className="auth-alert success">{message}</p>}
            {error && <p className="auth-alert error">{error}</p>}

            <p className="auth-subtitle">User name</p>
            <input
              className="auth-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              disabled={loading}
            />

            <p className="auth-subtitle">Email</p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                className="auth-input"
                type="email"
                value={email}
                disabled
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="auth-button auth-button-secondary"
                onClick={() => {
                  setStep("email");
                  setEmail("");
                  setOtp("");
                }}
                disabled={loading}
                style={{ flex: 0, padding: "8px 12px", fontSize: "12px" }}
              >
                Change
              </button>
            </div>

            <p className="auth-subtitle">Password</p>
            <input
              className="auth-input"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
            />

            <p className="auth-subtitle">OTP Code</p>
            <input
              className="auth-input"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              disabled={loading}
              maxLength="6"
              style={{ fontSize: "20px", letterSpacing: "8px", textAlign: "center" }}
            />

            <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
              Check your email for the OTP (valid for 10 minutes)
            </p>

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              className="auth-button auth-button-secondary"
              type="button"
              onClick={() => {
                setLoading(true);
                apiPost("/auth/otp/send", { email })
                  .then(() => {
                    setMessage("OTP resent to your email");
                    setOtp("");
                  })
                  .catch((err) => {
                    setError(err?.message || "Failed to resend OTP");
                  })
                  .finally(() => setLoading(false));
              }}
              disabled={loading}
            >
              Resend OTP
            </button>

            <div className="auth-links">
              <a href="#login">Already have an account?</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
