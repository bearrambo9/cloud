import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function UnprotectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (!isExpired) {
      return <Navigate to="/" replace />;
    } else if (isExpired) {
      localStorage.removeItem("token");
    }
  }

  return children;
}

export default UnprotectedRoute;
