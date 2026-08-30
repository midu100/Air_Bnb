import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, selectIsAuthenticated } from "../../store/slices/authSlice";
import { useGetProfileQuery } from "../../store/api/authApi";

/**
 * PersistAuth — Restores Redux auth state on page load/refresh.
 *
 * The auth cookie is httpOnly, so the browser can no longer tell us whether a session
 * exists. We ask the server once on mount instead and treat a 401 as "logged out".
 */
const PersistAuth = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data, isLoading, isSuccess } = useGetProfileQuery(undefined, {
    skip: isAuthenticated,
  });

  useEffect(() => {
    if (isSuccess && data?.userData) {
      dispatch(setCredentials({ user: data.userData, token: null }));
    }
  }, [isSuccess, data, dispatch]);

  // Hold the app back until Redux reflects the answer. Rendering children the
  // moment the request resolves gives ProtectedRoute one pass where
  // isAuthenticated is still false, which bounces the user to /login on refresh.
  if (isLoading || (isSuccess && !isAuthenticated)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f0f0f',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return children;
};

export default PersistAuth;
