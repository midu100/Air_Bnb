import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import { selectIsAuthenticated, selectCurrentUser } from "../../store/slices/authSlice";

/**
 * ProtectedRoute — Guards routes that require authentication.
 * 
 * @param {string[]} allowedRoles - Optional. If provided, only users with
 *   matching roles can access the route (e.g., ["admin", "host"]).
 *   If not provided, any authenticated user can access.
 * @param {string} redirectTo - Where to redirect if not authenticated. Default: "/login"
 */
const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/login" }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  // Not logged in → redirect to login page, preserving the attempted URL
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to home
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
