
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowedRoles?: string[];
}
//Czy uzytkownik ma token auth w localStorage
//Jesli token istnieje -> renderuje zawarosc (Outlet/children)
//Jesli token nie istnieje -> przekierowuje na strone logowania

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    let role = localStorage.getItem('role');

    if (import.meta.env.NODE_ENV === 'development' && allowedRoles?.includes('admin')) {
        role = 'admin';
    }
    if(!token)
    {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && allowedRoles.includes(role!)) {
        return <Navigate to="/" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
}

