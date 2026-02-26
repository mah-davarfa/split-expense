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
        <div>
            <header>
                <Link to='/app/groups'>FairShare</Link>
                <nav>
                    <Link to='/app/profile'>Profile</Link>
                    <button onClick={logout}>Logout</button>
                </nav>
            </header>
            <Outlet/>
            <AIAssistant/>
        </div>
    )
}
export default AppLayout;