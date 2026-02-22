import {Outlet , Link} from 'react-router-dom'

const PublicLayout = ()=>{

    return(
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </header>

      <Outlet />
    </div>
    )
}
export default PublicLayout;