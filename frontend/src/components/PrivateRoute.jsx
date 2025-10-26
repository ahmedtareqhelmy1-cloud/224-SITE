import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Auth removed: always allow access
  return children;
};

export default PrivateRoute;