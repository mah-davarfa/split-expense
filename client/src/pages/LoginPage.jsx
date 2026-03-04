import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      setPassword("");
      setEmail("");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="auth-head">
        <div className="auth-badge" aria-hidden="true">
          $
        </div>
      </div>

      <ErrorBanner message={error} onClose={() => setError("")} />

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={password}
            disabled={submitting}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="landing-btn landing-btn-primary login-submit"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>

        {submitting && <LoadingSpinner label="Logging you in..." />}

        <p className="auth-foot">
          Don’t have an account?{" "}
          <Link className="auth-link" to="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </>
  );
};

export default LoginPage;