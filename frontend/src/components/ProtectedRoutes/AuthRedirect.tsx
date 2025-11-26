import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

export const AuthRedirect: React.FC = () => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (token && role === 'student') {
        return <Navigate to="/student-dashboard" replace />;
    }
    if (token && role === 'lecturer') {
        return <Navigate to="/lecturer-dashboard" replace />;
    }

    return <Outlet />;
}