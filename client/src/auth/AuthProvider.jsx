import {useContext,createContext,useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/auth.api";

const AuthContext = createContext();
   
const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const [isLoading,setIsLoading]=useState(true)
    const [isUserAuthenticated,setIsUserAuthenticated] = useState(false);

   const navigate= useNavigate();

    useEffect(()=>{
        checkAuth();
    },[])

    const afterAuthRedirect = () => {
        const pendingInvite= sessionStorage.getItem('inviteToken')
        if(pendingInvite){
             navigate("/invite");
        }else{
            navigate("/app");
        }
    }
       
    const checkAuth = async () => {
        const token = localStorage.getItem("token");

        // No token: user is simply logged out, stay on public pages
        if (!token) {
        setUser(null);
        setIsUserAuthenticated(false);
        setIsLoading(false);
        return;
        }

        try {
            setIsLoading(true);
            const data = await authApi("/auth/me", { method: "GET", token });

        if (!data.user) {
            // token invalid/expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsUserAuthenticated(false);
            return;
        }

            setUser(data.user);
            setIsUserAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(data.user));

        } catch (err) {
            // request failed => treat as logged out
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsUserAuthenticated(false);
            
        } finally {
        setIsLoading(false);
        }
    };



    const login = async(email,password)=>{
        try{
        const data = await authApi('/login',{body:{email,password}});
        const {token,user} = data;

        localStorage.setItem('token',token);
        localStorage.setItem('user',JSON.stringify(user));

        setIsUserAuthenticated(true);
        setUser(user);
        afterAuthRedirect()

        }catch(err){
            throw err;
        }

    }

    const signup = async(name,email,password)=>{

        try{
        const data = await authApi('/signup',{body:{name,email,password}});
        const {token,user} = data;

        localStorage.setItem('token',token);
        localStorage.setItem('user',JSON.stringify(user));

        setIsUserAuthenticated(true);
        setUser(user);
        afterAuthRedirect()

        }catch(err){
            throw err;
        }

    }

    const logout = ()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsUserAuthenticated(false);
        setUser(null);
        navigate('/login')
    }
    
    const getToken = () => localStorage.getItem("token");
    return(
        <AuthContext.Provider value={{
            login,
            signup,
            logout,
            isUserAuthenticated,
            isLoading,
            user,
            getToken
        }}>
            {children}
        </AuthContext.Provider>
    )

}

  export  const useAuth = ()=>{
        return useContext(AuthContext);
    }

export default AuthProvider;