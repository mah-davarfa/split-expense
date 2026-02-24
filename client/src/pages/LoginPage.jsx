import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const LoginPage = ()=>{
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState("");

    const {login} = useAuth();

    const handleSubmit = async(e)=>{
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
    <div>
      <h2>Login page</h2>

      <ErrorBanner message={error} onClose={() => setError("")} />

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled={submitting}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={submitting}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        {submitting && <LoadingSpinner label="Logging you in..." />}
      </form>
    </div>
  );
};
export default LoginPage;