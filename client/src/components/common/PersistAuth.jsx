import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, selectIsAuthenticated } from "../../store/slices/authSlice";
import { useGetProfileQuery } from "../../store/api/authApi";
import { getCookie } from "./Services";

/**
 * PersistAuth — Restores Redux auth state from cookies on page load/refresh.
 * 
 * Problem: After login, the server sets X_AS-TOKEN cookie. On page refresh,
 * Redux state is lost (user=null, isAuthenticated=false). This component
 * detects the cookie and re-fetches the profile to restore the session.
 */
const PersistAuth = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hasCookie = !!getCookie("X_AS-TOKEN");

  // Only fetch profile if cookie exists but Redux state was lost
  const { data, isLoading, isSuccess } = useGetProfileQuery(undefined, {
    skip: isAuthenticated || !hasCookie,
  });

  const [isRestoring, setIsRestoring] = useState(hasCookie && !isAuthenticated);

  useEffect(() => {
    if (isSuccess && data?.userData) {
      dispatch(setCredentials({ user: data.userData, token: null }));
    }
    // After query completes (success or not), we're done restoring
    if (!isLoading && isRestoring) {
      setIsRestoring(false);
    }
  }, [isSuccess, data, isLoading, isRestoring, dispatch]);

  // Show a loading spinner while restoring session
  if (isRestoring && isLoading) {
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
