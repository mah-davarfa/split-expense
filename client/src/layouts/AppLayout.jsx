import {Outlet , Link,useNavigate} from 'react-router-dom'
import {AIAssistant }from '../components/AIAssistant.jsx'

const AppLayout = ()=>{

        const navigate = useNavigate();

        const logout = ()=>{
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login');
        }
    return(
        <div className="app-shell">
            <header className="app-header">
                <div className="app-header-inner">
                    <Link to='/app/groups'>Group Dashboard</Link>
                <nav className="header-nav">
                    <Link to='/app/profile'>Profile</Link>
                    <button onClick={logout}>Logout</button>
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