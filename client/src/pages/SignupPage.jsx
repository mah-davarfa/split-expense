import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const SignupPage = ()=>{
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [passwordConfirm,setPasswordConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const {signup} = useAuth();

    const handleSignup = async(e)=>{
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
    <div>
      <h2>Signup page</h2>

      <ErrorBanner message={error} onClose={() => setError("")} />

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          disabled={submitting}
          onChange={(e) => setName(e.target.value)}
        />
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
        <input
          type="password"
          placeholder="Confirm password"
          value={passwordConfirm}
          disabled={submitting}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Signup"}
        </button>

        {submitting && <LoadingSpinner label="Creating your account..." />}
      </form>
    </div>
  );
};
export default SignupPage;