import { Outlet, Link, useLocation } from "react-router-dom";

const PublicLayout = () => {
  const { pathname } = useLocation();

  const isLanding = pathname === "/";
  const isAuth = pathname === "/login" || pathname === "/signup";

  // Landing stays custom (no header)
  if (isLanding) return <Outlet />;

  // Login/Signup: render the header INSIDE the auth card
  if (isAuth) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <header className="auth-header">
            <Link className="auth-navlink" to="/">Home</Link>
            <Link className="auth-navlink" to="/login">Login</Link>
            <Link className="auth-navlink" to="/signup">Signup</Link>
          </header>

          <Outlet />
        </div>
      </div>
    );
  }

  // Other public pages (if  add any later)
  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </header>

      <Outlet />
    </div>
  );
};

export default PublicLayout;