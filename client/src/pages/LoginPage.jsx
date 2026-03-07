import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [forgotError, setForgotError] = useState("");

  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const { login,sendForgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true)
      await login(email, password);
      setPassword("");
      setEmail("");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
  };

  const sendForgotPasswordEmail = async (e) => {
    e.preventDefault();
    setEmailSubmitting(true);
    setForgotError("");
    if (
      !forgotPasswordEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        forgotPasswordEmail.trim().toLowerCase(),
      )
    ) {
      setForgotError("Enter a valid email address.");
      setEmailSubmitting(false);
      return;
    }

    try {
     
      //fetch
      await sendForgotPassword(forgotPasswordEmail)
      setForgotPassword(false);
      setForgotPasswordSent(true);
      setForgotPasswordEmail("");
    } catch (err) {
      setForgotError(err.message || "Sending Email failed. try Again");
    } finally {
      setEmailSubmitting(false);
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
      {forgotPasswordSent ? (
       <p className="auth-foot">Check your email for reset instructions.</p>
      ) : (
        <span
          role="button"
          tabIndex={0}
          onClick={handleForgotPassword}
          className="auth-link"
          style={{cursor:'pointer'}}
        >
          Forgot PassWord
        </span>
      )}

      {forgotPassword && (
        <Modal
          title="Forgot Password"
          onClose={() => {
            setForgotPassword(false);
          }}
          
        >
          <form
          style={{ backgroundColor: "#0b3b2a", borderRadius: 12, padding: 12 }}
          onSubmit={sendForgotPasswordEmail}>
             
              <p >Enter your email and we’ll send reset instructions.</p>
              <input
              value={forgotPasswordEmail}
              placeholder="Enter your Email"
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              
              disabled={emailSubmitting}
           />
           

            <button
              type="submit"
              disabled={emailSubmitting}
              className="landing-btn landing-btn-primary login-submit"
            >
              {emailSubmitting ? "Sending Email..." : "Send email"}
            </button>
            {emailSubmitting && <LoadingSpinner label="Sending Email..." />}
             
          </form>
          <ErrorBanner message={forgotError} onClose={() => setForgotError("")} />
        </Modal>
      )}
    </>
  );
};

export default LoginPage;
