import {Outlet , Link,useNavigate} from 'react-router-dom'
import { useState, useEffect } from "react";
import {AIAssistant }from '../components/AIAssistant.jsx'

const AppLayout = ()=>{

        const navigate = useNavigate();

          // load saved theme or default to light
        const [theme, setTheme] = useState(
            localStorage.getItem("app-theme") || "light"
        );

        useEffect(() => {
            localStorage.setItem("app-theme", theme);
        }, [theme]);

        const toggleTheme = () => {
            setTheme((prev) => (prev === "light" ? "dark" : "light"));
        };

        const logout = ()=>{
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login');
        }
    return(
        <div className="app-shell" data-theme={theme}>
            <header className="app-header">
                <div className="app-header-inner">
                    <Link className="brand" to='/app/groups'>
                    Group Dashboard
                    </Link>
                <nav className="header-nav">
                    <button type="button" onClick={toggleTheme} aria-label="Toggle theme">
                     {theme === "light" ? "Dark" : "Light"}
                    </button>
                    <Link className="link" to='/app/profile'>
                    Profile
                    </Link>
                    <button type="button" onClick={logout}>
                        Logout
                    </button>
                </nav>
                </div>

            </header>
            <main className="container">
                 <Outlet/>
            </main>
           
            <AIAssistant/>
        </div>
    )
}
export default AppLayout;