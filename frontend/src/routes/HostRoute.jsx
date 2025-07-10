// routes/HostRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HostRoute = () => {
  const { user, token } = useAuth();

  if (!token || user?.role !== "host") {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default HostRoute;
