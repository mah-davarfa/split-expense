import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { invitesApi } from "../api/invites.api.js";

export default function InviteAcceptPage() {

     const [params] = useSearchParams();
    const navigate = useNavigate();
    const { user, getToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(()=>{
        const tokenFromUrl = params.get("token");

      if (tokenFromUrl) {
        sessionStorage.setItem("inviteToken", tokenFromUrl);
        }

        const authToken = getToken();
        const storedInvite = sessionStorage.getItem("inviteToken");
    
        //NOT login or signup yet then redirect
        if (!authToken) {
        setLoading(false);
        navigate("/login")
        return
        }

        //logged in but no invite token
        if (!storedInvite) {
        setError("Invite token is missing. Please open the invite link again.");
        setLoading(false);
        return;
        }

        //user already logedin has invite token then accepting
        (async()=>{
            try{

            setLoading(true);
            setError("");

            const res = await invitesApi.accept(authToken, storedInvite);

            sessionStorage.removeItem("inviteToken");

            navigate(`/app/groups/${res.GroupId}`);

            }catch(err){
                setError(err.message ||  "Failed to accept invite.")
            }finally{
                setLoading(false)
            }
        })()

    },[params, user, navigate])

     return (
    <div style={{ padding: 16 }}>
      <h2>Accepting invitation…</h2>
      {error && <ErrorBanner message={error} onClose={() => setError("")} />}
      {loading && <LoadingSpinner label="Processing invite..." />}
    </div>
  );
}