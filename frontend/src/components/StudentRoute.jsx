import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Loading student portal..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStudent) {
    // If admin is logged in, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default StudentRoute;
