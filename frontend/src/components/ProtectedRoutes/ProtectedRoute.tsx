import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}
//Czy uzytkownik ma token auth w localStorage
//Jesli token istnieje -> renderuje zawarosc (Outlet/children)
//Jesli token nie istnieje -> przekierowuje na strone logowania

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('authToken');

    if(!token)
    {
        return <Navigate to="/login" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
}

export const AuthRedirect: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('authToken');

    if (token) {
        return <Navigate to="/dashboard" replace/>;
    }
    return children ? <>{children}</> : <Outlet/>;
};

