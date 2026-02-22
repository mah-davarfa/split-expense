import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const ProtectedRoute = () => {
  const { isUserAuthenticated, isLoading } = useAuth();
  const token = localStorage.getItem("token");

  if (isLoading) return <div>Loading...</div>;
  if (!isUserAuthenticated || !token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;