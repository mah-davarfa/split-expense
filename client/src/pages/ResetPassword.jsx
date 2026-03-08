import {  useState,useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";

const ResetPassword=()=>{
   
    const navigate = useNavigate();
    const{sendResetPassword}=useAuth()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword]= useState('');
    const [confirmPassword,setConfirmPassword]=useState("");
    const [submitting, setSubmitting] = useState(false);
   const [success, setSuccess] = useState(false);

    const [params] = useSearchParams();
    const token = params.get("token");

    useEffect(() => {
        if (!success) return;

        const id = setTimeout(() => {
          navigate("/login");

        }, 2000);

        return () => clearTimeout(id);
    }, [success, navigate]);

    const sendHandler = async(e)=>{
            e.preventDefault();
        
        setError("");
       if (!token) {
            setError("Reset Password token is missing. Please open the Reset password link again.");
            setLoading(false);
          return;
        }

        if (!password.trim() || !confirmPassword.trim()) {
            setError("Both password fields are required.");
          return;
            }
        if(password.trim().length < 5) {
              setError("Password must be at least 5 characters.");
         return;
        }   
        if(password.trim() !== confirmPassword.trim()){
            setError('Password and Confirm Password is not Match!!')
          return       
            }

      
        try {
          setSubmitting(true);
          setLoading(true);
          setError("");

          await sendResetPassword({ password: password.trim(), token });
          setSuccess(true);
          setPassword("");
          setConfirmPassword("");
        } catch (err) {
          setError(err.message || "Failed to Reset.");
        } finally {
          setLoading(false);
          setSubmitting(false);
        }
   }

      

return(
    <>    
   
   <div>
     <ErrorBanner message={error} onClose={()=>setError('')}/>  
   {!success &&(
            <form
    className="auth-form"
    onSubmit={sendHandler}
    >
        <input
        className="auth-input"
        value={password}
        placeholder="Enter New Password"
        onChange={(e)=>setPassword(e.target.value)}
        required
        disabled={submitting}
        type="password"
        />
        <input
        className="auth-input"
        value={confirmPassword}
        placeholder="Confirm New Password"
        onChange={(e)=>setConfirmPassword(e.target.value)}
        required
        disabled={submitting}
        type="password"
        />
       <button 
          className="landing-btn landing-btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Reseting ..." : "Reseting Password"}
        </button>

        {submitting && (
          <LoadingSpinner
            label="Reseting ..."
            style={{ padding: 12, color: "yellow" }}
          />
        )}
    </form>
      )}

      {success && (
          <div className="auth-success">
            Password reset successful! Redirecting to login...
          </div>
        )}
    </div>         
   
       
    </>
    )
}
export default ResetPassword;