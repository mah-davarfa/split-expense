import { useNavigate } from "react-router-dom";
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>LandingPage</h2>
      <h3>Split Bill Not FriendShips</h3>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/signup")}>Signup</button>
    </div>
  );
};
export default LandingPage;