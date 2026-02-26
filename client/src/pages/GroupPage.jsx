
import { NavLink,Outlet } from "react-router-dom";


const GroupPage = ()=>{
    
  

    const tabStyle = ({ isActive }) => ({
        padding: "8px 10px",
        borderRadius: 8,
        textDecoration: "none",
        background: isActive ? "#ddd" : "transparent",
  });

    return(
        <div>

            <div>
                <NavLink to="" end style={tabStyle}>
                    Members
                </NavLink>  
                <NavLink to='expenses' style={tabStyle}>
                    Expenses
                </NavLink>
                <NavLink to='balances' style={tabStyle}>
                    Balances
                </NavLink>
            </div>
            <div>
             <Outlet/>
            </div>

        </div>
        
    )
}
export default GroupPage;