import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import { Link } from "react-router-dom";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !passwordConfirm) {
      setError("All fields are required.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await signup(name, email, password);
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="auth-head">
        <div className="auth-badge" aria-hidden="true">
          +
        </div>
      </div>

      <ErrorBanner message={error} onClose={() => setError("")} />

      <form className="auth-form" onSubmit={handleSignup}>
        <label className="auth-label">
          Name
          <input
            className="auth-input"
            type="text"
            placeholder="Your name"
            value={name}
            disabled={submitting}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

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

        <label className="auth-label">
          Confirm password
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            disabled={submitting}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="landing-btn landing-btn-primary"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        {submitting && <LoadingSpinner label="Creating your account..." />}

        <p className="auth-foot">
          Already have an account?{" "}
          <Link className="auth-link" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </>
  );
};

export default SignupPage;