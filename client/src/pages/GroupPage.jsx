
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

            <div className="tabs">
                <NavLink to="" end className={({ isActive }) =>
                    isActive ? "tab tab-active" : "tab"
                }>
                    Members
                </NavLink>  
                <NavLink to='expenses' className={({ isActive }) =>
                        isActive ? "tab tab-active" : "tab"
                    }
                >
                    Expenses
                </NavLink>
                <NavLink to='balances' 
                className={({ isActive }) =>
                    isActive ? "tab tab-active" : "tab"
                }
                >
                    Balances
                </NavLink>
            </div>
            
             <Outlet/>
           

        </div>
        
    )
}
export default GroupPage;