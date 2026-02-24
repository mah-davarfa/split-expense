import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedRoute = () => {
  const { isUserAuthenticated, isLoading, getToken } = useAuth();
  const token = getToken();

  if (isLoading) return <LoadingSpinner label="Checking session..." />;
  if (!isUserAuthenticated || !token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;