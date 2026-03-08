import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { invitesApi } from "../api/invites.api.js";

export default function InviteAcceptPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { getToken, isUserAuthenticated, isLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      sessionStorage.setItem("inviteToken", tokenFromUrl);
    }

    const storedInvite = sessionStorage.getItem("inviteToken");

    if (!storedInvite) {
      setError("Invite token is missing. Please open the invite link again.");
      setPageLoading(false);
      return;
    }

    // Wait until auth status is fully known
    if (isLoading) {
      setPageLoading(true);
      return;
    }

    // Not authenticated: show instructions instead of instant redirect
    if (!isUserAuthenticated || !getToken()) {
      setPageLoading(false);
      return;
    }

    // Authenticated: accept invite automatically
    const acceptInvite = async () => {
      try {
        setPageLoading(true);
        setError("");
        setSuccessMessage("");

        const authToken = getToken();
        const res = await invitesApi.accept(authToken, storedInvite);

        sessionStorage.removeItem("inviteToken");
        setSuccessMessage("Invitation accepted. Redirecting to your group...");

        setTimeout(() => {
          navigate(`/app/groups/${res.GroupId}`);
        }, 1500);
      } catch (err) {
        setError(err.message || "Failed to accept invite.");
      } finally {
        setPageLoading(false);
      }
    };

    acceptInvite();
  }, [params, navigate, getToken, isUserAuthenticated, isLoading]);

  const pendingInvite = sessionStorage.getItem("inviteToken");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <Link className="auth-navlink" to="/">
            Home
          </Link>
          <Link className="auth-navlink" to="/login">
            Login
          </Link>
          <Link className="auth-navlink" to="/signup">
            Signup
          </Link>
        </header>

        <div className="stack">
          <h2 className="m-0">Group Invitation</h2>

          {error && <ErrorBanner message={error} onClose={() => setError("")} />}

          {pageLoading && <LoadingSpinner label="Processing invite..." />}

          {!pageLoading && !error && successMessage && (
            <div className="auth-success">{successMessage}</div>
          )}

          {!pageLoading && !error && !successMessage && pendingInvite && !isUserAuthenticated && (
            <div className="stack">
              <p className="auth-foot">
                You’ve been invited to join a group.
              </p>
              <p className="auth-foot">
                Log in to accept the invitation. New here? Create an account first,
                and the invitation will continue automatically after signup.
              </p>

              <div className="stack">
                <button
                  type="button"
                  className="landing-btn landing-btn-primary"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </button>

                <button
                  type="button"
                  className="landing-btn landing-btn-secondary"
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}