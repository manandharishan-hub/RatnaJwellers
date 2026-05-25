import { useState } from "react";
import { apiPost } from "../services/api";
import "./auth.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await apiPost("/auth/login", {
        identifier,
        password,
      });
      if (result?.user) {
        localStorage.setItem("auth_user", JSON.stringify(result.user));
      }
      setMessage(result?.message || "Login successful.");
      const next = result?.user?.role === "admin" ? "#admin" : "#dashboard";
      window.location.hash = next;
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1 className="auth-title">Sign in</h1>

          {message && <p className="auth-alert success">{message}</p>}
          {error && <p className="auth-alert error">{error}</p>}

          <p className="auth-subtitle">User name or email</p>
          <input
            className="auth-input"
            type="text"
            placeholder="Enter your username or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />

          <p className="auth-subtitle">Password</p>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <label className="auth-remember">
            <input type="checkbox" />
            <span>Keep me logged in</span>
          </label>

          <div className="auth-links">
            <a href="#signup">Register</a>
            <span>•</span>
            <a href="#forgot">Password reset</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
