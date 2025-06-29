import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-10">Checking auth...</div>;

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
